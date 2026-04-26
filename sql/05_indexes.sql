-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM — INDEXES
-- File: 05_indexes.sql
-- DBMS: MySQL
-- ============================================================
USE library_management;

-- INDEX 1: Speed up book searches by title
CREATE INDEX idx_book_title ON books(title);

-- INDEX 2: Speed up author name lookups
CREATE INDEX idx_author_name ON authors(last_name, first_name);

-- INDEX 3: Speed up member email searches
CREATE INDEX idx_member_email ON members(email);

-- INDEX 4: Speed up borrowing lookups by date
CREATE INDEX idx_borrow_date ON borrowings(borrow_date);

-- INDEX 5: Speed up borrowing status filter
CREATE INDEX idx_borrow_status ON borrowings(status);

-- INDEX 6: Composite index on borrowings for common queries
CREATE INDEX idx_borrow_member_book ON borrowings(member_id, book_id);

-- INDEX 7: Speed up fine lookups by paid status
CREATE INDEX idx_fine_paid ON fines(paid);

-- SHOW ALL INDEXES
SHOW INDEX FROM books;
SHOW INDEX FROM borrowings;
SHOW INDEX FROM members;
