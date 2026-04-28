-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM — BOOK COPIES & AUDIT LOGS
-- File: 10_book_copies_audit.sql
-- Topics: Multi-copy tracking, Audit trail, Views, Triggers
-- DBMS: MySQL
-- ============================================================
USE library_management;

-- ============================================================
-- SECTION A: MULTI-COPY TRACKING QUERIES
-- ============================================================

-- Q1: View all copies of a specific book with their status
SELECT b.title, bc.copy_number, bc.condition_status, bc.location, bc.acquired_date
FROM book_copies bc
JOIN books b ON bc.book_id = b.book_id
WHERE b.book_id = 4
ORDER BY bc.copy_number;

-- Q2: Count copies by condition for each book
SELECT b.title,
       COUNT(*) AS total_copies,
       SUM(CASE WHEN bc.condition_status = 'Good' THEN 1 ELSE 0 END) AS good_copies,
       SUM(CASE WHEN bc.condition_status = 'Damaged' THEN 1 ELSE 0 END) AS damaged_copies,
       SUM(CASE WHEN bc.condition_status = 'Lost' THEN 1 ELSE 0 END) AS lost_copies
FROM book_copies bc
JOIN books b ON bc.book_id = b.book_id
GROUP BY b.book_id
ORDER BY total_copies DESC;

-- Q3: Find all damaged/lost copies with book details
SELECT b.title, CONCAT(a.first_name, ' ', a.last_name) AS author,
       bc.copy_number, bc.condition_status, bc.location
FROM book_copies bc
JOIN books b ON bc.book_id = b.book_id
JOIN authors a ON b.author_id = a.author_id
WHERE bc.condition_status IN ('Damaged', 'Lost')
ORDER BY b.title, bc.copy_number;

-- Q4: Books grouped by location
SELECT bc.location, COUNT(*) AS copy_count,
       GROUP_CONCAT(DISTINCT b.title ORDER BY b.title SEPARATOR ', ') AS books
FROM book_copies bc
JOIN books b ON bc.book_id = b.book_id
WHERE bc.condition_status = 'Good'
GROUP BY bc.location
ORDER BY copy_count DESC;

-- ============================================================
-- SECTION B: VIEWS FOR COPY TRACKING
-- ============================================================

-- VIEW: Complete copy status with book info
CREATE OR REPLACE VIEW vw_copy_status AS
SELECT bc.copy_id, b.title, b.isbn,
       CONCAT(a.first_name, ' ', a.last_name) AS author,
       bc.copy_number, bc.condition_status,
       bc.location, bc.acquired_date
FROM book_copies bc
JOIN books b ON bc.book_id = b.book_id
JOIN authors a ON b.author_id = a.author_id
ORDER BY b.title, bc.copy_number;

SELECT * FROM vw_copy_status;

-- ============================================================
-- SECTION C: AUDIT LOG QUERIES
-- ============================================================

-- Q5: View all audit logs with staff names
SELECT al.log_id, al.action_type, al.table_name,
       al.record_id,
       CONCAT(s.first_name, ' ', s.last_name) AS performed_by,
       al.old_values, al.new_values,
       al.action_time
FROM audit_logs al
LEFT JOIN staff s ON al.staff_id = s.staff_id
ORDER BY al.action_time DESC;

-- Q6: Count actions by type
SELECT action_type, COUNT(*) AS action_count
FROM audit_logs
GROUP BY action_type
ORDER BY action_count DESC;

-- Q7: Actions performed by each staff member
SELECT CONCAT(s.first_name, ' ', s.last_name) AS staff_member,
       s.role,
       COUNT(al.log_id) AS total_actions,
       SUM(CASE WHEN al.action_type = 'INSERT' THEN 1 ELSE 0 END) AS inserts,
       SUM(CASE WHEN al.action_type = 'UPDATE' THEN 1 ELSE 0 END) AS updates,
       SUM(CASE WHEN al.action_type = 'LOGIN' THEN 1 ELSE 0 END) AS logins
FROM staff s
LEFT JOIN audit_logs al ON s.staff_id = al.staff_id
GROUP BY s.staff_id
ORDER BY total_actions DESC;

-- Q8: Recent activity log (last 10 actions)
SELECT action_type, table_name, action_time,
       CONCAT(s.first_name, ' ', s.last_name) AS staff
FROM audit_logs al
LEFT JOIN staff s ON al.staff_id = s.staff_id
ORDER BY action_time DESC
LIMIT 10;

-- ============================================================
-- SECTION D: VIEW FOR AUDIT TRAIL
-- ============================================================

-- VIEW: Human-readable audit trail
CREATE OR REPLACE VIEW vw_audit_trail AS
SELECT al.log_id,
       al.action_type,
       al.table_name,
       al.record_id,
       COALESCE(CONCAT(s.first_name, ' ', s.last_name), 'System') AS performed_by,
       s.role AS staff_role,
       al.old_values,
       al.new_values,
       al.action_time,
       al.ip_address
FROM audit_logs al
LEFT JOIN staff s ON al.staff_id = s.staff_id
ORDER BY al.action_time DESC;

SELECT * FROM vw_audit_trail;

-- ============================================================
-- SECTION E: AUDIT LOG TRIGGERS
-- Auto-log actions on borrowings table
-- ============================================================

DELIMITER //

-- Trigger: Log new borrowing inserts
CREATE TRIGGER trg_audit_borrow_insert
AFTER INSERT ON borrowings
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, staff_id, new_values)
    VALUES ('INSERT', 'borrowings', NEW.borrow_id, NEW.staff_id,
            CONCAT('{"book_id":', NEW.book_id, ',"member_id":', NEW.member_id,
                   ',"status":"', NEW.status, '"}'));
END //

-- Trigger: Log borrowing updates (returns)
CREATE TRIGGER trg_audit_borrow_update
AFTER UPDATE ON borrowings
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, staff_id, old_values, new_values)
    VALUES ('UPDATE', 'borrowings', NEW.borrow_id, NEW.staff_id,
            CONCAT('{"status":"', OLD.status, '","return_date":',
                   IFNULL(CONCAT('"', OLD.return_date, '"'), 'null'), '}'),
            CONCAT('{"status":"', NEW.status, '","return_date":',
                   IFNULL(CONCAT('"', NEW.return_date, '"'), 'null'), '}'));
END //

-- Trigger: Log fine payments
CREATE TRIGGER trg_audit_fine_update
AFTER UPDATE ON fines
FOR EACH ROW
BEGIN
    IF OLD.paid != NEW.paid THEN
        INSERT INTO audit_logs (action_type, table_name, record_id, old_values, new_values)
        VALUES ('UPDATE', 'fines', NEW.fine_id,
                CONCAT('{"paid":', IF(OLD.paid, 'true', 'false'), '}'),
                CONCAT('{"paid":', IF(NEW.paid, 'true', 'false'), '}'));
    END IF;
END //

DELIMITER ;

-- ============================================================
-- SUMMARY:
-- book_copies  — Tracks individual copies per book (condition, location)
-- audit_logs   — Records all INSERT/UPDATE/DELETE/LOGIN actions
-- vw_copy_status — View showing all copies with book details
-- vw_audit_trail — View showing human-readable audit log
-- 3 triggers   — Auto-log borrowings, returns, and fine payments
-- ============================================================
