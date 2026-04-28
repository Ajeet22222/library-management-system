// ============================================================
// LIBRARY MANAGEMENT SYSTEM — Full Dashboard Logic with API
// ============================================================

const API = '';
const categoryColors = {
  "Fiction":"#8b5cf6","Romance":"#f43f5e","Fantasy":"#3b82f6","Sci-Fi":"#06b6d4",
  "Mystery":"#f59e0b","Self-Help":"#10b981","Non-Fiction":"#ec4899","Academic":"#6366f1"
};
const avatarColors = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#f43f5e","#06b6d4","#ec4899","#6366f1","#14b8a6","#e11d48"];
let currentUser = null;

// ---- Helpers ----
async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts, credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function toast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.classList.add('removing'); setTimeout(() => t.remove(), 300); }, 3500);
}

function animateNumber(el, start, end, duration, prefix = '') {
  const startTime = performance.now();
  function update(t) {
    const p = Math.min((t - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(start + (end - start) * eased);
    if (p < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ---- Auth ----
async function checkAuth() {
  try {
    const data = await api('/api/auth/me');
    if (data.authenticated) { currentUser = data.user; showApp(); return; }
  } catch(e) {}
  showLogin();
}

function showLogin() {
  document.getElementById('login-overlay').classList.remove('hidden');
  document.getElementById('app-container').style.display = 'none';
}

function showApp() {
  document.getElementById('login-overlay').classList.add('hidden');
  document.getElementById('app-container').style.display = 'flex';
  document.getElementById('user-name').textContent = currentUser.name;
  document.getElementById('user-avatar').textContent = currentUser.avatar;
  loadAll();
}

async function handleLogout() {
  if (!confirm('Logout?')) return;
  try { await api('/api/auth/logout', { method: 'POST', body: {} }); } catch(e) {}
  currentUser = null;
  showLogin();
  toast('Logged out', 'info');
}

// ---- Navigation ----
function navigateTo(page) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  const navBtn = document.querySelector(`[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add('active');
  const titles = {
    dashboard:["Dashboard","Overview of your library system"],
    books:["Books Catalog","Browse and manage all books"],
    members:["Members","Library members and their activity"],
    borrowings:["Borrowings","Track all book borrowing records"],
    fines:["Fines","Monitor and manage overdue fines"],
    report:["DBMS Report","All DBMS topics covered in this project"],
    erdiagram:["ER Diagram","Entity-Relationship diagram and schema"],
    queries:["SQL Queries","Explore the DBMS concepts used"]
  };
  const t = titles[page] || ["Dashboard",""];
  document.getElementById('page-title').textContent = t[0];
  document.getElementById('page-subtitle').textContent = t[1];
}

// ---- Load All Data ----
function loadAll() {
  renderDashboard();
  renderBooks();
  renderMembers();
  renderBorrowings();
  renderFines();
  renderERDiagram();
  loadQueryList();
  navigateTo('dashboard');
}

// ---- Dashboard ----
async function renderDashboard() {
  try {
    const s = await api('/api/stats');
    const els = [
      ['stat-books', s.totalCopies, ''],
      ['stat-members', s.totalMembers, ''],
      ['stat-borrows', s.activeBorrows, ''],
      ['stat-fines', s.unpaidFines, '₹']
    ];
    els.forEach(([id, val, pre]) => {
      const el = document.getElementById(id);
      animateNumber(el, 0, val, 1000, pre);
    });
    // Recent borrowings
    const borrows = await api('/api/borrowings');
    const tbody = document.getElementById('recent-borrows-body');
    tbody.innerHTML = borrows.slice(0, 5).map(b => `<tr>
      <td style="color:var(--text-primary);font-weight:500">${b.book_title}</td>
      <td>${b.member_name}</td><td>${b.borrow_date}</td><td>${b.due_date}</td>
      <td><span class="badge ${b.status==='Returned'?'badge-success':b.status==='Overdue'?'badge-danger':'badge-warning'}">${b.status}</span></td>
    </tr>`).join('');
    // Category distribution
    const books = await api('/api/books');
    const totalBooks = books.reduce((s,b) => s + b.total_copies, 0);
    const catCounts = {};
    books.forEach(b => { catCounts[b.category] = (catCounts[b.category]||0) + b.total_copies; });
    document.getElementById('category-list').innerHTML = Object.entries(catCounts)
      .sort((a,b) => b[1]-a[1]).map(([cat,count]) => {
        const pct = Math.round(count/totalBooks*100);
        const color = categoryColors[cat]||'#64748b';
        return `<div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:13px;font-weight:500">${cat}</span>
            <span style="font-size:12px;color:var(--text-muted)">${count} copies (${pct}%)</span>
          </div>
          <div style="height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 1s ease"></div>
          </div></div>`;
      }).join('');
  } catch(e) { console.error('Dashboard error:', e); }
}

// ---- Books ----
async function renderBooks() {
  try {
    const books = await api('/api/books');
    document.getElementById('books-count').textContent = `${books.length} books`;
    document.getElementById('books-grid').innerHTML = books.map(b => {
      const color = categoryColors[b.category]||'#64748b';
      return `<div class="book-card">
        <span class="book-category" style="background:${color}20;color:${color}">${b.category||'—'}</span>
        <h4>${b.title}</h4>
        <p class="book-author">by ${b.author||'Unknown'} · ${b.year_published||'—'}</p>
        <div class="book-meta">
          <span class="book-price">₹${b.price}</span>
          <span class="book-stock">${b.available_copies}/${b.total_copies} available</span>
        </div>
      </div>`;
    }).join('');
  } catch(e) { toast('Failed to load books', 'error'); }
}

// ---- Members ----
async function renderMembers() {
  try {
    const members = await api('/api/members');
    document.getElementById('members-count').textContent = `${members.length} members`;
    document.getElementById('members-list').innerHTML = members.map((m,i) => {
      const initials = (m.first_name[0]||'')+(m.last_name[0]||'');
      const color = avatarColors[i % avatarColors.length];
      const typeBadge = m.membership_type==='Premium'?'badge-purple':m.membership_type==='Student'?'badge-info':'badge-success';
      return `<div class="member-row">
        <div class="member-avatar" style="background:${color}">${initials}</div>
        <div class="member-info"><h4>${m.first_name} ${m.last_name}</h4><p>${m.email||'—'}</p></div>
        <span class="badge ${typeBadge}">${m.membership_type}</span>
        <span style="font-size:12px;color:var(--text-muted);min-width:80px;text-align:right">${m.total_borrows||0} borrows</span>
      </div>`;
    }).join('');
  } catch(e) { toast('Failed to load members', 'error'); }
}

// ---- Borrowings ----
async function renderBorrowings() {
  try {
    const rows = await api('/api/borrowings');
    document.getElementById('borrowings-count').textContent = `${rows.length} records`;
    document.getElementById('borrowings-body').innerHTML = rows.map(b => `<tr>
      <td>${b.borrow_id}</td>
      <td style="color:var(--text-primary);font-weight:500">${b.book_title}</td>
      <td>${b.member_name}</td><td>${b.borrow_date}</td><td>${b.due_date}</td>
      <td>${b.return_date||'—'}</td>
      <td><span class="badge ${b.status==='Returned'?'badge-success':b.status==='Overdue'?'badge-danger':'badge-warning'}">${b.status}</span></td>
      <td>${b.status!=='Returned'?`<div class="table-actions"><button class="btn-icon success" onclick="returnBook(${b.borrow_id})" title="Return">↩️</button></div>`:'—'}</td>
    </tr>`).join('');
  } catch(e) { toast('Failed to load borrowings', 'error'); }
}

async function returnBook(id) {
  if (!confirm('Mark this book as returned?')) return;
  try {
    const res = await api(`/api/borrowings/${id}/return`, { method: 'PUT', body: {} });
    toast(res.fine_amount > 0 ? `Returned! Fine: ₹${res.fine_amount} (${res.days_overdue} days overdue)` : 'Book returned successfully!', res.fine_amount > 0 ? 'info' : 'success');
    renderBorrowings(); renderBooks(); renderDashboard(); renderFines();
  } catch(e) { toast(e.message, 'error'); }
}

// ---- Fines ----
async function renderFines() {
  try {
    const rows = await api('/api/fines');
    document.getElementById('fines-body').innerHTML = rows.map(f => `<tr>
      <td>${f.fine_id}</td>
      <td style="color:var(--text-primary);font-weight:500">${f.member_name}</td>
      <td>${f.book_title}</td>
      <td style="color:var(--accent-amber);font-weight:600">₹${f.amount}</td>
      <td><span class="badge ${f.paid?'badge-success':'badge-danger'}">${f.paid?'Paid':'Unpaid'}</span></td>
      <td>${f.fine_date}</td>
      <td>${!f.paid?`<button class="btn btn-sm btn-success" onclick="payFine(${f.fine_id})">Pay</button>`:'✅'}</td>
    </tr>`).join('');
  } catch(e) { toast('Failed to load fines', 'error'); }
}

async function payFine(id) {
  if (!confirm('Mark this fine as paid?')) return;
  try {
    await api(`/api/fines/${id}/pay`, { method: 'PUT', body: {} });
    toast('Fine marked as paid!', 'success');
    renderFines(); renderDashboard();
  } catch(e) { toast(e.message, 'error'); }
}

// ---- Modals ----
function openModal(title, bodyHTML, footerHTML) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-footer').innerHTML = footerHTML;
  document.getElementById('modal-overlay').classList.add('show');
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('show'); }

// ---- Book Modal ----
async function openBookModal() {
  let authors = [], cats = [], pubs = [];
  try {
    [authors, cats, pubs] = await Promise.all([
      api('/api/books/authors'), api('/api/books/categories'), api('/api/books/publishers')
    ]);
  } catch(e) { toast('Failed to load form data', 'error'); return; }
  const body = `
    <div class="form-group"><label>Title *</label><input id="bf-title" placeholder="Book title"></div>
    <div class="form-row">
      <div class="form-group"><label>ISBN</label><input id="bf-isbn" placeholder="ISBN"></div>
      <div class="form-group"><label>Price (₹)</label><input id="bf-price" type="number" placeholder="0"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Author</label><select id="bf-author"><option value="">Select</option>${authors.map(a=>`<option value="${a.author_id}">${a.name}</option>`).join('')}</select></div>
      <div class="form-group"><label>Category</label><select id="bf-cat"><option value="">Select</option>${cats.map(c=>`<option value="${c.category_id}">${c.name}</option>`).join('')}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Publisher</label><select id="bf-pub"><option value="">Select</option>${pubs.map(p=>`<option value="${p.publisher_id}">${p.name}</option>`).join('')}</select></div>
      <div class="form-group"><label>Copies</label><input id="bf-copies" type="number" value="1" min="1"></div>
    </div>
    <div class="form-group"><label>Year Published</label><input id="bf-year" type="number" placeholder="2024"></div>`;
  const footer = `<button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveBook()">Add Book</button>`;
  openModal('Add New Book', body, footer);
}

async function saveBook() {
  const data = {
    title: document.getElementById('bf-title').value,
    isbn: document.getElementById('bf-isbn').value,
    price: document.getElementById('bf-price').value,
    author_id: document.getElementById('bf-author').value || null,
    category_id: document.getElementById('bf-cat').value || null,
    publisher_id: document.getElementById('bf-pub').value || null,
    total_copies: document.getElementById('bf-copies').value,
    year_published: document.getElementById('bf-year').value
  };
  if (!data.title) { toast('Title is required', 'error'); return; }
  try {
    await api('/api/books', { method: 'POST', body: data });
    toast('Book added!', 'success'); closeModal(); renderBooks(); renderDashboard();
  } catch(e) { toast(e.message, 'error'); }
}

// ---- Member Modal ----
function openMemberModal() {
  const body = `
    <div class="form-row">
      <div class="form-group"><label>First Name *</label><input id="mf-fn" placeholder="First name"></div>
      <div class="form-group"><label>Last Name *</label><input id="mf-ln" placeholder="Last name"></div>
    </div>
    <div class="form-group"><label>Email</label><input id="mf-email" type="email" placeholder="email@example.com"></div>
    <div class="form-row">
      <div class="form-group"><label>Phone</label><input id="mf-phone" placeholder="Phone number"></div>
      <div class="form-group"><label>Membership</label><select id="mf-type"><option value="Basic">Basic</option><option value="Student">Student</option><option value="Premium">Premium</option></select></div>
    </div>`;
  const footer = `<button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveMember()">Add Member</button>`;
  openModal('Add New Member', body, footer);
}

async function saveMember() {
  const data = {
    first_name: document.getElementById('mf-fn').value,
    last_name: document.getElementById('mf-ln').value,
    email: document.getElementById('mf-email').value,
    phone: document.getElementById('mf-phone').value,
    membership_type: document.getElementById('mf-type').value
  };
  if (!data.first_name || !data.last_name) { toast('Name is required', 'error'); return; }
  try {
    await api('/api/members', { method: 'POST', body: data });
    toast('Member added!', 'success'); closeModal(); renderMembers(); renderDashboard();
  } catch(e) { toast(e.message, 'error'); }
}

// ---- Borrow Modal ----
async function openBorrowModal() {
  let books = [], members = [];
  try {
    [books, members] = await Promise.all([
      api('/api/borrowings/available-books'), api('/api/borrowings/members-list')
    ]);
  } catch(e) { toast('Failed to load form data', 'error'); return; }
  const defaultDue = new Date(Date.now() + 14*86400000).toISOString().split('T')[0];
  const body = `
    <div class="form-group"><label>Book *</label><select id="brf-book"><option value="">Select a book</option>${books.map(b=>`<option value="${b.book_id}">${b.title} (${b.available_copies} avail)</option>`).join('')}</select></div>
    <div class="form-group"><label>Member *</label><select id="brf-member"><option value="">Select a member</option>${members.map(m=>`<option value="${m.member_id}">${m.name}</option>`).join('')}</select></div>
    <div class="form-group"><label>Due Date *</label><input id="brf-due" type="date" value="${defaultDue}"></div>`;
  const footer = `<button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-success" onclick="saveBorrow()">Issue Book</button>`;
  openModal('Issue a Book', body, footer);
}

async function saveBorrow() {
  const data = {
    book_id: document.getElementById('brf-book').value,
    member_id: document.getElementById('brf-member').value,
    due_date: document.getElementById('brf-due').value
  };
  if (!data.book_id || !data.member_id || !data.due_date) { toast('All fields required', 'error'); return; }
  try {
    await api('/api/borrowings', { method: 'POST', body: data });
    toast('Book issued!', 'success'); closeModal();
    renderBorrowings(); renderBooks(); renderDashboard();
  } catch(e) { toast(e.message, 'error'); }
}

// ---- Live SQL Query Runner ----
async function loadQueryList() {
  try {
    const list = await api('/api/query/list');
    document.getElementById('query-select-grid').innerHTML = list.map(q =>
      `<button class="query-option" data-key="${q.key}" onclick="runQuery('${q.key}', this)">${q.label}</button>`
    ).join('');
  } catch(e) { console.error('Query list error:', e); }
}

async function runQuery(key, btn) {
  document.querySelectorAll('.query-option').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const box = document.getElementById('query-result-box');
  box.classList.add('show');
  document.getElementById('qr-title').textContent = 'Loading...';
  document.getElementById('qr-count').textContent = '';
  document.getElementById('qr-sql').textContent = '';
  document.getElementById('qr-table').innerHTML = '<tr><td class="loading-state"><span class="spinner"></span> Running query...</td></tr>';
  try {
    const res = await api('/api/query/run', { method: 'POST', body: { key } });
    document.getElementById('qr-title').textContent = res.label;
    document.getElementById('qr-count').textContent = `${res.count} rows`;
    document.getElementById('qr-sql').textContent = res.sql;
    const thead = `<thead><tr>${res.columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${res.rows.map(r => `<tr>${res.columns.map(c => `<td>${r[c]!==null&&r[c]!==undefined?r[c]:'—'}</td>`).join('')}</tr>`).join('')}</tbody>`;
    document.getElementById('qr-table').innerHTML = thead + tbody;
  } catch(e) { toast(e.message, 'error'); box.classList.remove('show'); }
}

// ---- Search ----
function handleSearch(e) {
  const q = e.target.value.toLowerCase();
  const activePage = document.querySelector('.page-section.active')?.id?.replace('page-','');
  if (activePage === 'books') {
    document.querySelectorAll('.book-card').forEach(card => {
      card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }
}

// ---- ER Diagram ----
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
              const isPK=a.includes('PK'),isFK=a.includes('FK'),isUK=a.includes('UK');
              const name=a.replace(' PK','').replace(' FK','').replace(' UK','');
              let badge='';
              if(isPK) badge='<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(16,185,129,0.2);color:#10b981;font-weight:700;margin-left:auto">PK</span>';
              if(isFK) badge='<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(59,130,246,0.2);color:#3b82f6;font-weight:700;margin-left:auto">FK</span>';
              if(isUK) badge='<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(139,92,246,0.2);color:#8b5cf6;font-weight:700;margin-left:auto">UK</span>';
              return `<div style="display:flex;align-items:center;padding:3px 0;font-size:12px;color:#94a3b8;gap:6px">
                <span style="color:${isPK?'#10b981':isFK?'#3b82f6':'#94a3b8'};font-weight:${isPK?'600':'400'}">${name}</span>${badge}</div>`;
            }).join('')}
          </div>
        </div>`).join('')}
    </div>
    <div style="margin-top:24px;display:flex;gap:20px;justify-content:center;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8"><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:rgba(16,185,129,0.3)"></span> PK = Primary Key</div>
      <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8"><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:rgba(59,130,246,0.3)"></span> FK = Foreign Key</div>
      <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8"><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:rgba(139,92,246,0.3)"></span> UK = Unique Key</div>
    </div>`;
}

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
  // Login form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('login-error');
    errEl.classList.remove('show');
    try {
      const res = await api('/api/auth/login', {
        method: 'POST',
        body: { username: document.getElementById('login-user').value, password: document.getElementById('login-pass').value }
      });
      currentUser = res.user;
      toast(`Welcome, ${currentUser.name}!`, 'success');
      showApp();
    } catch(e) {
      errEl.textContent = e.message;
      errEl.classList.add('show');
    }
  });
  // Modal close on overlay click
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  checkAuth();
});
