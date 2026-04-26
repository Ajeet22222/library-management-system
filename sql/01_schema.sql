-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM — DATABASE SCHEMA
-- File: 01_schema.sql
-- Description: DDL statements to create the database and all
--              tables with constraints (PK, FK, UNIQUE, NOT NULL,
--              CHECK, DEFAULT)
-- DBMS: MySQL
-- ============================================================

-- --------------------------
-- 1. CREATE DATABASE
-- --------------------------
CREATE DATABASE IF NOT EXISTS library_management;
USE library_management;

-- --------------------------
-- 2. DROP TABLES (if re-running)
-- --------------------------
DROP TABLE IF EXISTS fines;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS borrowings;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS publishers;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS staff;

-- ============================================================
-- 3. CREATE TABLES WITH CONSTRAINTS
-- ============================================================

-- --------------------------
-- TABLE: authors
-- Stores information about book authors
-- Constraints: PK, NOT NULL, UNIQUE
-- --------------------------
CREATE TABLE authors (
    author_id   INT             PRIMARY KEY AUTO_INCREMENT,
    first_name  VARCHAR(50)     NOT NULL,
    last_name   VARCHAR(50)     NOT NULL,
    email       VARCHAR(100)    UNIQUE,
    nationality VARCHAR(50)     DEFAULT 'Unknown',

    -- Ensures email format has @ symbol
    CONSTRAINT chk_author_email CHECK (email LIKE '%_@_%.__%')
);

-- --------------------------
-- TABLE: publishers
-- Stores publisher/company details
-- Constraints: PK, NOT NULL, UNIQUE
-- --------------------------
CREATE TABLE publishers (
    publisher_id    INT             PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    address         VARCHAR(200),
    phone           VARCHAR(15),
    email           VARCHAR(100)    UNIQUE,

    CONSTRAINT chk_pub_email CHECK (email LIKE '%_@_%.__%')
);

-- --------------------------
-- TABLE: categories
-- Book genre/category classification
-- Constraints: PK, NOT NULL, UNIQUE
-- --------------------------
CREATE TABLE categories (
    category_id INT             PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(50)     NOT NULL UNIQUE,
    description TEXT
);

-- --------------------------
-- TABLE: books
-- Central table — stores all book records
-- Constraints: PK, FK, NOT NULL, UNIQUE, CHECK, DEFAULT
-- --------------------------
CREATE TABLE books (
    book_id         INT             PRIMARY KEY AUTO_INCREMENT,
    title           VARCHAR(200)    NOT NULL,
    isbn            VARCHAR(13)     NOT NULL UNIQUE,
    author_id       INT             NOT NULL,
    publisher_id    INT             NOT NULL,
    category_id     INT             NOT NULL,
    published_year  INT,
    price           DECIMAL(8,2)    DEFAULT 0.00,
    total_copies    INT             DEFAULT 1,
    available_copies INT            DEFAULT 1,

    -- Foreign Key Constraints
    CONSTRAINT fk_book_author    FOREIGN KEY (author_id)    REFERENCES authors(author_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_book_publisher FOREIGN KEY (publisher_id) REFERENCES publishers(publisher_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_book_category  FOREIGN KEY (category_id)  REFERENCES categories(category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    -- Check Constraints
    CONSTRAINT chk_published_year CHECK (published_year >= 1450 AND published_year <= 2026),
    CONSTRAINT chk_price          CHECK (price >= 0),
    CONSTRAINT chk_total_copies   CHECK (total_copies >= 0),
    CONSTRAINT chk_avail_copies   CHECK (available_copies >= 0)
);

-- --------------------------
-- TABLE: members
-- Library members/patrons
-- Constraints: PK, NOT NULL, UNIQUE, CHECK, DEFAULT
-- --------------------------
CREATE TABLE members (
    member_id       INT             PRIMARY KEY AUTO_INCREMENT,
    first_name      VARCHAR(50)     NOT NULL,
    last_name       VARCHAR(50)     NOT NULL,
    email           VARCHAR(100)    NOT NULL UNIQUE,
    phone           VARCHAR(15),
    address         TEXT,
    join_date       DATE            NOT NULL DEFAULT (CURRENT_DATE),
    membership_type ENUM('Basic', 'Premium', 'Student') NOT NULL DEFAULT 'Basic',

    CONSTRAINT chk_member_email CHECK (email LIKE '%_@_%.__%')
);

-- --------------------------
-- TABLE: staff
-- Library staff/employees
-- Constraints: PK, NOT NULL, UNIQUE, CHECK, DEFAULT
-- --------------------------
CREATE TABLE staff (
    staff_id    INT             PRIMARY KEY AUTO_INCREMENT,
    first_name  VARCHAR(50)     NOT NULL,
    last_name   VARCHAR(50)     NOT NULL,
    email       VARCHAR(100)    NOT NULL UNIQUE,
    role        ENUM('Librarian', 'Assistant', 'Manager', 'Admin') NOT NULL DEFAULT 'Assistant',
    salary      DECIMAL(10,2)   DEFAULT 25000.00,
    hire_date   DATE            NOT NULL DEFAULT (CURRENT_DATE),

    CONSTRAINT chk_staff_email  CHECK (email LIKE '%_@_%.__%'),
    CONSTRAINT chk_salary       CHECK (salary >= 0)
);

-- --------------------------
-- TABLE: borrowings
-- Records of book borrow/return transactions
-- Constraints: PK, FK, NOT NULL, CHECK, DEFAULT
-- --------------------------
CREATE TABLE borrowings (
    borrow_id   INT     PRIMARY KEY AUTO_INCREMENT,
    book_id     INT     NOT NULL,
    member_id   INT     NOT NULL,
    staff_id    INT     NOT NULL,
    borrow_date DATE    NOT NULL DEFAULT (CURRENT_DATE),
    due_date    DATE    NOT NULL,
    return_date DATE    DEFAULT NULL,
    status      ENUM('Borrowed', 'Returned', 'Overdue') NOT NULL DEFAULT 'Borrowed',

    -- Foreign Key Constraints
    CONSTRAINT fk_borrow_book   FOREIGN KEY (book_id)   REFERENCES books(book_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_borrow_member FOREIGN KEY (member_id) REFERENCES members(member_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_borrow_staff  FOREIGN KEY (staff_id)  REFERENCES staff(staff_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    -- Check: due_date must be after borrow_date
    CONSTRAINT chk_due_date CHECK (due_date >= borrow_date)
);

-- --------------------------
-- TABLE: fines
-- Fines for overdue/damaged books
-- Constraints: PK, FK, NOT NULL, CHECK, DEFAULT
-- --------------------------
CREATE TABLE fines (
    fine_id     INT             PRIMARY KEY AUTO_INCREMENT,
    borrow_id   INT             NOT NULL,
    amount      DECIMAL(8,2)    NOT NULL,
    paid        BOOLEAN         DEFAULT FALSE,
    fine_date   DATE            NOT NULL DEFAULT (CURRENT_DATE),

    -- Foreign Key
    CONSTRAINT fk_fine_borrow FOREIGN KEY (borrow_id) REFERENCES borrowings(borrow_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Check
    CONSTRAINT chk_fine_amount CHECK (amount > 0)
);

-- --------------------------
-- TABLE: reservations
-- Book reservation requests by members
-- Constraints: PK, FK, NOT NULL, DEFAULT
-- --------------------------
CREATE TABLE reservations (
    reservation_id  INT     PRIMARY KEY AUTO_INCREMENT,
    book_id         INT     NOT NULL,
    member_id       INT     NOT NULL,
    reservation_date DATE   NOT NULL DEFAULT (CURRENT_DATE),
    status          ENUM('Pending', 'Fulfilled', 'Cancelled') NOT NULL DEFAULT 'Pending',

    -- Foreign Keys
    CONSTRAINT fk_res_book   FOREIGN KEY (book_id)   REFERENCES books(book_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_res_member FOREIGN KEY (member_id) REFERENCES members(member_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 4. ALTER TABLE DEMONSTRATION
-- Adding a column after table creation
-- ============================================================
ALTER TABLE members ADD COLUMN date_of_birth DATE AFTER address;

ALTER TABLE books ADD COLUMN edition INT DEFAULT 1 AFTER published_year;

-- ============================================================
-- SUMMARY OF CONSTRAINTS USED:
-- PRIMARY KEY    — All tables
-- FOREIGN KEY    — books, borrowings, fines, reservations
-- NOT NULL       — Multiple columns across all tables
-- UNIQUE         — isbn, emails
-- CHECK          — email format, price >= 0, year range, salary >= 0
-- DEFAULT        — join_date, membership_type, salary, status, etc.
-- AUTO_INCREMENT — All primary keys
-- ENUM           — membership_type, role, status
-- ON DELETE/UPDATE — CASCADE, RESTRICT
-- ============================================================
