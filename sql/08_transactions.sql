-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM — TRANSACTIONS
-- File: 08_transactions.sql
-- Topics: COMMIT, ROLLBACK, SAVEPOINT
-- DBMS: MySQL
-- ============================================================
USE library_management;

-- ============================================================
-- TRANSACTION 1: Successful book borrowing (COMMIT)
-- ============================================================
START TRANSACTION;

    -- Step 1: Insert borrowing record
    INSERT INTO borrowings (book_id, member_id, staff_id, borrow_date, due_date, status)
    VALUES (8, 4, 2, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), 'Borrowed');

    -- Step 2: Decrease available copies
    UPDATE books SET available_copies = available_copies - 1 WHERE book_id = 8;

    -- Everything went well, save changes
COMMIT;


-- ============================================================
-- TRANSACTION 2: Failed transaction (ROLLBACK)
-- Scenario: Trying to borrow a book but something fails
-- ============================================================
START TRANSACTION;

    -- Step 1: Insert borrowing record
    INSERT INTO borrowings (book_id, member_id, staff_id, borrow_date, due_date, status)
    VALUES (13, 7, 3, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), 'Borrowed');

    -- Step 2: Oops! Let's say we detect an error (member has unpaid fines)
    -- We need to undo everything
ROLLBACK;
-- The INSERT is undone, nothing was saved


-- ============================================================
-- TRANSACTION 3: Using SAVEPOINT
-- Scenario: Multi-step operation with partial rollback
-- ============================================================
START TRANSACTION;

    -- Step 1: Add a new member
    INSERT INTO members (first_name, last_name, email, phone, join_date, membership_type)
    VALUES ('Rahul', 'Kapoor', 'rahul.kapoor@gmail.com', '9876543220', CURRENT_DATE, 'Basic');

    SAVEPOINT sp_after_member;

    -- Step 2: Add a reservation for this member
    INSERT INTO reservations (book_id, member_id, reservation_date, status)
    VALUES (6, LAST_INSERT_ID(), CURRENT_DATE, 'Pending');

    SAVEPOINT sp_after_reservation;

    -- Step 3: Oops! We want to undo the reservation but keep the member
    ROLLBACK TO sp_after_member;

    -- The reservation is undone, but the member still exists
COMMIT;
-- Only the member insertion is saved


-- ============================================================
-- TRANSACTION 4: Book return with fine calculation
-- ============================================================
START TRANSACTION;

    -- Step 1: Update the borrowing record
    UPDATE borrowings
    SET return_date = CURRENT_DATE, status = 'Returned'
    WHERE borrow_id = 5;

    SAVEPOINT sp_after_return;

    -- Step 2: Calculate and insert fine (if applicable)
    -- Assuming borrow_id 5 has due_date of 2025-12-15
    -- If returned after due date, insert fine
    INSERT INTO fines (borrow_id, amount, paid, fine_date)
    SELECT 5, DATEDIFF(CURRENT_DATE, due_date) * 10, FALSE, CURRENT_DATE
    FROM borrowings
    WHERE borrow_id = 5 AND due_date < CURRENT_DATE;

    -- Step 3: Update book availability
    UPDATE books
    SET available_copies = available_copies + 1
    WHERE book_id = (SELECT book_id FROM borrowings WHERE borrow_id = 5);

COMMIT;

-- ============================================================
-- SUMMARY:
-- COMMIT     — Saves all changes permanently
-- ROLLBACK   — Undoes all changes since START TRANSACTION
-- SAVEPOINT  — Creates a checkpoint for partial rollback
-- ROLLBACK TO — Rolls back to a specific savepoint
-- ============================================================
