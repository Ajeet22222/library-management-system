-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM — SAMPLE DATA
-- File: 02_insert_data.sql
-- DBMS: MySQL
-- ============================================================
USE library_management;

-- 1. AUTHORS
INSERT INTO authors (first_name, last_name, email, nationality) VALUES
('Chetan','Bhagat','chetan.b@gmail.com','Indian'),
('R.K.','Narayan','rk.narayan@gmail.com','Indian'),
('J.K.','Rowling','jk.rowling@gmail.com','British'),
('George','Orwell','g.orwell@gmail.com','British'),
('Ruskin','Bond','ruskin.bond@gmail.com','Indian'),
('Arundhati','Roy','arundhati.r@gmail.com','Indian'),
('Dan','Brown','dan.brown@gmail.com','American'),
('Paulo','Coelho','paulo.c@gmail.com','Brazilian'),
('Agatha','Christie','agatha.c@gmail.com','British'),
('Sudha','Murthy','sudha.m@gmail.com','Indian');

-- 2. PUBLISHERS
INSERT INTO publishers (name, address, phone, email) VALUES
('Penguin Random House','New Delhi, India','011-26567890','contact@penguin.in'),
('HarperCollins India','Noida, UP, India','0120-4044800','info@harpercollins.in'),
('Rupa Publications','New Delhi, India','011-23278586','info@rupapublications.com'),
('Scholastic India','Gurugram, India','0124-4894200','info@scholastic.in'),
('Oxford University Press','New Delhi, India','011-26536777','contact@oup.com'),
('McGraw Hill Education','Chennai, India','044-28285555','info@mheducation.co.in');

-- 3. CATEGORIES
INSERT INTO categories (name, description) VALUES
('Fiction','Novels, short stories, and literary fiction'),
('Non-Fiction','Biographies, essays, and factual works'),
('Science Fiction','Futuristic and science-based fiction'),
('Mystery','Detective and crime fiction'),
('Self-Help','Personal development and motivational books'),
('Academic','Textbooks and reference material'),
('Romance','Love stories and romantic fiction'),
('Fantasy','Magical and fantastical worlds');

-- 4. BOOKS
INSERT INTO books (title, isbn, author_id, publisher_id, category_id, published_year, edition, price, total_copies, available_copies) VALUES
('Five Point Someone','9788129135728',1,3,1,2004,1,199.00,5,3),
('2 States','9788129135490',1,3,7,2009,2,175.00,4,2),
('Malgudi Days','9780143039655',2,1,1,1943,5,250.00,3,1),
('Harry Potter Philosophers','9780747532699',3,4,8,1997,1,499.00,6,4),
('Harry Potter Chamber','9780747538486',3,4,8,1998,1,450.00,5,3),
('1984','9780451524935',4,1,3,1949,10,299.00,4,2),
('Animal Farm','9780451526342',4,1,1,1945,8,199.00,3,1),
('The Blue Umbrella','9788171673407',5,3,1,1980,3,150.00,4,3),
('The God of Small Things','9780679457312',6,2,1,1997,1,350.00,3,2),
('The Da Vinci Code','9780307474278',7,1,4,2003,1,399.00,5,3),
('The Alchemist','9780062315007',8,2,5,1988,25,250.00,6,4),
('Murder on Orient Express','9780062693662',9,2,4,1934,15,299.00,4,2),
('And Then There Were None','9780062073488',9,2,4,1939,12,275.00,3,1),
('Wise and Otherwise','9780143418870',10,1,2,2006,2,225.00,4,3),
('Dollar Bahu','9780143028420',10,1,1,2007,1,195.00,3,2);

-- 5. MEMBERS
INSERT INTO members (first_name, last_name, email, phone, address, date_of_birth, join_date, membership_type) VALUES
('Aarav','Sharma','aarav.sharma@gmail.com','9876543210','12 MG Road Delhi','2003-05-15','2025-01-10','Student'),
('Priya','Patel','priya.patel@gmail.com','9876543211','45 Park Street Mumbai','2001-08-22','2025-02-15','Premium'),
('Rohan','Kumar','rohan.kumar@gmail.com','9876543212','78 Anna Salai Chennai','2004-03-10','2025-03-01','Student'),
('Sneha','Gupta','sneha.gupta@gmail.com','9876543213','23 Brigade Road Bangalore','2000-11-30','2025-01-20','Basic'),
('Vikram','Singh','vikram.singh@gmail.com','9876543214','56 Mall Road Chandigarh','2002-07-18','2025-04-05','Premium'),
('Ananya','Reddy','ananya.reddy@gmail.com','9876543215','89 Jubilee Hills Hyderabad','2003-09-25','2025-02-28','Student'),
('Arjun','Nair','arjun.nair@gmail.com','9876543216','34 MG Road Kochi','2001-01-12','2025-05-10','Basic'),
('Ishita','Verma','ishita.verma@gmail.com','9876543217','67 Civil Lines Lucknow','2004-06-08','2025-03-15','Student'),
('Karan','Joshi','karan.joshi@gmail.com','9876543218','12 SG Highway Ahmedabad','2000-12-20','2025-01-05','Premium'),
('Diya','Iyer','diya.iyer@gmail.com','9876543219','90 Adyar Chennai','2002-04-14','2025-06-01','Basic');

-- 6. STAFF
INSERT INTO staff (first_name, last_name, email, role, salary, hire_date) VALUES
('Rajesh','Mehta','rajesh.mehta@library.com','Manager',55000.00,'2020-06-15'),
('Sunita','Devi','sunita.devi@library.com','Librarian',35000.00,'2021-01-10'),
('Amit','Prasad','amit.prasad@library.com','Assistant',25000.00,'2022-03-20'),
('Kavita','Rao','kavita.rao@library.com','Librarian',38000.00,'2021-08-05'),
('Suresh','Pillai','suresh.pillai@library.com','Admin',60000.00,'2019-04-01');

-- 7. BORROWINGS
INSERT INTO borrowings (book_id, member_id, staff_id, borrow_date, due_date, return_date, status) VALUES
(1,1,2,'2025-10-01','2025-10-15','2025-10-14','Returned'),
(4,2,2,'2025-10-05','2025-10-19','2025-10-18','Returned'),
(6,3,3,'2025-11-01','2025-11-15','2025-11-20','Returned'),
(10,4,2,'2025-11-10','2025-11-24','2025-11-23','Returned'),
(11,5,4,'2025-12-01','2025-12-15',NULL,'Borrowed'),
(3,6,2,'2025-12-05','2025-12-19',NULL,'Borrowed'),
(7,7,3,'2025-12-10','2025-12-24',NULL,'Overdue'),
(9,1,2,'2026-01-05','2026-01-19','2026-01-18','Returned'),
(12,8,4,'2026-01-10','2026-01-24',NULL,'Borrowed'),
(2,9,2,'2026-02-01','2026-02-15','2026-02-20','Returned'),
(5,10,3,'2026-03-01','2026-03-15',NULL,'Borrowed'),
(14,2,2,'2026-03-10','2026-03-24',NULL,'Borrowed');

-- 8. FINES
INSERT INTO fines (borrow_id, amount, paid, fine_date) VALUES
(3,50.00,TRUE,'2025-11-20'),
(7,100.00,FALSE,'2025-12-25'),
(10,50.00,FALSE,'2026-02-20');

-- 9. RESERVATIONS
INSERT INTO reservations (book_id, member_id, reservation_date, status) VALUES
(3,3,'2025-12-01','Pending'),
(6,5,'2025-12-10','Fulfilled'),
(1,8,'2026-01-15','Pending'),
(10,1,'2026-02-01','Cancelled'),
(4,6,'2026-03-01','Pending');
