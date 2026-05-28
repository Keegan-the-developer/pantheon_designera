document.addEventListener('DOMContentLoaded', () => {
    const PROTECTED_PAGES = [
        'pd.html', 'успешные примеры.html', 
        'tools.html', 'steps.html', 'FAQ.html', 
        'форма обратной связи.html', 'login.html', 'admin.html', 'article.html'
    ];

    const currentUser = localStorage.getItem('adminUser');
    if (window.location.pathname.includes('admin.html') && !currentUser) {
        window.location.href = 'login.html';
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('adminUser', username);
                window.location.href = 'admin.html';
            } else {
                document.getElementById('errorMsg').style.display = 'block';
            }
        });
    }

    if (window.location.pathname.includes('admin.html')) {
        const addBtn = document.getElementById('addArticleBtn');
        const deleteBtn = document.getElementById('deleteArticleBtn');
        const addModal = document.getElementById('addArticleModal');
        const deleteModal = document.getElementById('deleteArticleModal');
        const closeBtns = document.querySelectorAll('.close');
        const logoutBtn = document.getElementById('headerLogout');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('adminUser');
                window.location.href = 'pd.html';
            });
        }

        //модальные окна
        addBtn.onclick = () => addModal.style.display = 'flex';
        deleteBtn.onclick = () => { renderArticlesList(); deleteModal.style.display = 'flex'; };
        closeBtns.forEach(btn => btn.onclick = () => { 
            addModal.style.display = 'none'; deleteModal.style.display = 'none'; 
        });
        window.onclick = (e) => {
            if (e.target == addModal) addModal.style.display = 'none';
            if (e.target == deleteModal) deleteModal.style.display = 'none';
        };

        // Сохранение статьи
        document.getElementById('saveArticleBtn').onclick = () => {
            const title = document.getElementById('articleTitle').value.trim();
            const content = document.getElementById('articleContent').value.trim();
            if (!title || !content) return alert('⚠️ Заполните название и текст статьи');
            
            const articles = JSON.parse(localStorage.getItem('articles') || '[]');
            const slug = title.toLowerCase().replace(/[^\wа-яёА-ЯЁ]/g, '-') + '.html';
            
            if (articles.find(a => a.slug === slug)) {
                return alert('⚠️ Статья с таким названием уже существует');
            }
            
            articles.push({ id: Date.now(), title, slug, content, date: new Date().toLocaleDateString() });
            localStorage.setItem('articles', JSON.stringify(articles));
            
            alert('✅ Статья успешно добавлена!');
            addModal.style.display = 'none';
            document.getElementById('articleTitle').value = '';
            document.getElementById('articleContent').value = '';
        };

        // Рендер списка для удаления
        function renderArticlesList() {
            const list = document.getElementById('articlesList');
            const articles = JSON.parse(localStorage.getItem('articles') || '[]');
            list.innerHTML = '';
            
            if (articles.length === 0) {
                list.innerHTML = '<p style="color:#aaa; text-align:center;">Нет пользовательских статей.</p>';
                return;
            }
            
            articles.forEach(article => {
                const isProtected = PROTECTED_PAGES.includes(article.slug);
                const div = document.createElement('div');
                div.className = 'article-item';
                div.innerHTML = `
                    <span>${article.title} <small style="color:#aaa;">(${article.date})</small></span>
                    ${!isProtected 
                        ? `<button class="delete-article-btn" data-slug="${article.slug}">Удалить</button>` 
                        : `<span style="color:#666; font-size:12px;">🔒 Системная</span>`}
                `;
                list.appendChild(div);
            });
            
            document.querySelectorAll('.delete-article-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const slug = e.target.dataset.slug;
                    if (PROTECTED_PAGES.includes(slug)) return;
                    if (!confirm('Вы уверены, что хотите удалить эту статью?')) return;
                    
                    let articles = JSON.parse(localStorage.getItem('articles') || '[]');
                    articles = articles.filter(a => a.slug !== slug);
                    localStorage.setItem('articles', JSON.stringify(articles));
                    renderArticlesList();
                });
            });
        }
    }
});