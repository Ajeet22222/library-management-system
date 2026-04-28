// ============================================================
// ROUTE: /api/auth — Login / Logout / Me
// ============================================================
const router = require('express').Router();

// Mock users — In production, these would be in DB with hashed passwords
const USERS = {
  admin: { password: 'admin123', name: 'Rajan Mehta',  role: 'Admin',  avatar: 'RM' },
  staff: { password: 'staff123', name: 'Sunita Devi',  role: 'Staff',  avatar: 'SD' }
};

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS[username];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  req.session.user = { username, name: user.name, role: user.role, avatar: user.avatar };
  res.json({ success: true, user: req.session.user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// GET /api/auth/me — returns current session user
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;
