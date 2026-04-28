// ============================================================
// ROUTE: /api/borrowings — Borrow, Return, List
// ============================================================
const router = require('express').Router();
const db     = require('../db');

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

const FINE_RATE = 10; // ₹10 per day overdue

// GET /api/borrowings — all borrowings with full details
router.get('/', requireAuth, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT br.borrow_id, br.borrow_date, br.due_date, br.return_date, br.status,
             b.title AS book_title,
             br.book_id,
             m.first_name || ' ' || m.last_name AS member_name,
             br.member_id,
             s.first_name || ' ' || s.last_name AS staff_name,
             br.staff_id,
             f.amount AS fine_amount,
             f.paid AS fine_paid,
             f.fine_id
      FROM borrowings br
      JOIN books    b ON br.book_id   = b.book_id
      JOIN members  m ON br.member_id = m.member_id
      LEFT JOIN staff s ON br.staff_id = s.staff_id
      LEFT JOIN fines f ON f.borrow_id = br.borrow_id
      ORDER BY br.borrow_id DESC
    `).all();
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST /api/borrowings — issue a book
router.post('/', requireAuth, (req, res) => {
  const { book_id, member_id, due_date } = req.body;
  if (!book_id || !member_id || !due_date)
    return res.status(400).json({ error: 'book_id, member_id and due_date are required' });

  try {
    // Check availability
    const book = db.prepare('SELECT available_copies, title FROM books WHERE book_id = ?').get(book_id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.available_copies < 1) return res.status(400).json({ error: 'No copies available' });

    // Check member has no overdue books
    const overdue = db.prepare(
      "SELECT COUNT(*) as c FROM borrowings WHERE member_id=? AND status='Overdue'"
    ).get(member_id).c;
    if (overdue > 0) return res.status(400).json({ error: 'Member has overdue books. Please return them first.' });

    const staff_id = req.session.user?.staffId || 1;
    const today = new Date().toISOString().split('T')[0];

    const result = db.prepare(`
      INSERT INTO borrowings (book_id, member_id, staff_id, borrow_date, due_date, status)
      VALUES (?, ?, ?, ?, ?, 'Borrowed')
    `).run(book_id, member_id, staff_id, today, due_date);

    // Decrement available copies
    db.prepare('UPDATE books SET available_copies = available_copies - 1 WHERE book_id = ?').run(book_id);

    db.prepare("INSERT INTO audit_log (action, table_name, record_id, details) VALUES (?,?,?,?)")
      .run('BORROW', 'borrowings', result.lastInsertRowid, `Issued "${book.title}" to member ${member_id}`);

    res.json({ success: true, borrow_id: result.lastInsertRowid });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/borrowings/:id/return — return a book + auto fine
router.put('/:id/return', requireAuth, (req, res) => {
  const id = req.params.id;
  try {
    const borrow = db.prepare('SELECT * FROM borrowings WHERE borrow_id = ?').get(id);
    if (!borrow) return res.status(404).json({ error: 'Borrowing record not found' });
    if (borrow.status === 'Returned') return res.status(400).json({ error: 'Already returned' });

    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(borrow.due_date);
    const returnDate = new Date(today);
    const daysOverdue = Math.max(0, Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24)));
    const fineAmount = daysOverdue * FINE_RATE;

    // Update borrowing status
    db.prepare(`
      UPDATE borrowings SET return_date = ?, status = 'Returned' WHERE borrow_id = ?
    `).run(today, id);

    // Restore book copy
    db.prepare('UPDATE books SET available_copies = available_copies + 1 WHERE book_id = ?')
      .run(borrow.book_id);

    let fine = null;
    // Create fine if overdue
    if (fineAmount > 0) {
      const existingFine = db.prepare('SELECT fine_id FROM fines WHERE borrow_id = ?').get(id);
      if (!existingFine) {
        const fineResult = db.prepare(`
          INSERT INTO fines (borrow_id, amount, paid, fine_date) VALUES (?, ?, 0, ?)
        `).run(id, fineAmount, today);
        fine = { fine_id: fineResult.lastInsertRowid, amount: fineAmount, days_overdue: daysOverdue };
      }
    }

    db.prepare("INSERT INTO audit_log (action, table_name, record_id, details) VALUES (?,?,?,?)")
      .run('RETURN', 'borrowings', id, `Returned book. Days overdue: ${daysOverdue}, Fine: ₹${fineAmount}`);

    res.json({ success: true, days_overdue: daysOverdue, fine_amount: fineAmount, fine });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/borrowings/available-books — books with copies > 0
router.get('/available-books', requireAuth, (req, res) => {
  try {
    const books = db.prepare(`
      SELECT b.book_id, b.title, b.available_copies,
             a.first_name || ' ' || a.last_name AS author
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.author_id
      WHERE b.available_copies > 0
      ORDER BY b.title
    `).all();
    res.json(books);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/borrowings/members-list — all members for dropdown
router.get('/members-list', requireAuth, (req, res) => {
  try {
    const members = db.prepare(
      "SELECT member_id, first_name || ' ' || last_name AS name FROM members ORDER BY first_name"
    ).all();
    res.json(members);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
