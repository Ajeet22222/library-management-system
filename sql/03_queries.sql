-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM — QUERIES
-- File: 03_queries.sql
-- Topics: SELECT, WHERE, ORDER BY, LIKE, BETWEEN,
--         JOINS (INNER, LEFT, RIGHT, CROSS),
--         SUBQUERIES (scalar, correlated, nested),
--         AGGREGATE FUNCTIONS, GROUP BY, HAVING
-- DBMS: MySQL
-- ============================================================
USE library_management;

-- ============================================================
-- SECTION A: BASIC SELECT QUERIES
-- ============================================================

-- Q1: Select all books
SELECT * FROM books;

-- Q2: Select specific columns with alias
SELECT title AS 'Book Title', price AS 'Price (₹)', published_year AS 'Year'
FROM books;

-- Q3: WHERE clause with comparison
SELECT title, price FROM books WHERE price > 300;

-- Q4: WHERE with AND, OR
SELECT title, price, published_year FROM books
WHERE price > 200 AND published_year > 2000;

-- Q5: LIKE pattern matching
SELECT title FROM books WHERE title LIKE '%Harry%';

-- Q6: BETWEEN
SELECT title, published_year FROM books
WHERE published_year BETWEEN 1990 AND 2010;

-- Q7: IN operator
SELECT * FROM members WHERE membership_type IN ('Premium', 'Student');

-- Q8: ORDER BY
SELECT title, price FROM books ORDER BY price DESC;

-- Q9: LIMIT
SELECT title, price FROM books ORDER BY price DESC LIMIT 5;

-- Q10: DISTINCT
SELECT DISTINCT nationality FROM authors;

-- Q11: IS NULL — find unreturned books
SELECT * FROM borrowings WHERE return_date IS NULL;


-- ============================================================
-- SECTION B: AGGREGATE FUNCTIONS & GROUP BY
-- ============================================================

-- Q12: COUNT — total number of books
SELECT COUNT(*) AS total_books FROM books;

-- Q13: SUM — total value of all books in library
SELECT SUM(price * total_copies) AS total_library_value FROM books;

-- Q14: AVG — average book price
SELECT ROUND(AVG(price), 2) AS avg_price FROM books;

-- Q15: MIN and MAX
SELECT MIN(price) AS cheapest, MAX(price) AS most_expensive FROM books;

-- Q16: GROUP BY — count books per category
SELECT c.name AS category, COUNT(b.book_id) AS book_count
FROM books b
JOIN categories c ON b.category_id = c.category_id
GROUP BY c.name
ORDER BY book_count DESC;

-- Q17: GROUP BY — total books by each author
SELECT CONCAT(a.first_name, ' ', a.last_name) AS author, COUNT(b.book_id) AS books_written
FROM authors a
JOIN books b ON a.author_id = b.author_id
GROUP BY a.author_id
ORDER BY books_written DESC;

-- Q18: HAVING — categories with more than 2 books
SELECT c.name AS category, COUNT(b.book_id) AS book_count
FROM books b
JOIN categories c ON b.category_id = c.category_id
GROUP BY c.name
HAVING COUNT(b.book_id) > 2;

-- Q19: GROUP BY with SUM — total fines per member
SELECT CONCAT(m.first_name, ' ', m.last_name) AS member,
       SUM(f.amount) AS total_fine
FROM fines f
JOIN borrowings br ON f.borrow_id = br.borrow_id
JOIN members m ON br.member_id = m.member_id
GROUP BY m.member_id;

-- Q20: Members who borrowed more than 1 book
SELECT CONCAT(m.first_name, ' ', m.last_name) AS member,
       COUNT(br.borrow_id) AS times_borrowed
FROM borrowings br
JOIN members m ON br.member_id = m.member_id
GROUP BY m.member_id
HAVING COUNT(br.borrow_id) > 1;


-- ============================================================
-- SECTION C: JOINS
-- ============================================================

-- Q21: INNER JOIN — books with their authors
SELECT b.title, CONCAT(a.first_name, ' ', a.last_name) AS author, b.price
FROM books b
INNER JOIN authors a ON b.author_id = a.author_id;

-- Q22: INNER JOIN (3 tables) — books with author and publisher
SELECT b.title, CONCAT(a.first_name, ' ', a.last_name) AS author,
       p.name AS publisher, c.name AS category
FROM books b
INNER JOIN authors a ON b.author_id = a.author_id
INNER JOIN publishers p ON b.publisher_id = p.publisher_id
INNER JOIN categories c ON b.category_id = c.category_id;

-- Q23: LEFT JOIN — all authors and their books (include authors with no books)
SELECT CONCAT(a.first_name, ' ', a.last_name) AS author, b.title
FROM authors a
LEFT JOIN books b ON a.author_id = b.author_id;

-- Q24: RIGHT JOIN — all categories and their books
SELECT c.name AS category, b.title
FROM books b
RIGHT JOIN categories c ON b.category_id = c.category_id;

-- Q25: CROSS JOIN — all possible author-category combinations (demo only)
SELECT CONCAT(a.first_name, ' ', a.last_name) AS author, c.name AS category
FROM authors a
CROSS JOIN categories c
LIMIT 20;

-- Q26: Self-Join concept — members from the same city
SELECT CONCAT(m1.first_name, ' ', m1.last_name) AS member1,
       CONCAT(m2.first_name, ' ', m2.last_name) AS member2,
       m1.address
FROM members m1
JOIN members m2 ON m1.address LIKE CONCAT('%', SUBSTRING_INDEX(m2.address, ' ', -1))
    AND m1.member_id < m2.member_id;

-- Q27: JOIN — borrowing details with member, book, and staff
SELECT br.borrow_id,
       CONCAT(m.first_name, ' ', m.last_name) AS member,
       b.title AS book,
       CONCAT(s.first_name, ' ', s.last_name) AS processed_by,
       br.borrow_date, br.due_date, br.return_date, br.status
FROM borrowings br
JOIN members m ON br.member_id = m.member_id
JOIN books b ON br.book_id = b.book_id
JOIN staff s ON br.staff_id = s.staff_id
ORDER BY br.borrow_date DESC;


-- ============================================================
-- SECTION D: SUBQUERIES
-- ============================================================

-- Q28: Scalar subquery — books priced above average
SELECT title, price FROM books
WHERE price > (SELECT AVG(price) FROM books);

-- Q29: Subquery with IN — members who have borrowed books
SELECT first_name, last_name, email FROM members
WHERE member_id IN (SELECT DISTINCT member_id FROM borrowings);

-- Q30: Subquery with NOT IN — members who never borrowed
SELECT first_name, last_name FROM members
WHERE member_id NOT IN (SELECT DISTINCT member_id FROM borrowings);

-- Q31: Correlated subquery — books with copies below average for their category
SELECT b.title, b.total_copies, b.category_id
FROM books b
WHERE b.total_copies < (
    SELECT AVG(b2.total_copies)
    FROM books b2
    WHERE b2.category_id = b.category_id
);

-- Q32: Subquery in FROM (derived table) — top borrowing member
SELECT member_name, borrow_count FROM (
    SELECT CONCAT(m.first_name, ' ', m.last_name) AS member_name,
           COUNT(*) AS borrow_count
    FROM borrowings br
    JOIN members m ON br.member_id = m.member_id
    GROUP BY m.member_id
) AS member_borrows
ORDER BY borrow_count DESC
LIMIT 1;

-- Q33: EXISTS — categories that have at least one book
SELECT c.name FROM categories c
WHERE EXISTS (
    SELECT 1 FROM books b WHERE b.category_id = c.category_id
);

-- Q34: Nested subquery — most expensive book's author details
SELECT first_name, last_name, email FROM authors
WHERE author_id = (
    SELECT author_id FROM books
    WHERE price = (SELECT MAX(price) FROM books)
);


-- ============================================================
-- SECTION E: UPDATE & DELETE (DML)
-- ============================================================

-- Q35: UPDATE — increase price of all Fiction books by 10%
UPDATE books
SET price = price * 1.10
WHERE category_id = (SELECT category_id FROM categories WHERE name = 'Fiction');

-- Q36: UPDATE with JOIN — mark overdue borrowings
UPDATE borrowings
SET status = 'Overdue'
WHERE return_date IS NULL AND due_date < CURRENT_DATE;

-- Q37: DELETE — remove cancelled reservations
DELETE FROM reservations WHERE status = 'Cancelled';
