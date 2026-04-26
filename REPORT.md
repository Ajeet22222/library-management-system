# Library Management System — Project Report

**Subject:** Database Management Systems (DBMS)
**Project:** Library Management System
**Database:** MySQL 8.0
**Submitted by:** [Your Name] | [Roll Number]
**Course:** B.Tech Computer Science & Engineering, 2nd Year

---

## 1. Introduction

The Library Management System is a database-driven application designed to manage the operations of a library including book cataloging, member registration, book borrowing/returning, fine management, and reservations. This project demonstrates the practical application of all major DBMS concepts learned in the course.

### 1.1 Objectives
- Design a normalized relational database for library operations
- Implement all DBMS concepts: DDL, DML, DQL, TCL, DCL
- Create views, triggers, stored procedures, and functions
- Demonstrate transaction management with COMMIT, ROLLBACK, and SAVEPOINT

### 1.2 Scope
The system manages:
- **Books** — with author, publisher, and category information
- **Members** — library patrons with different membership types
- **Staff** — library employees who process transactions
- **Borrowings** — book checkout and return tracking
- **Fines** — automatic fine calculation for overdue books
- **Reservations** — book reservation requests

---

## 2. ER Diagram

### 2.1 Entities and Attributes

| Entity | Attributes |
|--------|-----------|
| **Authors** | author_id (PK), first_name, last_name, email, nationality |
| **Publishers** | publisher_id (PK), name, address, phone, email |
| **Categories** | category_id (PK), name, description |
| **Books** | book_id (PK), title, isbn, author_id (FK), publisher_id (FK), category_id (FK), published_year, edition, price, total_copies, available_copies |
| **Members** | member_id (PK), first_name, last_name, email, phone, address, date_of_birth, join_date, membership_type |
| **Staff** | staff_id (PK), first_name, last_name, email, role, salary, hire_date |
| **Borrowings** | borrow_id (PK), book_id (FK), member_id (FK), staff_id (FK), borrow_date, due_date, return_date, status |
| **Fines** | fine_id (PK), borrow_id (FK), amount, paid, fine_date |
| **Reservations** | reservation_id (PK), book_id (FK), member_id (FK), reservation_date, status |

### 2.2 Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| Authors → Books | 1:M | One author writes many books |
| Publishers → Books | 1:M | One publisher publishes many books |
| Categories → Books | 1:M | One category contains many books |
| Books → Borrowings | 1:M | One book can be borrowed many times |
| Members → Borrowings | 1:M | One member can have many borrowings |
| Staff → Borrowings | 1:M | One staff processes many borrowings |
| Borrowings → Fines | 1:1 | One borrowing may have one fine |
| Books → Reservations | 1:M | One book can have many reservations |
| Members → Reservations | 1:M | One member can make many reservations |

---

## 3. Normalization

### 3.1 First Normal Form (1NF)
All tables satisfy 1NF:
- Each column contains atomic (indivisible) values
- Each row is unique (identified by primary key)
- No repeating groups

### 3.2 Second Normal Form (2NF)
All tables satisfy 2NF:
- Already in 1NF
- No partial dependencies — all non-key attributes depend on the entire primary key
- Example: In `books`, title, price, etc. all depend fully on `book_id`

### 3.3 Third Normal Form (3NF)
All tables satisfy 3NF:
- Already in 2NF
- No transitive dependencies — non-key attributes don't depend on other non-key attributes
- Example: Author details are in a separate `authors` table, not repeated in `books`

### 3.4 BCNF (Boyce-Codd Normal Form)
All tables satisfy BCNF:
- Already in 3NF
- Every determinant is a candidate key
- All functional dependencies are from candidate keys

---

## 4. SQL Concepts Demonstrated

### 4.1 DDL (Data Definition Language)
**File:** `01_schema.sql`
- `CREATE DATABASE` — Database creation
- `CREATE TABLE` — Table creation with constraints
- `ALTER TABLE` — Adding columns after creation
- `DROP TABLE` — Table deletion (in cleanup)

### 4.2 Constraints Used
| Constraint | Example |
|-----------|---------|
| PRIMARY KEY | `book_id INT PRIMARY KEY AUTO_INCREMENT` |
| FOREIGN KEY | `FOREIGN KEY (author_id) REFERENCES authors(author_id)` |
| UNIQUE | `isbn VARCHAR(13) NOT NULL UNIQUE` |
| NOT NULL | `title VARCHAR(200) NOT NULL` |
| CHECK | `CHECK (price >= 0)` |
| DEFAULT | `membership_type ENUM(...) DEFAULT 'Basic'` |
| ON DELETE/UPDATE | `ON DELETE RESTRICT ON UPDATE CASCADE` |

### 4.3 DML (Data Manipulation Language)
**File:** `02_insert_data.sql`, `03_queries.sql`
- `INSERT INTO` — Adding records to all 9 tables
- `UPDATE` — Modifying book prices, borrowing status
- `DELETE` — Removing cancelled reservations

### 4.4 DQL (Data Query Language)
**File:** `03_queries.sql`

**Basic Queries:** SELECT, WHERE, LIKE, BETWEEN, IN, ORDER BY, LIMIT, DISTINCT, IS NULL

**Joins:**
- INNER JOIN — Books with authors
- LEFT JOIN — All authors including those with no books
- RIGHT JOIN — All categories including empty ones
- CROSS JOIN — Cartesian product demonstration
- Self Join — Members from same city

**Subqueries:**
- Scalar subquery — Books above average price
- IN / NOT IN — Members who have/haven't borrowed
- Correlated subquery — Books below category average
- Derived table (FROM subquery) — Top borrower
- EXISTS — Categories with books

**Aggregate Functions:** COUNT, SUM, AVG, MIN, MAX with GROUP BY and HAVING

### 4.5 Views
**File:** `04_views.sql`
- `vw_book_catalog` — Complete book info with author, publisher, category
- `vw_active_borrowings` — Currently borrowed books with overdue days
- `vw_member_history` — Member borrowing statistics
- `vw_fine_report` — Fine details with member and book info
- `vw_library_stats` — Dashboard statistics

### 4.6 Indexes
**File:** `05_indexes.sql`
- 7 indexes created for performance optimization on frequently queried columns

### 4.7 Triggers
**File:** `06_triggers.sql`
- `trg_after_borrow_insert` — Decrease available copies on borrow
- `trg_after_borrow_return` — Increase copies on return
- `trg_before_borrow_check` — Prevent borrowing if no copies
- `trg_auto_fine_on_late_return` — Auto-generate fine for late returns
- `trg_validate_member_phone` — Validate phone number format

### 4.8 Stored Procedures & Functions
**File:** `07_procedures_functions.sql`
- `sp_borrow_book()` — Borrow with availability check
- `sp_return_book()` — Return with status validation
- `sp_search_books()` — Dynamic book search
- `sp_member_report()` — Member stats with OUT parameters
- `fn_calculate_fine()` — Fine calculation function
- `fn_is_available()` — Availability check function
- `sp_process_overdue()` — Cursor-based overdue processing

### 4.9 Transactions
**File:** `08_transactions.sql`
- COMMIT — Successful transaction completion
- ROLLBACK — Undoing failed transactions
- SAVEPOINT — Partial rollback with checkpoints

### 4.10 DCL (Data Control Language)
**File:** `09_dcl.sql`
- CREATE USER — Creating role-based users
- GRANT — Assigning permissions
- REVOKE — Removing permissions
- FLUSH PRIVILEGES — Applying changes

---

## 5. Conclusion

This Library Management System project successfully demonstrates the practical application of all major DBMS concepts. The database design follows proper normalization principles (up to BCNF), uses comprehensive constraints for data integrity, and implements advanced features like triggers, stored procedures, cursors, and transaction management. The accompanying web dashboard provides a visual interface for presenting the project during evaluation.

---

## 6. References
1. Abraham Silberschatz, Henry F. Korth, S. Sudarshan — *Database System Concepts*
2. Ramez Elmasri, Shamkant B. Navathe — *Fundamentals of Database Systems*
3. MySQL 8.0 Reference Manual — https://dev.mysql.com/doc/refman/8.0/en/
