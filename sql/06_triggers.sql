-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM — TRIGGERS
-- File: 06_triggers.sql
-- DBMS: MySQL
-- ============================================================
USE library_management;

DELIMITER //

-- ============================================================
-- TRIGGER 1: After INSERT on borrowings
-- Purpose: Decrease available_copies when a book is borrowed
-- ============================================================
CREATE TRIGGER trg_after_borrow_insert
AFTER INSERT ON borrowings
FOR EACH ROW
BEGIN
    UPDATE books
    SET available_copies = available_copies - 1
    WHERE book_id = NEW.book_id;
END //

-- ============================================================
-- TRIGGER 2: After UPDATE on borrowings (when book is returned)
-- Purpose: Increase available_copies when a book is returned
-- ============================================================
CREATE TRIGGER trg_after_borrow_return
AFTER UPDATE ON borrowings
FOR EACH ROW
BEGIN
    IF OLD.return_date IS NULL AND NEW.return_date IS NOT NULL THEN
        UPDATE books
        SET available_copies = available_copies + 1
        WHERE book_id = NEW.book_id;
    END IF;
END //

-- ============================================================
-- TRIGGER 3: Before INSERT on borrowings
-- Purpose: Prevent borrowing if no copies available
-- ============================================================
CREATE TRIGGER trg_before_borrow_check
BEFORE INSERT ON borrowings
FOR EACH ROW
BEGIN
    DECLARE avail INT;
    SELECT available_copies INTO avail FROM books WHERE book_id = NEW.book_id;
    IF avail <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: No copies available for this book!';
    END IF;
END //

-- ============================================================
-- TRIGGER 4: After UPDATE on borrowings
-- Purpose: Auto-generate fine for late returns (₹10/day)
-- ============================================================
CREATE TRIGGER trg_auto_fine_on_late_return
AFTER UPDATE ON borrowings
FOR EACH ROW
BEGIN
    DECLARE days_late INT;
    IF NEW.return_date IS NOT NULL AND NEW.return_date > NEW.due_date THEN
        SET days_late = DATEDIFF(NEW.return_date, NEW.due_date);
        INSERT INTO fines (borrow_id, amount, paid, fine_date)
        VALUES (NEW.borrow_id, days_late * 10.00, FALSE, NEW.return_date);
    END IF;
END //

-- ============================================================
-- TRIGGER 5: Before INSERT on members
-- Purpose: Validate phone number length
-- ============================================================
CREATE TRIGGER trg_validate_member_phone
BEFORE INSERT ON members
FOR EACH ROW
BEGIN
    IF NEW.phone IS NOT NULL AND LENGTH(NEW.phone) < 10 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Phone number must be at least 10 digits!';
    END IF;
END //

DELIMITER ;
