// GLOBAL STATE
let currentFotos = [];

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    initForms();

    setOnDataUpdate((type) => {
        const path = window.location.pathname;
        if (type === 'ordens' && path.includes('ordens')) {
            renderOrdensTable();
            const user = getLoggedUser();
            if (user && user.role === 'Técnico' && typeof renderTechChart === 'function') {
                renderTechChart(user);
            }
        }
        if (type === 'tecnicos' && path.includes('tecnicos')) {
            renderTecnicosGrid();
        }
        if (type === 'vendas' && path.includes('vendas')) {
            renderVendasList();
        }
        if (typeof initCharts === 'function' && path.includes('dashboard')) {
            initCharts();
        }
    });
});

// AUTHENTICATION
function checkSession() {
    const user = getLoggedUser();
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '';

    if (user) {
        if (isLoginPage) {
            window.location.href = user.role === 'Técnico' ? 'ordens.html' : 'dashboard.html';
        } else if (user.role === 'Técnico' && (window.location.pathname.endsWith('tecnicos.html') || window.location.pathname.endsWith('vendas.html'))) {
            window.location.href = 'ordens.html';
        }
    } else {
        if (!isLoginPage) {
            window.location.href = 'index.html';
        }
    }
}

function showApp(user) {
    setLoggedUser(user);
    window.location.href = user.role === 'Técnico' ? 'ordens.html' : 'dashboard.html';
}

function logout() {
    localStorage.removeItem('pontodasantenas_user');
    window.location.href = 'index.html';
}

// NAVIGATION
function navigateTo(page) {
    window.location.href = `${page}.html`;
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

        if (user.role === 'Técnico') return o.tecnico === user.nome && matchesSearch && matchesStatus;
        return matchesSearch && matchesStatus && matchesTecnico;
    });

    const container = document.getElementById('ordensList');
    if (!container) return; // For pages without the list

    container.innerHTML = filtered.map(o => `
        <div class="list-row">
            <div class="list-info">
                <div class="user-avatar" style="background: ${o.status === 'Concluída' ? 'var(--success)' : 'var(--primary-orange)'}">#</div>
                <div class="list-details">
                    <span class="list-title">OS #${o.numero} - ${o.cliente}</span>
                    <span class="list-subtitle">${o.tipo} • ${new Date(o.data).toLocaleDateString()} • ${o.tecnico}</span>
                    <div style="display: flex; gap: 8px; margin-top: 4px;">
                        <span class="status-pill ${o.status.toLowerCase().replace(' ', '-')}">${o.status}</span>
                        <span class="priority-label ${o.prioridade.toLowerCase()}">${o.prioridade}</span>
                    </div>
                </div>
            </div>
            <div class="list-actions">
                <button class="btn-icon color-whatsapp" onclick="contactWhatsapp('${o.telefone}')" title="WhatsApp"><span class="material-symbols-rounded">chat</span></button>
                <button class="btn-icon" onclick="editOrdem('${o.id}')" title="Editar"><span class="material-symbols-rounded">edit</span></button>
                ${user.role === 'Administrador' ? `<button class="btn-icon color-danger" onclick="deleteOrdem('${o.id}')" title="Excluir"><span class="material-symbols-rounded">delete</span></button>` : ''}
                <button class="btn-icon" onclick="printOS('${o.id}')" title="Imprimir"><span class="material-symbols-rounded">print</span></button>
            </div>
        </div>
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
                    body { font-family: 'Courier New', Courier, monospace; width: 50mm; padding: 5px; margin: 0; font-size: 14px; }
                    .header { text-align: center; border-bottom: 1px solid black; padding-bottom: 5px; margin-bottom: 5px; }
                    .bold { font-weight: bold; }
                    .row { display: flex; justify-content: space-between; margin: 2px 0; }
                    .divider { border-top: 1px dashed black; margin: 5px 0; }
                    .footer { text-align: center; margin-top: 10px; font-size: 12px; }
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
    if (select) {
        const current = select.value;
        select.innerHTML = '<option value="">Colaborador</option>' + tecnicos.map(t => `<option value="${t}" ${t === current ? 'selected' : ''}>${t}</option>`).join('');
    }

    const modalSelect = document.getElementById('ordemTecnico');
    if (modalSelect) {
        const techs = getTecnicos();
        modalSelect.innerHTML = techs.map(t => `<option value="${t.nome}">${t.nome} (${t.role})</option>`).join('');
    }
}

// FORMS
function initForms() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = e => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const senha = document.getElementById('loginSenha').value;
            const user = getTecnicos().find(u => u.email === email && u.senha === senha);
            if (user) showApp(user);
            else alert('login ou senha inválido');
        };
    }

    const ordemForm = document.getElementById('ordemForm');
    if (ordemForm) {
        ordemForm.onsubmit = e => {
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
                    saveOrdemDB(novaOrdem); // Edit
                } else {
                    saveOrdemDB(novaOrdem); // Create (using generated ID)
                }

                closeModal('modalOrdem');
            } catch (err) {
                console.error('Erro ao salvar ordem:', err);
                alert('Erro ao salvar OS: ' + err.message);
            }
        };
    }

    const tecnicoForm = document.getElementById('tecnicoForm');
    if (tecnicoForm) {
        tecnicoForm.onsubmit = e => {
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
                    saveTecnicoDB(novoTecnico);
                } else {
                    saveTecnicoDB(novoTecnico);
                }

                closeModal('modalTecnico');
            } catch (err) {
                console.error('Erro ao salvar colaborador:', err);
                alert('Erro ao salvar: ' + err.message);
            }
        };
    }

    const vendaForm = document.getElementById('vendaForm');
    if (vendaForm) {
        vendaForm.onsubmit = e => {
            e.preventDefault();
            try {
                const id = document.getElementById('vendaId').value;
                const vendas = getVendas();
                const novaVenda = {
                    id: id || Date.now().toString(),
                    codigo: document.getElementById('vendaCodigo').value,
                    scua: document.getElementById('vendaSCUA').value,
                    caid: document.getElementById('vendaCAID').value,
                    lancada: document.getElementById('vendaLancada').checked,
                    data: id ? vendas.find(v => v.id === id).data : new Date().toISOString(),
                    fotos: currentFotos || []
                };

                if (id) {
                    saveVendaDB(novaVenda);
                } else {
                    saveVendaDB(novaVenda);
                }

                closeModal('modalVenda');
            } catch (err) {
                console.error('Erro ao salvar venda:', err);
                alert('Erro ao salvar: ' + err.message);
            }
        };
    }
}

function resetOrdemForm() {
    const form = document.getElementById('ordemForm');
    if (!form) return;
    form.reset();
    document.getElementById('ordemId').value = '';
    const title = document.getElementById('modalOrdemTitle');
    if (title) title.textContent = 'Nova Ordem de Serviço';
    populateFilters(getOrdens());
    currentFotos = [];
    renderFotosPreview();
}

function resetTecnicoForm() {
    const form = document.getElementById('tecnicoForm');
    if (!form) return;
    form.reset();
    document.getElementById('tecnicoId').value = '';
    const title = document.getElementById('modalTecnicoTitle');
    if (title) title.textContent = 'Novo Colaborador';
}

function resetVendaForm() {
    const form = document.getElementById('vendaForm');
    if (!form) return;
    form.reset();
    document.getElementById('vendaId').value = '';
    const title = document.getElementById('modalVendaTitle');
    if (title) title.textContent = 'Registrar Venda';
    if (document.getElementById('vendaSCUA')) document.getElementById('vendaSCUA').value = '';
    if (document.getElementById('vendaCAID')) document.getElementById('vendaCAID').value = '';
    if (document.getElementById('vendaLancada')) document.getElementById('vendaLancada').checked = false;
    currentFotos = [];
    renderFotosPreview();
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';

    if (modalId === 'modalOrdem') {
        resetOrdemForm();
    } else if (modalId === 'modalTecnico') {
        resetTecnicoForm();
    } else if (modalId === 'modalVenda') {
        resetVendaForm();
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
        deleteOrdemDB(id);
    }
}

function contactWhatsapp(telefone) {
    const tel = telefone.replace(/\D/g, '');
    if (tel) window.open(`https://wa.me/55${tel}`, '_blank');
}

function shareWhatsapp() {
    const tel = document.getElementById('ordemTelefone').value;
    contactWhatsapp(tel);
}

// VENDAS
function renderVendasList() {
    const vendas = getVendas();
    const container = document.getElementById('vendasList');
    if (!container) return;

    const search = document.getElementById('searchVendas').value.toLowerCase();
    const filtered = vendas.filter(v =>
        (v.codigo || "").toLowerCase().includes(search) ||
        (v.scua || "").toLowerCase().includes(search) ||
        (v.caid || "").toLowerCase().includes(search)
    );

    container.innerHTML = filtered.map(v => `
        <div class="list-row ${v.lancada ? 'is-lancada' : ''}">
            <div class="list-info">
                <div class="user-avatar" style="background: ${v.lancada ? 'var(--primary-orange)' : 'var(--whatsapp)'}">
                    <span class="material-symbols-rounded">shopping_cart</span>
                </div>
                <div class="list-details">
                    <span class="list-title">Venda: ${v.codigo} ${v.lancada ? '<span class="badge" style="background: var(--primary-orange); color: white; margin-left: 8px;">Lançada</span>' : ''}</span>
                    <span class="list-subtitle">SCUA: ${v.scua || '-'} • CAID: ${v.caid || '-'}</span>
                    <span class="list-subtitle">${new Date(v.data).toLocaleDateString()}</span>
                    ${v.fotos.length > 0 ? `<span class="badge" style="width: fit-content; background: var(--info); margin-top: 4px;">${v.fotos.length} fotos</span>` : ''}
                </div>
            </div>
            <div class="list-actions">
                <button class="btn-icon" onclick="editVenda('${v.id}')" title="Editar"><span class="material-symbols-rounded">edit</span></button>
                <button class="btn-icon color-danger" onclick="deleteVenda('${v.id}')" title="Excluir"><span class="material-symbols-rounded">delete</span></button>
            </div>
        </div>
    `).join('');
}

function editVenda(id) {
    const v = getVendas().find(item => item.id === id);
    openModal('modalVenda');
    document.getElementById('modalVendaTitle').textContent = 'Editar Venda';
    document.getElementById('vendaId').value = v.id;
    document.getElementById('vendaCodigo').value = v.codigo;
    document.getElementById('vendaSCUA').value = v.scua || '';
    document.getElementById('vendaCAID').value = v.caid || '';
    document.getElementById('vendaLancada').checked = v.lancada || false;
    currentFotos = v.fotos || [];
    renderFotosPreview();
}

function deleteVenda(id) {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
        deleteVendaDB(id);
    }
}

async function startBarcodeScanner(fieldId) {
    try {
        const { BarcodeScanner } = window.Capacitor.Plugins;
        if (!BarcodeScanner) {
            const code = prompt("Scanner não disponível. Digite o código:");
            if (code) document.getElementById(fieldId).value = code;
            return;
        }

        // Check/Request permissions
        const status = await BarcodeScanner.checkPermissions();
        if (status.camera !== 'granted') {
            const request = await BarcodeScanner.requestPermissions();
            if (request.camera !== 'granted') {
                alert('Permissão de câmera negada.');
                return;
            }
        }

        // Start scanning
        const { barcodes } = await BarcodeScanner.scan();
        if (barcodes && barcodes.length > 0) {
            document.getElementById(fieldId).value = barcodes[0].displayValue;
        }
    } catch (err) {
        console.error('Erro no scanner:', err);
        const code = prompt("Erro ao abrir câmera. Digite o código:");
        if (code) document.getElementById(fieldId).value = code;
    }
}

// TECNICOS
function renderTecnicosGrid() {
    const tecnicos = getTecnicos();
    const container = document.getElementById('tecnicosContainer');
    if (!container) return;

    container.innerHTML = tecnicos.map(t => `
        <div class="list-row">
            <div class="list-info">
                <div class="user-avatar">${t.nome.charAt(0).toUpperCase()}</div>
                <div class="list-details">
                    <span class="list-title">${t.nome}</span>
                    <span class="list-subtitle">${t.email}</span>
                    <span class="badge" style="width: fit-content;">${t.role.toUpperCase()}</span>
                </div>
            </div>
            <div class="list-actions">
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
        deleteTecnicoDB(id);
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

function handleFotoUpload(event) {
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
