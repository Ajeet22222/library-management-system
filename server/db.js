// ============================================================
// DATABASE — SQLite via better-sqlite3
// Auto-creates + seeds library.db on first run
// ============================================================
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'library.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---- Schema Creation ----
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    category_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL UNIQUE,
    description   TEXT
  );

  CREATE TABLE IF NOT EXISTS authors (
    author_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name    TEXT    NOT NULL,
    last_name     TEXT    NOT NULL,
    email         TEXT    UNIQUE,
    nationality   TEXT
  );

  CREATE TABLE IF NOT EXISTS publishers (
    publisher_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL UNIQUE,
    address       TEXT,
    phone         TEXT,
    email         TEXT    UNIQUE
  );

  CREATE TABLE IF NOT EXISTS books (
    book_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title            TEXT    NOT NULL,
    isbn             TEXT    UNIQUE,
    author_id        INTEGER REFERENCES authors(author_id),
    publisher_id     INTEGER REFERENCES publishers(publisher_id),
    category_id      INTEGER REFERENCES categories(category_id),
    price            REAL    DEFAULT 0,
    total_copies     INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    year_published   INTEGER
  );

  CREATE TABLE IF NOT EXISTS members (
    member_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name      TEXT    NOT NULL,
    last_name       TEXT    NOT NULL,
    email           TEXT    UNIQUE,
    phone           TEXT,
    membership_type TEXT    DEFAULT 'Basic' CHECK(membership_type IN ('Basic','Student','Premium')),
    join_date       TEXT    DEFAULT (date('now'))
  );

  CREATE TABLE IF NOT EXISTS staff (
    staff_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name  TEXT NOT NULL,
    last_name   TEXT NOT NULL,
    email       TEXT UNIQUE,
    role        TEXT DEFAULT 'Librarian' CHECK(role IN ('Admin','Librarian','Assistant'))
  );

  CREATE TABLE IF NOT EXISTS borrowings (
    borrow_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id     INTEGER NOT NULL REFERENCES books(book_id),
    member_id   INTEGER NOT NULL REFERENCES members(member_id),
    staff_id    INTEGER REFERENCES staff(staff_id),
    borrow_date TEXT    NOT NULL DEFAULT (date('now')),
    due_date    TEXT    NOT NULL,
    return_date TEXT,
    status      TEXT    DEFAULT 'Borrowed' CHECK(status IN ('Borrowed','Returned','Overdue'))
  );

  CREATE TABLE IF NOT EXISTS fines (
    fine_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    borrow_id   INTEGER NOT NULL REFERENCES borrowings(borrow_id) ON DELETE CASCADE,
    amount      REAL    NOT NULL CHECK(amount > 0),
    paid        INTEGER NOT NULL DEFAULT 0,
    fine_date   TEXT    NOT NULL DEFAULT (date('now'))
  );

  CREATE TABLE IF NOT EXISTS reservations (
    reservation_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id          INTEGER NOT NULL REFERENCES books(book_id),
    member_id        INTEGER NOT NULL REFERENCES members(member_id),
    reservation_date TEXT    NOT NULL DEFAULT (date('now')),
    status           TEXT    DEFAULT 'Pending' CHECK(status IN ('Pending','Fulfilled','Cancelled'))
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    log_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    action     TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id  INTEGER,
    details    TEXT,
    timestamp  TEXT DEFAULT (datetime('now'))
  );
`);

// ---- Seed Data (only if tables are empty) ----
const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;

if (catCount === 0) {
  console.log('🌱 Seeding database...');

  // Categories
  const insertCat = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
  const cats = [
    ['Fiction',     'Imaginative and narrative literature'],
    ['Romance',     'Love and relationship stories'],
    ['Fantasy',     'Magic, mythical creatures and worlds'],
    ['Sci-Fi',      'Science-based speculative fiction'],
    ['Mystery',     'Crime, detective and thriller stories'],
    ['Self-Help',   'Personal development and motivation'],
    ['Non-Fiction', 'Factual and informational books'],
    ['Academic',    'Educational and reference material']
  ];
  cats.forEach(c => insertCat.run(...c));

  // Authors
  const insertAuthor = db.prepare('INSERT INTO authors (first_name, last_name, email, nationality) VALUES (?,?,?,?)');
  const authors = [
    ['Chetan',    'Bhagat',   'chetan@authors.com',   'Indian'],
    ['R.K.',      'Narayan',  'rk@authors.com',       'Indian'],
    ['J.K.',      'Rowling',  'jk@authors.com',       'British'],
    ['George',    'Orwell',   'orwell@authors.com',   'British'],
    ['Ruskin',    'Bond',     'ruskin@authors.com',   'British-Indian'],
    ['Arundhati', 'Roy',      'arundhati@authors.com','Indian'],
    ['Dan',       'Brown',    'dan@authors.com',      'American'],
    ['Paulo',     'Coelho',   'paulo@authors.com',    'Brazilian'],
    ['Agatha',    'Christie', 'agatha@authors.com',   'British'],
    ['Sudha',     'Murthy',   'sudha@authors.com',    'Indian']
  ];
  authors.forEach(a => insertAuthor.run(...a));

  // Publishers
  const insertPub = db.prepare('INSERT INTO publishers (name, address, phone, email) VALUES (?,?,?,?)');
  const pubs = [
    ['Rupa Publications',    'New Delhi',  '9876543210', 'rupa@pub.com'],
    ['Bloomsbury India',     'New Delhi',  '9876543211', 'bloom@pub.com'],
    ['Penguin Random House', 'Mumbai',     '9876543212', 'penguin@pub.com'],
    ['HarperCollins India',  'Noida',      '9876543213', 'harper@pub.com'],
    ['Westland Books',       'Chennai',    '9876543214', 'westland@pub.com'],
    ['Scholastic India',     'New Delhi',  '9876543215', 'scholastic@pub.com']
  ];
  pubs.forEach(p => insertPub.run(...p));

  // Books
  const insertBook = db.prepare(`
    INSERT INTO books (title, isbn, author_id, publisher_id, category_id, price, total_copies, available_copies, year_published)
    VALUES (?,?,?,?,?,?,?,?,?)
  `);
  const books = [
    ['Five Point Someone',                  '9788129135728', 1, 1, 1, 199, 5, 3, 2004],
    ['2 States',                            '9788129135490', 1, 1, 2, 175, 4, 2, 2009],
    ['Malgudi Days',                        '9780143039655', 2, 3, 1, 250, 3, 1, 1943],
    ["Harry Potter & Philosopher's Stone",  '9780747532699', 3, 2, 3, 499, 6, 4, 1997],
    ['Harry Potter & Chamber of Secrets',   '9780747538486', 3, 2, 3, 450, 5, 3, 1998],
    ['1984',                                '9780451524935', 4, 3, 4, 299, 4, 2, 1949],
    ['Animal Farm',                         '9780451526342', 4, 3, 1, 199, 3, 1, 1945],
    ['The Blue Umbrella',                   '9788171673407', 5, 4, 1, 150, 4, 3, 1980],
    ['The God of Small Things',             '9780679457312', 6, 3, 1, 350, 3, 2, 1997],
    ['The Da Vinci Code',                   '9780307474278', 7, 4, 5, 399, 5, 3, 2003],
    ['The Alchemist',                       '9780062315007', 8, 5, 6, 250, 6, 4, 1988],
    ['Murder on Orient Express',            '9780062693662', 9, 4, 5, 299, 4, 2, 1934],
    ['And Then There Were None',            '9780062073488', 9, 4, 5, 275, 3, 1, 1939],
    ['Wise and Otherwise',                  '9780143418870',10, 1, 7, 225, 4, 3, 2006],
    ['Dollar Bahu',                         '9780143028420',10, 1, 1, 195, 3, 2, 2007]
  ];
  books.forEach(b => insertBook.run(...b));

  // Members
  const insertMember = db.prepare(`
    INSERT INTO members (first_name, last_name, email, phone, membership_type, join_date)
    VALUES (?,?,?,?,?,?)
  `);
  const members = [
    ['Aarav',   'Sharma',  'aarav.sharma@gmail.com',  '9001001001', 'Student',  '2025-01-10'],
    ['Priya',   'Patel',   'priya.patel@gmail.com',   '9001001002', 'Premium',  '2025-02-15'],
    ['Rohan',   'Kumar',   'rohan.kumar@gmail.com',   '9001001003', 'Student',  '2025-03-01'],
    ['Sneha',   'Gupta',   'sneha.gupta@gmail.com',   '9001001004', 'Basic',    '2025-01-20'],
    ['Vikram',  'Singh',   'vikram.singh@gmail.com',  '9001001005', 'Premium',  '2025-04-05'],
    ['Ananya',  'Reddy',   'ananya.reddy@gmail.com',  '9001001006', 'Student',  '2025-02-28'],
    ['Arjun',   'Nair',    'arjun.nair@gmail.com',    '9001001007', 'Basic',    '2025-05-10'],
    ['Ishita',  'Verma',   'ishita.verma@gmail.com',  '9001001008', 'Student',  '2025-03-15'],
    ['Karan',   'Joshi',   'karan.joshi@gmail.com',   '9001001009', 'Premium',  '2025-01-05'],
    ['Diya',    'Iyer',    'diya.iyer@gmail.com',     '9001001010', 'Basic',    '2025-06-01']
  ];
  members.forEach(m => insertMember.run(...m));

  // Staff
  const insertStaff = db.prepare(`
    INSERT INTO staff (first_name, last_name, email, role)
    VALUES (?,?,?,?)
  `);
  const staffData = [
    ['Sunita',  'Devi',   'sunita@library.com',  'Librarian'],
    ['Amit',    'Prasad', 'amit@library.com',    'Librarian'],
    ['Kavita',  'Rao',    'kavita@library.com',  'Assistant'],
    ['Rajan',   'Mehta',  'rajan@library.com',   'Admin'],
    ['Preethi', 'Nair',   'preethi@library.com', 'Assistant']
  ];
  staffData.forEach(s => insertStaff.run(...s));

  // Borrowings
  const insertBorrow = db.prepare(`
    INSERT INTO borrowings (book_id, member_id, staff_id, borrow_date, due_date, return_date, status)
    VALUES (?,?,?,?,?,?,?)
  `);
  const borrowings = [
    [1,  1, 1, '2025-10-01', '2025-10-15', '2025-10-14', 'Returned'],
    [4,  2, 1, '2025-10-05', '2025-10-19', '2025-10-18', 'Returned'],
    [6,  3, 2, '2025-11-01', '2025-11-15', '2025-11-20', 'Returned'],
    [10, 4, 1, '2025-11-10', '2025-11-24', '2025-11-23', 'Returned'],
    [11, 5, 3, '2025-12-01', '2025-12-15', null,          'Borrowed'],
    [3,  6, 1, '2025-12-05', '2025-12-19', null,          'Borrowed'],
    [7,  7, 2, '2025-12-10', '2025-12-24', null,          'Overdue'],
    [9,  1, 1, '2026-01-05', '2026-01-19', '2026-01-18', 'Returned'],
    [12, 8, 3, '2026-01-10', '2026-01-24', null,          'Borrowed'],
    [2,  9, 1, '2026-02-01', '2026-02-15', '2026-02-20', 'Returned'],
    [5, 10, 2, '2026-03-01', '2026-03-15', null,          'Borrowed'],
    [14, 2, 1, '2026-03-10', '2026-03-24', null,          'Borrowed']
  ];
  borrowings.forEach(b => insertBorrow.run(...b));

  // Fines (for overdue returns)
  const insertFine = db.prepare(`
    INSERT INTO fines (borrow_id, amount, paid, fine_date)
    VALUES (?,?,?,?)
  `);
  insertFine.run(3, 50, 1, '2025-11-20'); // Rohan returned 1984 late
  insertFine.run(7, 100, 0, '2025-12-25'); // Arjun — Animal Farm overdue
  insertFine.run(10, 50, 0, '2026-02-20'); // Karan — 2 States returned late

  console.log('✅ Database seeded successfully!');
}

module.exports = db;
