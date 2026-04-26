// ============================================================
// LIBRARY MANAGEMENT SYSTEM — Dashboard Logic
// ============================================================

// ---- Sample Data (simulates database) ----
const books = [
    {id:1,title:"Five Point Someone",author:"Chetan Bhagat",category:"Fiction",price:199,total:5,available:3,year:2004,isbn:"9788129135728"},
    {id:2,title:"2 States",author:"Chetan Bhagat",category:"Romance",price:175,total:4,available:2,year:2009,isbn:"9788129135490"},
    {id:3,title:"Malgudi Days",author:"R.K. Narayan",category:"Fiction",price:250,total:3,available:1,year:1943,isbn:"9780143039655"},
    {id:4,title:"Harry Potter & Philosopher's Stone",author:"J.K. Rowling",category:"Fantasy",price:499,total:6,available:4,year:1997,isbn:"9780747532699"},
    {id:5,title:"Harry Potter & Chamber of Secrets",author:"J.K. Rowling",category:"Fantasy",price:450,total:5,available:3,year:1998,isbn:"9780747538486"},
    {id:6,title:"1984",author:"George Orwell",category:"Sci-Fi",price:299,total:4,available:2,year:1949,isbn:"9780451524935"},
    {id:7,title:"Animal Farm",author:"George Orwell",category:"Fiction",price:199,total:3,available:1,year:1945,isbn:"9780451526342"},
    {id:8,title:"The Blue Umbrella",author:"Ruskin Bond",category:"Fiction",price:150,total:4,available:3,year:1980,isbn:"9788171673407"},
    {id:9,title:"The God of Small Things",author:"Arundhati Roy",category:"Fiction",price:350,total:3,available:2,year:1997,isbn:"9780679457312"},
    {id:10,title:"The Da Vinci Code",author:"Dan Brown",category:"Mystery",price:399,total:5,available:3,year:2003,isbn:"9780307474278"},
    {id:11,title:"The Alchemist",author:"Paulo Coelho",category:"Self-Help",price:250,total:6,available:4,year:1988,isbn:"9780062315007"},
    {id:12,title:"Murder on Orient Express",author:"Agatha Christie",category:"Mystery",price:299,total:4,available:2,year:1934,isbn:"9780062693662"},
    {id:13,title:"And Then There Were None",author:"Agatha Christie",category:"Mystery",price:275,total:3,available:1,year:1939,isbn:"9780062073488"},
    {id:14,title:"Wise and Otherwise",author:"Sudha Murthy",category:"Non-Fiction",price:225,total:4,available:3,year:2006,isbn:"9780143418870"},
    {id:15,title:"Dollar Bahu",author:"Sudha Murthy",category:"Fiction",price:195,total:3,available:2,year:2007,isbn:"9780143028420"}
];

const members = [
    {id:1,name:"Aarav Sharma",email:"aarav.sharma@gmail.com",type:"Student",joined:"2025-01-10",borrows:2},
    {id:2,name:"Priya Patel",email:"priya.patel@gmail.com",type:"Premium",joined:"2025-02-15",borrows:2},
    {id:3,name:"Rohan Kumar",email:"rohan.kumar@gmail.com",type:"Student",joined:"2025-03-01",borrows:1},
    {id:4,name:"Sneha Gupta",email:"sneha.gupta@gmail.com",type:"Basic",joined:"2025-01-20",borrows:1},
    {id:5,name:"Vikram Singh",email:"vikram.singh@gmail.com",type:"Premium",joined:"2025-04-05",borrows:1},
    {id:6,name:"Ananya Reddy",email:"ananya.reddy@gmail.com",type:"Student",joined:"2025-02-28",borrows:1},
    {id:7,name:"Arjun Nair",email:"arjun.nair@gmail.com",type:"Basic",joined:"2025-05-10",borrows:1},
    {id:8,name:"Ishita Verma",email:"ishita.verma@gmail.com",type:"Student",joined:"2025-03-15",borrows:1},
    {id:9,name:"Karan Joshi",email:"karan.joshi@gmail.com",type:"Premium",joined:"2025-01-05",borrows:1},
    {id:10,name:"Diya Iyer",email:"diya.iyer@gmail.com",type:"Basic",joined:"2025-06-01",borrows:1}
];

const borrowings = [
    {id:1,book:"Five Point Someone",member:"Aarav Sharma",staff:"Sunita Devi",bDate:"2025-10-01",dDate:"2025-10-15",rDate:"2025-10-14",status:"Returned"},
    {id:2,book:"Harry Potter & Philosopher's Stone",member:"Priya Patel",staff:"Sunita Devi",bDate:"2025-10-05",dDate:"2025-10-19",rDate:"2025-10-18",status:"Returned"},
    {id:3,book:"1984",member:"Rohan Kumar",staff:"Amit Prasad",bDate:"2025-11-01",dDate:"2025-11-15",rDate:"2025-11-20",status:"Returned"},
    {id:4,book:"The Da Vinci Code",member:"Sneha Gupta",staff:"Sunita Devi",bDate:"2025-11-10",dDate:"2025-11-24",rDate:"2025-11-23",status:"Returned"},
    {id:5,book:"The Alchemist",member:"Vikram Singh",staff:"Kavita Rao",bDate:"2025-12-01",dDate:"2025-12-15",rDate:null,status:"Borrowed"},
    {id:6,book:"Malgudi Days",member:"Ananya Reddy",staff:"Sunita Devi",bDate:"2025-12-05",dDate:"2025-12-19",rDate:null,status:"Borrowed"},
    {id:7,book:"Animal Farm",member:"Arjun Nair",staff:"Amit Prasad",bDate:"2025-12-10",dDate:"2025-12-24",rDate:null,status:"Overdue"},
    {id:8,book:"The God of Small Things",member:"Aarav Sharma",staff:"Sunita Devi",bDate:"2026-01-05",dDate:"2026-01-19",rDate:"2026-01-18",status:"Returned"},
    {id:9,book:"Murder on Orient Express",member:"Ishita Verma",staff:"Kavita Rao",bDate:"2026-01-10",dDate:"2026-01-24",rDate:null,status:"Borrowed"},
    {id:10,book:"2 States",member:"Karan Joshi",staff:"Sunita Devi",bDate:"2026-02-01",dDate:"2026-02-15",rDate:"2026-02-20",status:"Returned"},
    {id:11,book:"Harry Potter & Chamber of Secrets",member:"Diya Iyer",staff:"Amit Prasad",bDate:"2026-03-01",dDate:"2026-03-15",rDate:null,status:"Borrowed"},
    {id:12,book:"Wise and Otherwise",member:"Priya Patel",staff:"Sunita Devi",bDate:"2026-03-10",dDate:"2026-03-24",rDate:null,status:"Borrowed"}
];

const fines = [
    {id:1,member:"Rohan Kumar",book:"1984",amount:50,paid:true,date:"2025-11-20"},
    {id:2,member:"Arjun Nair",book:"Animal Farm",amount:100,paid:false,date:"2025-12-25"},
    {id:3,member:"Karan Joshi",book:"2 States",amount:50,paid:false,date:"2026-02-20"}
];

const categoryColors = {
    "Fiction":"#8b5cf6","Romance":"#f43f5e","Fantasy":"#3b82f6","Sci-Fi":"#06b6d4",
    "Mystery":"#f59e0b","Self-Help":"#10b981","Non-Fiction":"#ec4899","Academic":"#6366f1"
};

const avatarColors = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#f43f5e","#06b6d4","#ec4899","#6366f1","#14b8a6","#e11d48"];

// ---- Navigation ----
function navigateTo(page) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    updatePageHeader(page);
}

function updatePageHeader(page) {
    const titles = {
        dashboard: ["Dashboard", "Overview of your library system"],
        books: ["Books Catalog", "Browse and manage all books"],
        members: ["Members", "Library members and their activity"],
        borrowings: ["Borrowings", "Track all book borrowing records"],
        fines: ["Fines", "Monitor and manage overdue fines"],
        report: ["DBMS Report", "All DBMS topics covered in this project"],
        erdiagram: ["ER Diagram", "Entity-Relationship diagram and schema"],
        queries: ["SQL Queries", "Explore the DBMS concepts used in this project"]
    };
    const t = titles[page] || ["Dashboard",""];
    document.getElementById('page-title').textContent = t[0];
    document.getElementById('page-subtitle').textContent = t[1];
}

// ---- Render Functions ----
function renderDashboard() {
    const totalBooks = books.reduce((s,b) => s + b.total, 0);
    const activeB = borrowings.filter(b => b.status === 'Borrowed').length;
    const overdueB = borrowings.filter(b => b.status === 'Overdue').length;
    const unpaid = fines.filter(f => !f.paid).reduce((s,f) => s + f.amount, 0);

    document.getElementById('stat-books').textContent = totalBooks;
    document.getElementById('stat-members').textContent = members.length;
    document.getElementById('stat-borrows').textContent = activeB + overdueB;
    document.getElementById('stat-fines').textContent = '₹' + unpaid;

    // Recent borrowings table
    const tbody = document.getElementById('recent-borrows-body');
    tbody.innerHTML = borrowings.slice(-5).reverse().map(b => `
        <tr>
            <td style="color:var(--text-primary);font-weight:500">${b.book}</td>
            <td>${b.member}</td>
            <td>${b.bDate}</td>
            <td>${b.dDate}</td>
            <td><span class="badge ${b.status==='Returned'?'badge-success':b.status==='Overdue'?'badge-danger':'badge-warning'}">${b.status}</span></td>
        </tr>
    `).join('');

    // Category distribution
    const catCounts = {};
    books.forEach(b => { catCounts[b.category] = (catCounts[b.category]||0) + b.total; });
    const catList = document.getElementById('category-list');
    catList.innerHTML = Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).map(([cat,count]) => {
        const pct = Math.round(count / totalBooks * 100);
        const color = categoryColors[cat] || '#64748b';
        return `<div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="font-size:13px;font-weight:500">${cat}</span>
                <span style="font-size:12px;color:var(--text-muted)">${count} copies (${pct}%)</span>
            </div>
            <div style="height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 1s ease"></div>
            </div>
        </div>`;
    }).join('');
}

function renderBooks() {
    const grid = document.getElementById('books-grid');
    grid.innerHTML = books.map(b => {
        const color = categoryColors[b.category] || '#64748b';
        return `<div class="book-card">
            <span class="book-category" style="background:${color}20;color:${color}">${b.category}</span>
            <h4>${b.title}</h4>
            <p class="book-author">by ${b.author} · ${b.year}</p>
            <div class="book-meta">
                <span class="book-price">₹${b.price}</span>
                <span class="book-stock">${b.available}/${b.total} available</span>
            </div>
        </div>`;
    }).join('');
}

function renderMembers() {
    const list = document.getElementById('members-list');
    list.innerHTML = members.map((m,i) => {
        const initials = m.name.split(' ').map(n=>n[0]).join('');
        const color = avatarColors[i % avatarColors.length];
        const typeBadge = m.type==='Premium'?'badge-purple':m.type==='Student'?'badge-info':'badge-success';
        return `<div class="member-row">
            <div class="member-avatar" style="background:${color}">${initials}</div>
            <div class="member-info">
                <h4>${m.name}</h4>
                <p>${m.email}</p>
            </div>
            <span class="badge ${typeBadge}">${m.type}</span>
            <span style="font-size:12px;color:var(--text-muted);min-width:80px;text-align:right">${m.borrows} borrows</span>
        </div>`;
    }).join('');
}

function renderBorrowings() {
    const tbody = document.getElementById('borrowings-body');
    tbody.innerHTML = borrowings.map(b => `
        <tr>
            <td>${b.id}</td>
            <td style="color:var(--text-primary);font-weight:500">${b.book}</td>
            <td>${b.member}</td>
            <td>${b.bDate}</td>
            <td>${b.dDate}</td>
            <td>${b.rDate || '—'}</td>
            <td><span class="badge ${b.status==='Returned'?'badge-success':b.status==='Overdue'?'badge-danger':'badge-warning'}">${b.status}</span></td>
        </tr>
    `).join('');
}

function renderFines() {
    const tbody = document.getElementById('fines-body');
    tbody.innerHTML = fines.map(f => `
        <tr>
            <td>${f.id}</td>
            <td style="color:var(--text-primary);font-weight:500">${f.member}</td>
            <td>${f.book}</td>
            <td style="color:var(--accent-amber);font-weight:600">₹${f.amount}</td>
            <td><span class="badge ${f.paid?'badge-success':'badge-danger'}">${f.paid?'Paid':'Unpaid'}</span></td>
            <td>${f.date}</td>
        </tr>
    `).join('');
}

// ---- Search ----
function handleSearch(e) {
    const q = e.target.value.toLowerCase();
    const activePage = document.querySelector('.page-section.active')?.id?.replace('page-','');
    if (activePage === 'books') {
        const cards = document.querySelectorAll('.book-card');
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(q) ? '' : 'none';
        });
    }
}

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    renderBooks();
    renderMembers();
    renderBorrowings();
    renderFines();
    renderERDiagram();
    navigateTo('dashboard');

    // Animate stat numbers
    document.querySelectorAll('.stat-value').forEach(el => {
        const target = el.textContent;
        if (target.startsWith('₹')) {
            const num = parseInt(target.replace('₹',''));
            animateNumber(el, 0, num, 1000, '₹');
        } else {
            animateNumber(el, 0, parseInt(target), 1000);
        }
    });
});

function renderERDiagram() {
    const container = document.getElementById('er-diagram-visual');
    if (!container) return;
    const tables = [
        {name:'AUTHORS',color:'#3b82f6',attrs:['author_id PK','first_name','last_name','email UK','nationality']},
        {name:'PUBLISHERS',color:'#8b5cf6',attrs:['publisher_id PK','name UK','address','phone','email UK']},
        {name:'CATEGORIES',color:'#10b981',attrs:['category_id PK','name UK','description']},
        {name:'BOOKS',color:'#f59e0b',attrs:['book_id PK','title','isbn UK','author_id FK','publisher_id FK','category_id FK','price','total_copies','available_copies']},
        {name:'MEMBERS',color:'#f43f5e',attrs:['member_id PK','first_name','last_name','email UK','phone','membership_type']},
        {name:'STAFF',color:'#06b6d4',attrs:['staff_id PK','first_name','last_name','email UK','role','salary']},
        {name:'BORROWINGS',color:'#ec4899',attrs:['borrow_id PK','book_id FK','member_id FK','staff_id FK','borrow_date','due_date','return_date','status']},
        {name:'FINES',color:'#14b8a6',attrs:['fine_id PK','borrow_id FK','amount','paid','fine_date']},
        {name:'RESERVATIONS',color:'#6366f1',attrs:['reservation_id PK','book_id FK','member_id FK','reservation_date','status']}
    ];
    container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
            ${tables.map(t => `
                <div style="background:rgba(0,0,0,0.3);border:2px solid ${t.color}40;border-radius:12px;overflow:hidden">
                    <div style="background:${t.color}20;padding:10px 14px;border-bottom:1px solid ${t.color}30;display:flex;align-items:center;gap:8px">
                        <div style="width:8px;height:8px;border-radius:50%;background:${t.color}"></div>
                        <span style="font-size:13px;font-weight:700;color:${t.color}">${t.name}</span>
                    </div>
                    <div style="padding:10px 14px">
                        ${t.attrs.map(a => {
                            const isPK = a.includes('PK');
                            const isFK = a.includes('FK');
                            const isUK = a.includes('UK');
                            const name = a.replace(' PK','').replace(' FK','').replace(' UK','');
                            let badge = '';
                            if(isPK) badge = '<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(16,185,129,0.2);color:#10b981;font-weight:700;margin-left:auto">PK</span>';
                            if(isFK) badge = '<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(59,130,246,0.2);color:#3b82f6;font-weight:700;margin-left:auto">FK</span>';
                            if(isUK) badge = '<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(139,92,246,0.2);color:#8b5cf6;font-weight:700;margin-left:auto">UK</span>';
                            return `<div style="display:flex;align-items:center;padding:3px 0;font-size:12px;color:#94a3b8;gap:6px">
                                <span style="color:${isPK?'#10b981':isFK?'#3b82f6':'#94a3b8'};font-weight:${isPK?'600':'400'}">${name}</span>
                                ${badge}
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="margin-top:24px;display:flex;gap:20px;justify-content:center;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8">
                <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:rgba(16,185,129,0.3)"></span> PK = Primary Key
            </div>
            <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8">
                <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:rgba(59,130,246,0.3)"></span> FK = Foreign Key
            </div>
            <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8">
                <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:rgba(139,92,246,0.3)"></span> UK = Unique Key
            </div>
        </div>
    `;
}

function animateNumber(el, start, end, duration, prefix = '') {
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * eased);
        el.textContent = prefix + current;
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}
