function initSharedComponents() {
    const user = getLoggedUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    injectHeader(user);
    injectSidebar(user);
    injectBottomNav(user);
    highlightActiveLink();
}

function injectHeader(user) {
    const container = document.getElementById('app-container');
    const header = `
        <header class="mobile-header">
            <div class="mobile-logo">
                <span>📡</span>
                <span>Ponto das Antenas</span>
            </div>
            <button class="btn-icon color-danger" onclick="logout()" title="Sair">
                <span class="material-symbols-rounded">logout</span>
            </button>
        </header>
    `;
    container.insertAdjacentHTML('afterbegin', header);
}

function injectSidebar(user) {
    const isAdmin = user.role === 'Administrador';
    const sidebar = `
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <span class="logo-emoji">📡</span>
                    <div class="logo-text">
                        <h2>Ponto das Antenas</h2>
                        <span id="userRoleBadge" class="badge">${user.role}</span>
                    </div>
                </div>
            </div>

            <nav class="sidebar-nav">
                <div class="nav-section">
                    <div class="nav-section-title">Principal</div>
                    <div class="nav-item" data-page="dashboard" onclick="navigateTo('dashboard')">
                        <span class="material-symbols-rounded">dashboard</span>
                        Dashboard
                    </div>
                    <div class="nav-item" data-page="ordens" onclick="navigateTo('ordens')">
                        <span class="material-symbols-rounded">receipt_long</span>
                        Ordens de Serviço
                    </div>
                    ${isAdmin || user.role === 'Vendedor' ? `
                    <div class="nav-item" data-page="vendas" onclick="navigateTo('vendas')">
                        <span class="material-symbols-rounded">shopping_cart</span>
                        Vendas
                    </div>
                    ` : ''}
                </div>

                <div class="nav-section" id="navGroupCadastros" style="display: ${isAdmin ? 'block' : 'none'}">
                    <div class="nav-section-title">Cadastros</div>
                    <div class="nav-item" data-page="tecnicos" onclick="navigateTo('tecnicos')">
                        <span class="material-symbols-rounded">group</span>
                        Colaboradores
                    </div>
                </div>
            </nav>

            <div class="sidebar-footer">
                <div class="sidebar-footer-top">
                    <div class="user-info">
                        <div class="user-avatar">${user.nome.charAt(0).toUpperCase()}</div>
                        <div class="user-details">
                            <span class="user-name">${user.nome}</span>
                            <span class="user-email">${user.email}</span>
                        </div>
                    </div>
                </div>
                <button class="btn-logout" onclick="logout()" title="Sair do sistema">
                    <span class="material-symbols-rounded">logout</span>
                    <span class="logout-text">Sair</span>
                </button>
            </div>
        </aside>
    `;
    const container = document.getElementById('app-container');
    container.insertAdjacentHTML('afterbegin', sidebar);
}

function injectBottomNav(user) {
    const isAdmin = user && user.role === 'Administrador';
    const bottomNav = `
        <nav class="bottom-nav">
            <a class="nav-item-mobile" id="mobileNavItemDashboard" onclick="navigateTo('dashboard')">
                <span class="material-symbols-rounded">dashboard</span>
                <span>Início</span>
            </a>
            <a class="nav-item-mobile" id="mobileNavItemOrdens" onclick="navigateTo('ordens')">
                <span class="material-symbols-rounded">receipt_long</span>
                <span>OS</span>
            </a>
            ${isAdmin || (user && user.role === 'Vendedor') ? `
            <a class="nav-item-mobile" id="mobileNavItemVendas" onclick="navigateTo('vendas')">
                <span class="material-symbols-rounded">shopping_cart</span>
                <span>Vendas</span>
            </a>
            ` : ''}
            ${isAdmin ? `
            <a class="nav-item-mobile" id="mobileNavItemTecnicos" onclick="navigateTo('tecnicos')">
                <span class="material-symbols-rounded">group</span>
                <span>Equipe</span>
            </a>
            ` : ''}
        </nav>
    `;
    const container = document.getElementById('app-container');
    container.insertAdjacentHTML('beforeend', bottomNav);
}

function highlightActiveLink() {
    const path = window.location.pathname;
    const page = path.split("/").pop().split(".")[0] || 'dashboard';

    // Sidebar highlight
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        }
    });

    // Mobile nav highlight
    const mobileId = `mobileNavItem${page.charAt(0).toUpperCase() + page.slice(1)}`;
    const mobileItem = document.getElementById(mobileId);
    if (mobileItem) mobileItem.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('app-container')) {
        initSharedComponents();
    }
});
