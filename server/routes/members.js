// ============================================================
// ROUTE: /api/members — CRUD for Members
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

// GET /api/members
router.get('/', requireAuth, (req, res) => {
  try {
    const members = db.prepare(`
      SELECT m.*,
             COUNT(b.borrow_id) AS total_borrows,
             SUM(CASE WHEN b.status IN ('Borrowed','Overdue') THEN 1 ELSE 0 END) AS active_borrows
      FROM members m
      LEFT JOIN borrowings b ON m.member_id = b.member_id
      GROUP BY m.member_id
      ORDER BY m.member_id
    `).all();
    res.json(members);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST /api/members — add new member
router.post('/', requireAuth, (req, res) => {
  const { first_name, last_name, email, phone, membership_type } = req.body;
  if (!first_name || !last_name) return res.status(400).json({ error: 'Name is required' });
  try {
    const result = db.prepare(`
      INSERT INTO members (first_name, last_name, email, phone, membership_type)
      VALUES (?, ?, ?, ?, ?)
    `).run(first_name, last_name, email||null, phone||null, membership_type||'Basic');
    db.prepare("INSERT INTO audit_log (action, table_name, record_id, details) VALUES (?,?,?,?)")
      .run('INSERT', 'members', result.lastInsertRowid, `Added member: ${first_name} ${last_name}`);
    res.json({ success: true, member_id: result.lastInsertRowid });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/members/:id
router.put('/:id', requireAuth, (req, res) => {
  const { first_name, last_name, email, phone, membership_type } = req.body;
  const id = req.params.id;
  try {
    db.prepare(`
      UPDATE members SET first_name=?, last_name=?, email=?, phone=?, membership_type=?
      WHERE member_id=?
    `).run(first_name, last_name, email||null, phone||null, membership_type||'Basic', id);
    db.prepare("INSERT INTO audit_log (action, table_name, record_id, details) VALUES (?,?,?,?)")
      .run('UPDATE', 'members', id, `Updated member: ${first_name} ${last_name}`);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/members/:id (Admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  try {
    const active = db.prepare("SELECT COUNT(*) as c FROM borrowings WHERE member_id=? AND status IN ('Borrowed','Overdue')").get(id).c;
    if (active > 0) return res.status(400).json({ error: 'Cannot delete: member has active borrowings' });
    db.prepare('DELETE FROM members WHERE member_id=?').run(id);
    db.prepare("INSERT INTO audit_log (action, table_name, record_id, details) VALUES (?,?,?,?)")
      .run('DELETE', 'members', id, `Deleted member ID: ${id}`);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
