// ============================================================
// ROUTE: /api/fines — List & Pay Fines
// ============================================================
const router = require('express').Router();
const db     = require('../db');

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

// GET /api/fines — all fines with borrow + member + book details
router.get('/', requireAuth, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT f.fine_id, f.amount, f.paid, f.fine_date,
             br.borrow_id, br.due_date, br.return_date,
             m.first_name || ' ' || m.last_name AS member_name,
             m.member_id,
             b.title AS book_title,
             b.book_id
      FROM fines f
      JOIN borrowings br ON f.borrow_id = br.borrow_id
      JOIN members    m  ON br.member_id = m.member_id
      JOIN books      b  ON br.book_id   = b.book_id
      ORDER BY f.fine_date DESC
    `).all();
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/fines/:id/pay — mark fine as paid
router.put('/:id/pay', requireAuth, (req, res) => {
  const id = req.params.id;
  try {
    const fine = db.prepare('SELECT * FROM fines WHERE fine_id = ?').get(id);
    if (!fine) return res.status(404).json({ error: 'Fine not found' });
    if (fine.paid) return res.status(400).json({ error: 'Fine already paid' });

    db.prepare('UPDATE fines SET paid = 1 WHERE fine_id = ?').run(id);

    db.prepare("INSERT INTO audit_log (action, table_name, record_id, details) VALUES (?,?,?,?)")
      .run('PAY_FINE', 'fines', id, `Fine ₹${fine.amount} paid for borrow_id ${fine.borrow_id}`);

    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
