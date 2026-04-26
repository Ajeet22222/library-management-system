-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM — DCL (Data Control Language)
-- File: 09_dcl.sql
-- Topics: GRANT, REVOKE, CREATE USER, roles & permissions
-- DBMS: MySQL
-- ============================================================
USE library_management;

-- ============================================================
-- 1. CREATE USERS (different roles)
-- ============================================================

-- Librarian user — can read/write books and borrowings
CREATE USER IF NOT EXISTS 'librarian'@'localhost' IDENTIFIED BY 'lib@2026';

-- Assistant user — read-only access
CREATE USER IF NOT EXISTS 'assistant'@'localhost' IDENTIFIED BY 'asst@2026';

-- Manager user — full access
CREATE USER IF NOT EXISTS 'manager'@'localhost' IDENTIFIED BY 'mgr@2026';

-- ============================================================
-- 2. GRANT PERMISSIONS
-- ============================================================

-- Grant librarian: SELECT, INSERT, UPDATE on key tables
GRANT SELECT, INSERT, UPDATE ON library_management.books TO 'librarian'@'localhost';
GRANT SELECT, INSERT, UPDATE ON library_management.borrowings TO 'librarian'@'localhost';
GRANT SELECT, INSERT, UPDATE ON library_management.members TO 'librarian'@'localhost';
GRANT SELECT ON library_management.authors TO 'librarian'@'localhost';
GRANT SELECT ON library_management.categories TO 'librarian'@'localhost';
GRANT SELECT, INSERT ON library_management.fines TO 'librarian'@'localhost';

-- Grant assistant: SELECT only (read-only)
GRANT SELECT ON library_management.* TO 'assistant'@'localhost';

-- Grant manager: ALL PRIVILEGES
GRANT ALL PRIVILEGES ON library_management.* TO 'manager'@'localhost';

-- Grant execute on procedures
GRANT EXECUTE ON PROCEDURE library_management.sp_borrow_book TO 'librarian'@'localhost';
GRANT EXECUTE ON PROCEDURE library_management.sp_return_book TO 'librarian'@'localhost';
GRANT EXECUTE ON PROCEDURE library_management.sp_search_books TO 'librarian'@'localhost';

-- Apply the grants
FLUSH PRIVILEGES;

-- ============================================================
-- 3. VIEW GRANTED PERMISSIONS
-- ============================================================
SHOW GRANTS FOR 'librarian'@'localhost';
SHOW GRANTS FOR 'assistant'@'localhost';
SHOW GRANTS FOR 'manager'@'localhost';

-- ============================================================
-- 4. REVOKE PERMISSIONS
-- ============================================================

-- Remove INSERT permission from librarian on fines
REVOKE INSERT ON library_management.fines FROM 'librarian'@'localhost';

-- Remove all privileges from assistant
REVOKE ALL PRIVILEGES ON library_management.* FROM 'assistant'@'localhost';

FLUSH PRIVILEGES;

-- ============================================================
-- 5. DROP USERS (cleanup)
-- ============================================================
-- DROP USER IF EXISTS 'librarian'@'localhost';
-- DROP USER IF EXISTS 'assistant'@'localhost';
-- DROP USER IF EXISTS 'manager'@'localhost';

-- ============================================================
-- SUMMARY OF DCL COMMANDS:
-- CREATE USER — Creates a new database user
-- GRANT       — Gives permissions to users
-- REVOKE      — Removes permissions from users
-- FLUSH       — Reloads privilege tables
-- DROP USER   — Deletes a user account
-- ============================================================
