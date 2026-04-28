// ============================================================
// ROUTE: /api/query — Execute predefined SQL queries live
// ============================================================
const router = require('express').Router();
const db     = require('../db');

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

// Predefined safe queries (no destructive operations)
const QUERIES = {
  books_with_authors: {
    label: 'Books with Authors (INNER JOIN)',
    sql: `SELECT b.title, a.first_name || ' ' || a.last_name AS author, c.name AS category, b.price, b.available_copies
          FROM books b
          INNER JOIN authors a ON b.author_id = a.author_id
          INNER JOIN categories c ON b.category_id = c.category_id
          ORDER BY b.title`
  },
  all_authors_books: {
    label: 'All Authors with Books (LEFT JOIN)',
    sql: `SELECT a.first_name || ' ' || a.last_name AS author, COUNT(b.book_id) AS book_count
          FROM authors a
          LEFT JOIN books b ON a.author_id = b.author_id
          GROUP BY a.author_id
          ORDER BY book_count DESC`
  },
  borrowing_details: {
    label: 'Full Borrowing Details (Multi-Table JOIN)',
    sql: `SELECT br.borrow_id, m.first_name || ' ' || m.last_name AS member,
                 b.title, s.first_name || ' ' || s.last_name AS staff,
                 br.borrow_date, br.due_date, br.status
          FROM borrowings br
          JOIN members m ON br.member_id = m.member_id
          JOIN books   b ON br.book_id   = b.book_id
          LEFT JOIN staff s ON br.staff_id = s.staff_id
          ORDER BY br.borrow_date DESC`
  },
  above_avg_price: {
    label: 'Books Above Average Price (Scalar Subquery)',
    sql: `SELECT title, price FROM books
          WHERE price > (SELECT AVG(price) FROM books)
          ORDER BY price DESC`
  },
  below_avg_copies_by_cat: {
    label: 'Books Below Avg Copies in Category (Correlated Subquery)',
    sql: `SELECT b.title, b.total_copies,
                 (SELECT AVG(b2.total_copies) FROM books b2 WHERE b2.category_id = b.category_id) AS cat_avg
          FROM books b
          WHERE b.total_copies < (
            SELECT AVG(b2.total_copies) FROM books b2 WHERE b2.category_id = b.category_id
          )`
  },
  category_stats: {
    label: 'Category Stats — GROUP BY + HAVING',
    sql: `SELECT c.name AS category, COUNT(b.book_id) AS book_count,
                 SUM(b.total_copies) AS total_copies,
                 ROUND(AVG(b.price),2) AS avg_price
          FROM books b
          JOIN categories c ON b.category_id = c.category_id
          GROUP BY c.name
          HAVING COUNT(b.book_id) >= 1
          ORDER BY total_copies DESC`
  },
  library_summary: {
    label: 'Library Summary — SUM, AVG, MIN, MAX',
    sql: `SELECT
            COUNT(book_id) AS total_titles,
            SUM(total_copies) AS total_copies,
            ROUND(SUM(price * total_copies),2) AS inventory_value,
            ROUND(AVG(price),2) AS avg_price,
            MIN(price) AS cheapest,
            MAX(price) AS costliest
          FROM books`
  },
  overdue_members: {
    label: 'Members with Overdue Books',
    sql: `SELECT m.first_name || ' ' || m.last_name AS member, m.email,
                 b.title, br.due_date,
                 CAST(julianday('now') - julianday(br.due_date) AS INTEGER) AS days_overdue
          FROM borrowings br
          JOIN members m ON br.member_id = m.member_id
          JOIN books   b ON br.book_id   = b.book_id
          WHERE br.status = 'Overdue' OR (br.return_date IS NULL AND date('now') > br.due_date)
          ORDER BY days_overdue DESC`
  },
  fines_summary: {
    label: 'Fines Summary by Member',
    sql: `SELECT m.first_name || ' ' || m.last_name AS member,
                 COUNT(f.fine_id) AS total_fines,
                 SUM(f.amount) AS total_amount,
                 SUM(CASE WHEN f.paid=0 THEN f.amount ELSE 0 END) AS unpaid_amount
          FROM fines f
          JOIN borrowings br ON f.borrow_id = br.borrow_id
          JOIN members m ON br.member_id = m.member_id
          GROUP BY m.member_id
          ORDER BY unpaid_amount DESC`
  },
  top_borrowed_books: {
    label: 'Top Borrowed Books',
    sql: `SELECT b.title, a.first_name || ' ' || a.last_name AS author,
                 COUNT(br.borrow_id) AS times_borrowed
          FROM books b
          LEFT JOIN borrowings br ON b.book_id = br.book_id
          LEFT JOIN authors a ON b.author_id = a.author_id
          GROUP BY b.book_id
          ORDER BY times_borrowed DESC
          LIMIT 10`
  },
  audit_log_recent: {
    label: 'Recent Audit Log',
    sql: `SELECT log_id, action, table_name, record_id, details, timestamp
          FROM audit_log
          ORDER BY log_id DESC
          LIMIT 20`
  }
};

// GET /api/query/list — list all available queries
router.get('/list', requireAuth, (req, res) => {
  const list = Object.entries(QUERIES).map(([key, q]) => ({ key, label: q.label }));
  res.json(list);
});

// POST /api/query/run — execute a named query
router.post('/run', requireAuth, (req, res) => {
  const { key } = req.body;
  const query = QUERIES[key];
  if (!query) return res.status(400).json({ error: 'Unknown query key' });

  try {
    const rows = db.prepare(query.sql).all();
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    res.json({ label: query.label, sql: query.sql, columns, rows, count: rows.length });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
