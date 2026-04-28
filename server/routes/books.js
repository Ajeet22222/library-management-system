// ============================================================
// ROUTE: /api/books — CRUD for Books
// ============================================================
const router = require('express').Router();
const db     = require('../db');

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'Admin')
    return res.status(403).json({ error: 'Admin access required' });
  next();
}

// GET /api/books — list all books with author & category
router.get('/', requireAuth, (req, res) => {
  try {
    const books = db.prepare(`
      SELECT b.book_id, b.title, b.isbn, b.price, b.total_copies, b.available_copies, b.year_published,
             a.first_name || ' ' || a.last_name AS author,
             b.author_id,
             c.name AS category,
             b.category_id,
             p.name AS publisher,
             b.publisher_id
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.author_id
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      ORDER BY b.book_id
    `).all();
    res.json(books);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/books/authors — for dropdown
router.get('/authors', requireAuth, (req, res) => {
  const authors = db.prepare('SELECT author_id, first_name || " " || last_name AS name FROM authors ORDER BY first_name').all();
  res.json(authors);
});

// GET /api/books/categories — for dropdown
router.get('/categories', requireAuth, (req, res) => {
  const cats = db.prepare('SELECT category_id, name FROM categories ORDER BY name').all();
  res.json(cats);
});

// GET /api/books/publishers — for dropdown
router.get('/publishers', requireAuth, (req, res) => {
  const pubs = db.prepare('SELECT publisher_id, name FROM publishers ORDER BY name').all();
  res.json(pubs);
});

// POST /api/books — add new book (Admin only)
router.post('/', requireAdmin, (req, res) => {
  const { title, isbn, author_id, publisher_id, category_id, price, total_copies, year_published } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const stmt = db.prepare(`
      INSERT INTO books (title, isbn, author_id, publisher_id, category_id, price, total_copies, available_copies, year_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(title, isbn||null, author_id||null, publisher_id||null, category_id||null,
                            parseFloat(price)||0, parseInt(total_copies)||1, parseInt(total_copies)||1,
                            parseInt(year_published)||null);
    db.prepare("INSERT INTO audit_log (action, table_name, record_id, details) VALUES (?,?,?,?)")
      .run('INSERT', 'books', result.lastInsertRowid, `Added book: ${title}`);
    res.json({ success: true, book_id: result.lastInsertRowid });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/books/:id — update book (Admin only)
router.put('/:id', requireAdmin, (req, res) => {
  const { title, isbn, author_id, publisher_id, category_id, price, total_copies, year_published } = req.body;
  const id = req.params.id;
  try {
    db.prepare(`
      UPDATE books SET title=?, isbn=?, author_id=?, publisher_id=?, category_id=?,
                       price=?, total_copies=?, year_published=?
      WHERE book_id=?
    `).run(title, isbn||null, author_id||null, publisher_id||null, category_id||null,
           parseFloat(price)||0, parseInt(total_copies)||1, parseInt(year_published)||null, id);
    db.prepare("INSERT INTO audit_log (action, table_name, record_id, details) VALUES (?,?,?,?)")
      .run('UPDATE', 'books', id, `Updated book: ${title}`);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/books/:id — delete book (Admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  try {
    // Check if book has active borrowings
    const active = db.prepare("SELECT COUNT(*) as c FROM borrowings WHERE book_id=? AND status IN ('Borrowed','Overdue')").get(id).c;
    if (active > 0) return res.status(400).json({ error: 'Cannot delete: book has active borrowings' });
    db.prepare('DELETE FROM books WHERE book_id=?').run(id);
    db.prepare("INSERT INTO audit_log (action, table_name, record_id, details) VALUES (?,?,?,?)")
      .run('DELETE', 'books', id, `Deleted book ID: ${id}`);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
