# 📚 Library Management System — DBMS Project

A comprehensive Database Management System project built with **MySQL**, demonstrating all core DBMS concepts through a practical Library Management System.

## 📋 Project Overview

| Detail | Description |
|--------|-------------|
| **Subject** | Database Management Systems (DBMS) |
| **Project** | Library Management System |
| **Database** | MySQL |
| **Tables** | 9 (Authors, Publishers, Categories, Books, Members, Staff, Borrowings, Fines, Reservations) |
| **Total Records** | 74+ sample records |

## 🎯 DBMS Topics Covered

- ✅ ER Diagram & Relational Model
- ✅ Normalization (1NF → BCNF)
- ✅ DDL (CREATE, ALTER, DROP)
- ✅ DML (INSERT, UPDATE, DELETE)
- ✅ Constraints (PK, FK, UNIQUE, NOT NULL, CHECK, DEFAULT, AUTO_INCREMENT)
- ✅ Joins (INNER, LEFT, RIGHT, CROSS, Self)
- ✅ Subqueries (Scalar, Correlated, Nested, EXISTS)
- ✅ Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)
- ✅ GROUP BY & HAVING
- ✅ Views (5 views)
- ✅ Indexes (7 indexes)
- ✅ Triggers (5 triggers)
- ✅ Stored Procedures (4 procedures)
- ✅ Functions (2 functions)
- ✅ Cursors
- ✅ Transactions (COMMIT, ROLLBACK, SAVEPOINT)
- ✅ DCL (CREATE USER, GRANT, REVOKE)

## 📁 Project Structure

```
library-management-system/
├── sql/
│   ├── 01_schema.sql              — Database & table creation (DDL)
│   ├── 02_insert_data.sql         — Sample data (DML INSERT)
│   ├── 03_queries.sql             — SELECT, Joins, Subqueries, Aggregates
│   ├── 04_views.sql               — CREATE VIEW statements
│   ├── 05_indexes.sql             — CREATE INDEX statements
│   ├── 06_triggers.sql            — Trigger definitions
│   ├── 07_procedures_functions.sql — Stored procedures, functions, cursors
│   ├── 08_transactions.sql        — COMMIT, ROLLBACK, SAVEPOINT
│   └── 09_dcl.sql                 — GRANT, REVOKE, user management
├── web/
│   ├── index.html                 — Dashboard interface
│   ├── style.css                  — Styling
│   └── app.js                     — Interactive logic
├── README.md                      — This file
└── REPORT.md                      — Full project report
```

## 🚀 How to Run

### SQL Scripts (MySQL)
```bash
# 1. Open MySQL terminal
mysql -u root -p

# 2. Run scripts in order
source sql/01_schema.sql;
source sql/02_insert_data.sql;
source sql/03_queries.sql;
source sql/04_views.sql;
source sql/05_indexes.sql;
source sql/06_triggers.sql;
source sql/07_procedures_functions.sql;
source sql/08_transactions.sql;
source sql/09_dcl.sql;
```

### Web Dashboard
Simply open `web/index.html` in any web browser. No server needed!

## 👤 Author

- **Name**: Ajeet Singh
- **Roll No**: 2419817
- **Course**: B.Tech CSE, 2nd Year
- **Subject**: Database Management Systems
