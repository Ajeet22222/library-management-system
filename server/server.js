// ============================================================
// LIBRARY MANAGEMENT SYSTEM — Express Server
// ============================================================
const express = require('express');
const session = require('express-session');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ---- Middleware ----
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'library-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 hours
}));

// ---- Serve Static Files (web/) ----
app.use(express.static(path.join(__dirname, '..', 'web')));

// ---- API Routes ----
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/books',      require('./routes/books'));
app.use('/api/members',    require('./routes/members'));
app.use('/api/borrowings', require('./routes/borrowings'));
app.use('/api/fines',      require('./routes/fines'));
app.use('/api/query',      require('./routes/query'));

// ---- Dashboard stats endpoint ----
const db = require('./db');
app.get('/api/stats', (req, res) => {
  try {
    const totalCopies    = db.prepare('SELECT COALESCE(SUM(total_copies),0) as v FROM books').get().v;
    const totalMembers   = db.prepare('SELECT COUNT(*) as v FROM members').get().v;
    const activeBorrows  = db.prepare("SELECT COUNT(*) as v FROM borrowings WHERE status IN ('Borrowed','Overdue')").get().v;
    const unpaidFines    = db.prepare('SELECT COALESCE(SUM(amount),0) as v FROM fines WHERE paid=0').get().v;
    res.json({ totalCopies, totalMembers, activeBorrows, unpaidFines });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Fallback to index.html ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'web', 'index.html'));
});

// ---- Start Server ----
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n📚 Library Management System`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`\n🔐 Login Credentials:`);
  console.log(`   Admin → username: admin  | password: admin123`);
  console.log(`   Staff → username: staff  | password: staff123\n`);
});
