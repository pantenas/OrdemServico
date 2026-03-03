// GLOBAL STATE
let currentFotos = [];

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    initForms();
});

// AUTHENTICATION
function checkSession() {
    const user = getLoggedUser();
    if (user) {
        showApp(user);
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
}

function showApp(user) {
    setLoggedUser(user);
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    document.getElementById('userName').textContent = user.nome;
    document.getElementById('userEmailLabel').textContent = user.email;
    document.getElementById('userInitial').textContent = user.nome.charAt(0).toUpperCase();
    document.getElementById('userRoleBadge').textContent = user.role;

    applyRBAC(user);
    if (user.role === 'Técnico') {
        navigateTo('ordens');
    } else {
        navigateTo('dashboard');
    }
}

function applyRBAC(user) {
    const isVendedor = user.role === 'Vendedor';
    const isTecnico = user.role === 'Técnico';
    const isAdmin = user.role === 'Administrador';

    document.getElementById('navGroupCadastros').style.display = isAdmin ? 'block' : 'none';

    if (isTecnico) {
        document.getElementById('navItemDashboard').style.display = 'none';
        document.getElementById('btnNovaOS').style.display = 'none';
        document.getElementById('techChartContainer').style.display = 'block';
    } else {
        document.getElementById('navItemDashboard').style.display = 'flex';
        document.getElementById('btnNovaOS').style.display = 'flex';
        document.getElementById('techChartContainer').style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('pontodasantenas_user');
    location.reload();
}

// NAVIGATION
function navigateTo(page) {
    document.querySelectorAll('.page-view').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById(`page-${page}`).style.display = 'block';
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    if (page === 'dashboard') initCharts();
    if (page === 'ordens') {
        renderOrdensTable();
        const user = getLoggedUser();
        if (user && user.role === 'Técnico') renderTechChart(user);
    }
    if (page === 'tecnicos') renderTecnicosGrid();
}

// ORDENS DE SERVIÇO
function renderOrdensTable() {
    const ordens = getOrdens();
    const user = getLoggedUser();
    const search = document.getElementById('searchOrdens').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const tecnicoFilter = document.getElementById('filterTecnico').value;

    let filtered = ordens.filter(o => {
        const matchesSearch = o.cliente.toLowerCase().includes(search) || o.numero.includes(search);
        const matchesStatus = !statusFilter || o.status === statusFilter;
        const matchesTecnico = !tecnicoFilter || o.tecnico === tecnicoFilter;

        // RBAC Filter: Técnico só vê as próprias ordens
        if (user.role === 'Técnico') return o.tecnico === user.nome && matchesSearch && matchesStatus;
        return matchesSearch && matchesStatus && matchesTecnico;
    });

    const body = document.getElementById('ordensBody');
    body.innerHTML = filtered.map(o => `
        <tr>
            <td><span class="os-number">#${o.numero}</span></td>
            <td>${new Date(o.data).toLocaleDateString()}</td>
            <td>
                <div class="cliente-cell">
                    ${o.cliente}
                    <div class="cliente-links">
                        <a href="https://wa.me/55${o.telefone.replace(/\D/g, '')}" target="_blank" class="wa-link-inline">
                            <span class="wa-icon">📡</span>
                            <span class="wa-text">WhatsApp</span>
                        </a>
                    </div>
                </div>
            </td>
            <td>${o.tipo}</td>
            <td>${o.tecnico}</td>
            <td><span class="status-pill ${o.status.toLowerCase().replace(' ', '-')}">${o.status}</span></td>
            <td><span class="priority-label ${o.prioridade.toLowerCase()}">${o.prioridade}</span></td>
            <td>
                <div class="actions">
                    <button class="btn-icon" onclick="editOrdem('${o.id}')" title="Editar"><span class="material-symbols-rounded">edit</span></button>
                    ${user.role === 'Administrador' ? `<button class="btn-icon color-danger" onclick="deleteOrdem('${o.id}')" title="Excluir"><span class="material-symbols-rounded">delete</span></button>` : ''}
                    <button class="btn-icon" onclick="printOS('${o.id}')" title="Imprimir"><span class="material-symbols-rounded">print</span></button>
                </div>
            </td>
        </tr>
    `).join('');

    populateFilters(ordens);
}

function printOS(id) {
    const o = getOrdens().find(item => item.id === id);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Imprimir OS #${o.numero}</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; width: 50mm; padding: 5px; margin: 0; font-size: 10px; }
                    .header { text-align: center; border-bottom: 1px solid black; padding-bottom: 5px; margin-bottom: 5px; }
                    .bold { font-weight: bold; }
                    .row { display: flex; justify-content: space-between; margin: 2px 0; }
                    .divider { border-top: 1px dashed black; margin: 5px 0; }
                    .footer { text-align: center; margin-top: 10px; font-size: 8px; }
                    .photo-container { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; }
                    .photo-container img { width: 100%; border: 1px solid #ccc; }
                </style>
            </head>
            <body>
                <div class="header">
                    <span class="bold">PONTO DAS ANTENAS</span><br>
                    Ordem de Serviço #${o.numero}
                </div>
                <div class="row"><span class="bold">Data:</span> <span>${new Date(o.data).toLocaleDateString()}</span></div>
                <div class="row"><span class="bold">Cliente:</span> <span>${o.cliente}</span></div>
                <div class="row"><span class="bold">Fone:</span> <span>${o.telefone}</span></div>
                <div class="divider"></div>
                <div class="bold">Descrição:</div>
                <div>${o.descricao}</div>
                <div class="divider"></div>
                ${o.fotos && o.fotos.length > 0 ? `
                    <div class="bold">Fotos do Serviço:</div>
                    <div class="photo-container">
                        ${o.fotos.map(f => `<img src="${f}">`).join('')}
                    </div>
                    <div class="divider"></div>
                ` : ''}
                <div class="row"><span class="bold">Técnico:</span> <span>${o.tecnico}</span></div>
                <div class="row"><span class="bold">Valor:</span> <span>R$ ${o.valor}</span></div>
                <div class="footer">Gerado em ${new Date().toLocaleString()}</div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
}

function populateFilters(ordens) {
    const tecnicos = [...new Set(ordens.map(o => o.tecnico))];
    const select = document.getElementById('filterTecnico');
    const current = select.value;
    select.innerHTML = '<option value="">Colaborador</option>' + tecnicos.map(t => `<option value="${t}" ${t === current ? 'selected' : ''}>${t}</option>`).join('');

    // Para o modal
    const modalSelect = document.getElementById('ordemTecnico');
    const techs = getTecnicos();
    modalSelect.innerHTML = techs.map(t => `<option value="${t.nome}">${t.nome} (${t.role})</option>`).join('');
}

// FORMS
function initForms() {
    document.getElementById('loginForm').onsubmit = e => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const senha = document.getElementById('loginSenha').value;
        const user = getTecnicos().find(u => u.email === email && u.senha === senha);
        if (user) showApp(user);
        else alert('login ou senha inválido');
    };

    document.getElementById('ordemForm').onsubmit = e => {
        e.preventDefault();
        try {
            const id = document.getElementById('ordemId').value;
            const ordens = getOrdens();
            const novaOrdem = {
                id: id || Date.now().toString(),
                numero: id ? ordens.find(o => o.id === id).numero : (ordens.length + 1).toString().padStart(5, '0'),
                cliente: document.getElementById('ordemCliente').value,
                telefone: document.getElementById('ordemTelefone').value,
                endereco: document.getElementById('ordemEndereco').value,
                tipo: document.getElementById('ordemTipo').value,
                prioridade: document.getElementById('ordemPrioridade').value,
                descricao: document.getElementById('ordemDescricao').value,
                tecnico: document.getElementById('ordemTecnico').value,
                status: document.getElementById('ordemStatus').value,
                data: id ? ordens.find(o => o.id === id).data : new Date().toISOString(),
                previsao: document.getElementById('ordemPrevisao').value,
                valor: document.getElementById('ordemValor').value,
                fotos: currentFotos || []
            };

            if (id) {
                const index = ordens.findIndex(o => o.id === id);
                if (index !== -1) ordens[index] = novaOrdem;
            } else {
                ordens.push(novaOrdem);
            }

            saveOrdens(ordens);
            closeModal('modalOrdem');
            renderOrdensTable();
        } catch (err) {
            console.error('Erro ao salvar ordem:', err);
            alert('Erro ao salvar OS: ' + err.message);
        }
    };

    document.getElementById('tecnicoForm').onsubmit = e => {
        e.preventDefault();
        try {
            const id = document.getElementById('tecnicoId').value;
            const tecnicos = getTecnicos();
            const novoTecnico = {
                id: id || Date.now().toString(),
                nome: document.getElementById('tecnicoNome').value,
                email: document.getElementById('tecnicoEmail').value,
                senha: document.getElementById('tecnicoSenha').value,
                role: document.getElementById('tecnicoRole').value,
                especialidade: document.getElementById('tecnicoEspecialidade').value,
                telefone: document.getElementById('tecnicoTelefone').value
            };

            if (id) {
                const index = tecnicos.findIndex(t => t.id === id);
                if (index !== -1) tecnicos[index] = novoTecnico;
            } else {
                tecnicos.push(novoTecnico);
            }

            saveTecnicos(tecnicos);
            closeModal('modalTecnico');
            renderTecnicosGrid();
        } catch (err) {
            console.error('Erro ao salvar colaborador:', err);
            alert('Erro ao salvar: ' + err.message);
        }
    };
}

function resetOrdemForm() {
    document.getElementById('ordemForm').reset();
    document.getElementById('ordemId').value = '';
    document.getElementById('modalOrdemTitle').textContent = 'Nova Ordem de Serviço';
    populateFilters(getOrdens());
    currentFotos = [];
    renderFotosPreview();
}

function resetTecnicoForm() {
    document.getElementById('tecnicoForm').reset();
    document.getElementById('tecnicoId').value = '';
    document.getElementById('modalTecnicoTitle').textContent = 'Novo Colaborador';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';

    if (modalId === 'modalOrdem') {
        resetOrdemForm();
    } else if (modalId === 'modalTecnico') {
        resetTecnicoForm();
    }
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function editOrdem(id) {
    const o = getOrdens().find(item => item.id === id);
    const modal = document.getElementById('modalOrdem');
    modal.style.display = 'flex';

    document.getElementById('modalOrdemTitle').textContent = `Editar OS #${o.numero}`;
    document.getElementById('ordemId').value = o.id;
    document.getElementById('ordemCliente').value = o.cliente;
    document.getElementById('ordemTelefone').value = o.telefone;
    document.getElementById('ordemEndereco').value = o.endereco;
    document.getElementById('ordemTipo').value = o.tipo;
    document.getElementById('ordemPrioridade').value = o.prioridade;
    document.getElementById('ordemDescricao').value = o.descricao;
    document.getElementById('ordemTecnico').value = o.tecnico;
    document.getElementById('ordemStatus').value = o.status;
    document.getElementById('ordemPrevisao').value = o.previsao;
    document.getElementById('ordemValor').value = o.valor;

    currentFotos = o.fotos || [];
    renderFotosPreview();
}

function deleteOrdem(id) {
    if (confirm('Tem certeza que deseja excluir esta OS?')) {
        const ordens = getOrdens().filter(o => o.id !== id);
        saveOrdens(ordens);
        renderOrdensTable();
    }
}

function shareWhatsapp() {
    const tel = document.getElementById('ordemTelefone').value.replace(/\D/g, '');
    if (tel) window.open(`https://wa.me/55${tel}`, '_blank');
}

// TECNICOS
function renderTecnicosGrid() {
    const tecnicos = getTecnicos();
    const container = document.getElementById('tecnicosContainer');
    if (!container) return;

    container.innerHTML = tecnicos.map(t => `
        <div class="kpi-card">
            <div class="user-info">
                <div class="user-avatar">${t.nome.charAt(0).toUpperCase()}</div>
                <div class="user-details">
                    <span class="user-name">${t.nome}</span>
                    <span class="user-email">${t.email}</span>
                    <span class="badge" style="margin-top: 4px; display: inline-block; width: fit-content;">${t.role}</span>
                </div>
            </div>
            <div class="actions">
                <button class="btn-icon" onclick="editTecnico('${t.id}')"><span class="material-symbols-rounded">edit</span></button>
                <button class="btn-icon color-danger" onclick="deleteTecnico('${t.id}')"><span class="material-symbols-rounded">delete</span></button>
            </div>
        </div>
    `).join('');
}

function editTecnico(id) {
    const t = getTecnicos().find(item => item.id === id);
    openModal('modalTecnico');
    document.getElementById('modalTecnicoTitle').textContent = 'Editar Colaborador';
    document.getElementById('tecnicoId').value = t.id;
    document.getElementById('tecnicoNome').value = t.nome;
    document.getElementById('tecnicoEmail').value = t.email;
    document.getElementById('tecnicoSenha').value = t.senha;
    document.getElementById('tecnicoRole').value = t.role;
    document.getElementById('tecnicoEspecialidade').value = t.especialidade;
    document.getElementById('tecnicoTelefone').value = t.telefone;
}

function deleteTecnico(id) {
    const user = getLoggedUser();
    if (user.id === id) {
        alert('Você não pode excluir seu próprio perfil.');
        return;
    }
    if (confirm('Tem certeza que deseja excluir este colaborador?')) {
        const tecnicos = getTecnicos().filter(t => t.id !== id);
        saveTecnicos(tecnicos);
        renderTecnicosGrid();
    }
}

let techStatusChart;
function renderTechChart(user) {
    const ordens = getOrdens().filter(o => o.tecnico === user.nome);
    const ctx = document.getElementById('techStatusChart').getContext('2d');

    const pendentes = ordens.filter(o => o.status !== 'Concluída' && o.status !== 'Cancelada').length;
    const concluidas = ordens.filter(o => o.status === 'Concluída').length;

    const data = {
        labels: ['Pendentes', 'Concluídas'],
        datasets: [{
            data: [pendentes, concluidas],
            backgroundColor: ['#eab308', '#22c55e']
        }]
    };

    if (techStatusChart) techStatusChart.destroy();
    techStatusChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#94a3b8' }
                }
            }
        }
    });
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    if (currentFotos.length + files.length > 5) {
        alert('Máximo de 5 fotos permitido.');
        return;
    }

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            compressImage(e.target.result, 800, 0.7).then(compressed => {
                currentFotos.push(compressed);
                renderFotosPreview();
            });
        };
        reader.readAsDataURL(file);
    });
}

function renderFotosPreview() {
    const preview = document.getElementById('fotosPreview');
    preview.innerHTML = currentFotos.map((foto, index) => `
        <div class="foto-item">
            <img src="${foto}" alt="Foto ${index + 1}">
            <button type="button" class="foto-remove" onclick="removeFoto(${index})">&times;</button>
        </div>
    `).join('');
}

function removeFoto(index) {
    currentFotos.splice(index, 1);
    renderFotosPreview();
}

function compressImage(base64, maxWidth, quality) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
    });
}
