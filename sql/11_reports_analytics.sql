-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM — REPORTS & ANALYTICS
-- File: 11_reports_analytics.sql
-- Topics: Analytical queries, Aggregates, Views, Procedures
-- DBMS: MySQL
-- ============================================================
USE library_management;

-- ============================================================
-- REPORT 1: Most Borrowed Books (ranked by borrow count)
-- ============================================================
SELECT b.title,
       CONCAT(a.first_name, ' ', a.last_name) AS author,
       c.name AS category,
       COUNT(br.borrow_id) AS times_borrowed,
       b.total_copies,
       b.available_copies,
       RANK() OVER (ORDER BY COUNT(br.borrow_id) DESC) AS popularity_rank
FROM books b
JOIN authors a ON b.author_id = a.author_id
JOIN categories c ON b.category_id = c.category_id
LEFT JOIN borrowings br ON b.book_id = br.book_id
GROUP BY b.book_id
ORDER BY times_borrowed DESC;

-- ============================================================
-- REPORT 2: Most Active Members
-- ============================================================
SELECT CONCAT(m.first_name, ' ', m.last_name) AS member_name,
       m.membership_type,
       COUNT(br.borrow_id) AS total_borrows,
       SUM(CASE WHEN br.status = 'Returned' THEN 1 ELSE 0 END) AS returned,
       SUM(CASE WHEN br.status IN ('Borrowed', 'Overdue') THEN 1 ELSE 0 END) AS active,
       COALESCE(SUM(f.amount), 0) AS total_fines,
       RANK() OVER (ORDER BY COUNT(br.borrow_id) DESC) AS activity_rank
FROM members m
LEFT JOIN borrowings br ON m.member_id = br.member_id
LEFT JOIN fines f ON br.borrow_id = f.borrow_id
GROUP BY m.member_id
ORDER BY total_borrows DESC;

-- ============================================================
-- REPORT 3: Overdue List with Fine Estimates
-- ============================================================
SELECT br.borrow_id,
       CONCAT(m.first_name, ' ', m.last_name) AS member_name,
       m.email,
       b.title AS book_title,
       br.borrow_date,
       br.due_date,
       DATEDIFF(CURRENT_DATE, br.due_date) AS days_overdue,
       CASE
           WHEN DATEDIFF(CURRENT_DATE, br.due_date) <= 7
               THEN DATEDIFF(CURRENT_DATE, br.due_date) * 10
           ELSE 70 + (DATEDIFF(CURRENT_DATE, br.due_date) - 7) * 20
       END AS estimated_fine
FROM borrowings br
JOIN members m ON br.member_id = m.member_id
JOIN books b ON br.book_id = b.book_id
WHERE br.return_date IS NULL AND br.due_date < CURRENT_DATE
ORDER BY days_overdue DESC;

-- ============================================================
-- REPORT 4: Monthly Borrowing Trends
-- ============================================================
SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS month,
       COUNT(*) AS total_borrows,
       SUM(CASE WHEN status = 'Returned' THEN 1 ELSE 0 END) AS returned,
       SUM(CASE WHEN status = 'Borrowed' THEN 1 ELSE 0 END) AS still_borrowed,
       SUM(CASE WHEN status = 'Overdue' THEN 1 ELSE 0 END) AS overdue
FROM borrowings
GROUP BY DATE_FORMAT(borrow_date, '%Y-%m')
ORDER BY month;

-- ============================================================
-- REPORT 5: Category Popularity (most borrowed genres)
-- ============================================================
SELECT c.name AS category,
       COUNT(br.borrow_id) AS times_borrowed,
       COUNT(DISTINCT b.book_id) AS unique_books,
       COUNT(DISTINCT br.member_id) AS unique_borrowers,
       ROUND(COUNT(br.borrow_id) * 100.0 / (SELECT COUNT(*) FROM borrowings), 1) AS percentage
FROM categories c
LEFT JOIN books b ON c.category_id = b.category_id
LEFT JOIN borrowings br ON b.book_id = br.book_id
GROUP BY c.category_id
ORDER BY times_borrowed DESC;

-- ============================================================
-- REPORT 6: Revenue / Fine Summary
-- ============================================================
SELECT
    COUNT(*) AS total_fines_issued,
    SUM(amount) AS total_fine_amount,
    SUM(CASE WHEN paid = TRUE THEN amount ELSE 0 END) AS collected_amount,
    SUM(CASE WHEN paid = FALSE THEN amount ELSE 0 END) AS pending_amount,
    SUM(CASE WHEN paid = TRUE THEN 1 ELSE 0 END) AS paid_count,
    SUM(CASE WHEN paid = FALSE THEN 1 ELSE 0 END) AS unpaid_count,
    ROUND(SUM(CASE WHEN paid = TRUE THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS collection_rate
FROM fines;

-- ============================================================
-- REPORT 7: Book Utilization Rate
-- ============================================================
SELECT b.title,
       b.total_copies,
       b.available_copies,
       (b.total_copies - b.available_copies) AS currently_issued,
       ROUND((b.total_copies - b.available_copies) * 100.0 / b.total_copies, 1) AS utilization_pct,
       COUNT(br.borrow_id) AS lifetime_borrows
FROM books b
LEFT JOIN borrowings br ON b.book_id = br.book_id
GROUP BY b.book_id
ORDER BY utilization_pct DESC;

-- ============================================================
-- REPORT 8: Member Activity by Membership Type
-- ============================================================
SELECT m.membership_type,
       COUNT(DISTINCT m.member_id) AS member_count,
       COUNT(br.borrow_id) AS total_borrows,
       ROUND(COUNT(br.borrow_id) * 1.0 / COUNT(DISTINCT m.member_id), 1) AS avg_borrows_per_member,
       COALESCE(SUM(f.amount), 0) AS total_fines
FROM members m
LEFT JOIN borrowings br ON m.member_id = br.member_id
LEFT JOIN fines f ON br.borrow_id = f.borrow_id
GROUP BY m.membership_type
ORDER BY total_borrows DESC;

-- ============================================================
-- REPORT 9: Staff Performance Report
-- ============================================================
SELECT CONCAT(s.first_name, ' ', s.last_name) AS staff_name,
       s.role,
       COUNT(br.borrow_id) AS transactions_processed,
       SUM(CASE WHEN br.status = 'Returned' THEN 1 ELSE 0 END) AS returns_handled,
       SUM(CASE WHEN br.status IN ('Borrowed', 'Overdue') THEN 1 ELSE 0 END) AS active_issues
FROM staff s
LEFT JOIN borrowings br ON s.staff_id = br.staff_id
GROUP BY s.staff_id
ORDER BY transactions_processed DESC;

-- ============================================================
-- REPORT 10: Reservation Queue Analysis
-- ============================================================
SELECT b.title,
       COUNT(r.reservation_id) AS total_reservations,
       SUM(CASE WHEN r.status = 'Pending' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN r.status = 'Fulfilled' THEN 1 ELSE 0 END) AS fulfilled,
       SUM(CASE WHEN r.status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled,
       b.available_copies AS current_availability
FROM books b
JOIN reservations r ON b.book_id = r.book_id
GROUP BY b.book_id
ORDER BY pending DESC;

-- ============================================================
-- VIEW: Dashboard Analytics Summary
-- ============================================================
CREATE OR REPLACE VIEW vw_analytics_summary AS
SELECT
    (SELECT COUNT(*) FROM books) AS total_titles,
    (SELECT SUM(total_copies) FROM books) AS total_copies,
    (SELECT SUM(available_copies) FROM books) AS available_copies,
    (SELECT COUNT(*) FROM members) AS total_members,
    (SELECT COUNT(*) FROM staff) AS total_staff,
    (SELECT COUNT(*) FROM borrowings) AS total_borrowings,
    (SELECT COUNT(*) FROM borrowings WHERE status = 'Borrowed') AS active_borrows,
    (SELECT COUNT(*) FROM borrowings WHERE status = 'Overdue') AS overdue_count,
    (SELECT COUNT(*) FROM reservations WHERE status = 'Pending') AS pending_reservations,
    (SELECT COALESCE(SUM(amount), 0) FROM fines) AS total_fines,
    (SELECT COALESCE(SUM(amount), 0) FROM fines WHERE paid = TRUE) AS fines_collected,
    (SELECT COALESCE(SUM(amount), 0) FROM fines WHERE paid = FALSE) AS fines_pending,
    (SELECT COUNT(*) FROM book_copies) AS total_physical_copies,
    (SELECT COUNT(*) FROM book_copies WHERE condition_status = 'Damaged') AS damaged_copies;

SELECT * FROM vw_analytics_summary;

-- ============================================================
-- STORED PROCEDURE: Generate Report by Type
-- Demonstrates: IN parameter, conditional logic, dynamic reports
-- ============================================================
DELIMITER //

CREATE PROCEDURE sp_generate_report(
    IN p_report_type VARCHAR(50)
)
BEGIN
    CASE p_report_type
        WHEN 'most_borrowed' THEN
            SELECT b.title, COUNT(br.borrow_id) AS times_borrowed
            FROM books b
            LEFT JOIN borrowings br ON b.book_id = br.book_id
            GROUP BY b.book_id
            ORDER BY times_borrowed DESC
            LIMIT 10;

        WHEN 'active_members' THEN
            SELECT CONCAT(m.first_name, ' ', m.last_name) AS member,
                   COUNT(br.borrow_id) AS borrows
            FROM members m
            JOIN borrowings br ON m.member_id = br.member_id
            GROUP BY m.member_id
            ORDER BY borrows DESC
            LIMIT 10;

        WHEN 'overdue_list' THEN
            SELECT CONCAT(m.first_name, ' ', m.last_name) AS member,
                   b.title, br.due_date,
                   DATEDIFF(CURRENT_DATE, br.due_date) AS days_overdue
            FROM borrowings br
            JOIN members m ON br.member_id = m.member_id
            JOIN books b ON br.book_id = b.book_id
            WHERE br.return_date IS NULL AND br.due_date < CURRENT_DATE;

        WHEN 'fine_summary' THEN
            SELECT SUM(amount) AS total, SUM(CASE WHEN paid THEN amount ELSE 0 END) AS collected,
                   SUM(CASE WHEN NOT paid THEN amount ELSE 0 END) AS pending
            FROM fines;

        WHEN 'category_stats' THEN
            SELECT c.name AS category, COUNT(br.borrow_id) AS borrows
            FROM categories c
            LEFT JOIN books b ON c.category_id = b.category_id
            LEFT JOIN borrowings br ON b.book_id = br.book_id
            GROUP BY c.category_id
            ORDER BY borrows DESC;

        ELSE
            SELECT 'Invalid report type. Use: most_borrowed, active_members, overdue_list, fine_summary, category_stats' AS error;
    END CASE;
END //

DELIMITER ;

-- CALLING EXAMPLES:
-- CALL sp_generate_report('most_borrowed');
-- CALL sp_generate_report('active_members');
-- CALL sp_generate_report('overdue_list');
-- CALL sp_generate_report('fine_summary');
-- CALL sp_generate_report('category_stats');
