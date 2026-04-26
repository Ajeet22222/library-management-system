-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM — PROCEDURES, FUNCTIONS & CURSORS
-- File: 07_procedures_functions.sql
-- DBMS: MySQL
-- ============================================================
USE library_management;

DELIMITER //

-- ============================================================
-- STORED PROCEDURE 1: Borrow a Book
-- Demonstrates: IN parameters, error handling, transaction
-- ============================================================
CREATE PROCEDURE sp_borrow_book(
    IN p_book_id INT,
    IN p_member_id INT,
    IN p_staff_id INT,
    IN p_days INT
)
BEGIN
    DECLARE v_avail INT;

    -- Check availability
    SELECT available_copies INTO v_avail
    FROM books WHERE book_id = p_book_id;

    IF v_avail <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No copies available!';
    ELSE
        INSERT INTO borrowings (book_id, member_id, staff_id, borrow_date, due_date, status)
        VALUES (p_book_id, p_member_id, p_staff_id, CURRENT_DATE,
                DATE_ADD(CURRENT_DATE, INTERVAL p_days DAY), 'Borrowed');

        SELECT 'Book borrowed successfully!' AS message;
    END IF;
END //

-- ============================================================
-- STORED PROCEDURE 2: Return a Book
-- Demonstrates: IN parameters, UPDATE, conditional logic
-- ============================================================
CREATE PROCEDURE sp_return_book(
    IN p_borrow_id INT
)
BEGIN
    DECLARE v_status VARCHAR(20);

    SELECT status INTO v_status FROM borrowings WHERE borrow_id = p_borrow_id;

    IF v_status = 'Returned' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Book already returned!';
    ELSE
        UPDATE borrowings
        SET return_date = CURRENT_DATE, status = 'Returned'
        WHERE borrow_id = p_borrow_id;

        SELECT 'Book returned successfully!' AS message;
    END IF;
END //

-- ============================================================
-- STORED PROCEDURE 3: Search Books
-- Demonstrates: IN parameter, LIKE, dynamic search
-- ============================================================
CREATE PROCEDURE sp_search_books(
    IN p_search_term VARCHAR(100)
)
BEGIN
    SELECT b.title, CONCAT(a.first_name, ' ', a.last_name) AS author,
           c.name AS category, b.price, b.available_copies
    FROM books b
    JOIN authors a ON b.author_id = a.author_id
    JOIN categories c ON b.category_id = c.category_id
    WHERE b.title LIKE CONCAT('%', p_search_term, '%')
       OR a.last_name LIKE CONCAT('%', p_search_term, '%')
       OR c.name LIKE CONCAT('%', p_search_term, '%');
END //

-- ============================================================
-- STORED PROCEDURE 4: Get Member Report
-- Demonstrates: OUT parameters
-- ============================================================
CREATE PROCEDURE sp_member_report(
    IN p_member_id INT,
    OUT p_total_borrows INT,
    OUT p_active_borrows INT,
    OUT p_total_fines DECIMAL(8,2)
)
BEGIN
    SELECT COUNT(*) INTO p_total_borrows
    FROM borrowings WHERE member_id = p_member_id;

    SELECT COUNT(*) INTO p_active_borrows
    FROM borrowings WHERE member_id = p_member_id AND return_date IS NULL;

    SELECT COALESCE(SUM(f.amount), 0) INTO p_total_fines
    FROM fines f
    JOIN borrowings br ON f.borrow_id = br.borrow_id
    WHERE br.member_id = p_member_id AND f.paid = FALSE;
END //

-- ============================================================
-- FUNCTION 1: Calculate Fine
-- Demonstrates: RETURNS, DETERMINISTIC
-- ============================================================
CREATE FUNCTION fn_calculate_fine(
    p_due_date DATE,
    p_return_date DATE
)
RETURNS DECIMAL(8,2)
DETERMINISTIC
BEGIN
    DECLARE v_days_late INT;
    DECLARE v_fine DECIMAL(8,2);

    SET v_days_late = DATEDIFF(p_return_date, p_due_date);

    IF v_days_late <= 0 THEN
        SET v_fine = 0.00;
    ELSEIF v_days_late <= 7 THEN
        SET v_fine = v_days_late * 10.00;    -- ₹10/day for first week
    ELSE
        SET v_fine = 70.00 + (v_days_late - 7) * 20.00;  -- ₹20/day after
    END IF;

    RETURN v_fine;
END //

-- ============================================================
-- FUNCTION 2: Check Book Availability
-- ============================================================
CREATE FUNCTION fn_is_available(p_book_id INT)
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE v_copies INT;
    SELECT available_copies INTO v_copies FROM books WHERE book_id = p_book_id;

    IF v_copies > 0 THEN
        RETURN 'Available';
    ELSE
        RETURN 'Not Available';
    END IF;
END //

-- ============================================================
-- CURSOR: Process all overdue borrowings
-- Demonstrates: DECLARE CURSOR, OPEN, FETCH, CLOSE, HANDLER
-- ============================================================
CREATE PROCEDURE sp_process_overdue()
BEGIN
    DECLARE v_done INT DEFAULT 0;
    DECLARE v_borrow_id INT;
    DECLARE v_member_id INT;
    DECLARE v_due_date DATE;
    DECLARE v_days_overdue INT;

    -- Declare cursor for overdue books
    DECLARE cur_overdue CURSOR FOR
        SELECT borrow_id, member_id, due_date
        FROM borrowings
        WHERE return_date IS NULL AND due_date < CURRENT_DATE;

    -- Handler for end of cursor
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

    -- Open cursor
    OPEN cur_overdue;

    -- Loop through each overdue record
    overdue_loop: LOOP
        FETCH cur_overdue INTO v_borrow_id, v_member_id, v_due_date;

        IF v_done THEN
            LEAVE overdue_loop;
        END IF;

        SET v_days_overdue = DATEDIFF(CURRENT_DATE, v_due_date);

        -- Update status to Overdue
        UPDATE borrowings SET status = 'Overdue' WHERE borrow_id = v_borrow_id;

        -- Insert fine if not already exists
        IF NOT EXISTS (SELECT 1 FROM fines WHERE borrow_id = v_borrow_id) THEN
            INSERT INTO fines (borrow_id, amount, paid, fine_date)
            VALUES (v_borrow_id, v_days_overdue * 10.00, FALSE, CURRENT_DATE);
        END IF;
    END LOOP;

    -- Close cursor
    CLOSE cur_overdue;

    SELECT 'Overdue processing complete!' AS message;
END //

DELIMITER ;

-- ============================================================
-- CALLING EXAMPLES
-- ============================================================

-- Call procedure to borrow a book
-- CALL sp_borrow_book(1, 3, 2, 14);

-- Call procedure to return a book
-- CALL sp_return_book(5);

-- Search for books
-- CALL sp_search_books('Harry');

-- Get member report using OUT parameters
-- CALL sp_member_report(1, @total, @active, @fines);
-- SELECT @total, @active, @fines;

-- Use functions
-- SELECT fn_calculate_fine('2026-01-15', '2026-01-25') AS fine_amount;
-- SELECT title, fn_is_available(book_id) AS availability FROM books;

-- Process all overdue books
-- CALL sp_process_overdue();
