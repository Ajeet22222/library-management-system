-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM — VIEWS
-- File: 04_views.sql
-- DBMS: MySQL
-- ============================================================
USE library_management;

-- VIEW 1: Book catalog with author and publisher details
CREATE OR REPLACE VIEW vw_book_catalog AS
SELECT b.book_id, b.title, b.isbn,
       CONCAT(a.first_name, ' ', a.last_name) AS author,
       p.name AS publisher, c.name AS category,
       b.published_year, b.edition, b.price,
       b.total_copies, b.available_copies
FROM books b
JOIN authors a ON b.author_id = a.author_id
JOIN publishers p ON b.publisher_id = p.publisher_id
JOIN categories c ON b.category_id = c.category_id;

-- VIEW 2: Active borrowings (not yet returned)
CREATE OR REPLACE VIEW vw_active_borrowings AS
SELECT br.borrow_id,
       CONCAT(m.first_name, ' ', m.last_name) AS member_name,
       m.email AS member_email,
       b.title AS book_title,
       CONCAT(s.first_name, ' ', s.last_name) AS staff_name,
       br.borrow_date, br.due_date, br.status,
       DATEDIFF(CURRENT_DATE, br.due_date) AS days_overdue
FROM borrowings br
JOIN members m ON br.member_id = m.member_id
JOIN books b ON br.book_id = b.book_id
JOIN staff s ON br.staff_id = s.staff_id
WHERE br.return_date IS NULL;

-- VIEW 3: Member borrowing history
CREATE OR REPLACE VIEW vw_member_history AS
SELECT m.member_id,
       CONCAT(m.first_name, ' ', m.last_name) AS member_name,
       m.membership_type,
       COUNT(br.borrow_id) AS total_borrows,
       SUM(CASE WHEN br.status = 'Returned' THEN 1 ELSE 0 END) AS returned,
       SUM(CASE WHEN br.status = 'Borrowed' THEN 1 ELSE 0 END) AS active,
       SUM(CASE WHEN br.status = 'Overdue' THEN 1 ELSE 0 END) AS overdue
FROM members m
LEFT JOIN borrowings br ON m.member_id = br.member_id
GROUP BY m.member_id;

-- VIEW 4: Fine summary report
CREATE OR REPLACE VIEW vw_fine_report AS
SELECT f.fine_id,
       CONCAT(m.first_name, ' ', m.last_name) AS member_name,
       b.title AS book_title,
       f.amount, f.paid, f.fine_date
FROM fines f
JOIN borrowings br ON f.borrow_id = br.borrow_id
JOIN members m ON br.member_id = m.member_id
JOIN books b ON br.book_id = b.book_id;

-- VIEW 5: Library statistics dashboard
CREATE OR REPLACE VIEW vw_library_stats AS
SELECT
    (SELECT COUNT(*) FROM books) AS total_books,
    (SELECT SUM(total_copies) FROM books) AS total_copies,
    (SELECT SUM(available_copies) FROM books) AS available_copies,
    (SELECT COUNT(*) FROM members) AS total_members,
    (SELECT COUNT(*) FROM borrowings WHERE status = 'Borrowed') AS active_borrows,
    (SELECT COUNT(*) FROM borrowings WHERE status = 'Overdue') AS overdue_borrows,
    (SELECT COALESCE(SUM(amount), 0) FROM fines WHERE paid = FALSE) AS unpaid_fines;

-- USING THE VIEWS
SELECT * FROM vw_book_catalog;
SELECT * FROM vw_active_borrowings;
SELECT * FROM vw_member_history;
SELECT * FROM vw_fine_report;
SELECT * FROM vw_library_stats;
