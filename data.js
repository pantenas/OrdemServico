// INITIAL MOCKS (Used for reference or initial upload manually if needed)
const MOCK_TECNICOS = [
    { id: '1', nome: 'Carlos Silva', especialidade: 'Técnico', telefone: '(11) 99999-1111', email: 'carlos.silva@pontodasantenas.com', senha: '123', role: 'Técnico' },
    { id: '2', nome: 'Ana Oliveira', especialidade: 'Vendedor', telefone: '(11) 99999-2222', email: 'ana.oliveira@pontodasantenas.com', senha: '123', role: 'Vendedor' },
    { id: '3', nome: 'Roberto Santos', especialidade: 'Técnico', telefone: '(11) 99999-3333', email: 'roberto.santos@pontodasantenas.com', senha: '123', role: 'Técnico' },
    { id: '4', nome: 'Admin', especialidade: 'Administrador', telefone: '74991999999', email: 'admin@admin.com', senha: '123456', role: 'Administrador' }
];

// Local Cache
let localOrdens = [];
let localTecnicos = [];
let localVendas = [];

// Callbacks to update UI
let onDataUpdateCallback = null;

function setOnDataUpdate(cb) {
    onDataUpdateCallback = cb;
}

// Inicializa a escuta em tempo real do Supabase
async function initSupabaseListeners() {
    // Carrega dados iniciais da nuvem (se a tabela estiver vazia, retorna array vazio)
    await loadInitialData();

    // Começa a ouvir alterações em tempo real (INSERT, UPDATE, DELETE) em todas as tabelas
    supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ordens' }, async payload => {
            await loadInitialData('ordens');
            if (onDataUpdateCallback) onDataUpdateCallback('ordens');
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tecnicos' }, async payload => {
            await loadInitialData('tecnicos');
            if (onDataUpdateCallback) onDataUpdateCallback('tecnicos');
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, async payload => {
            await loadInitialData('vendas');
            if (onDataUpdateCallback) onDataUpdateCallback('vendas');
        })
        .subscribe();
}

async function loadInitialData(tabela = 'all') {
    if (tabela === 'all' || tabela === 'ordens') {
        const { data } = await supabase.from('ordens').select('*');
        if (data) localOrdens = data;
    }
    if (tabela === 'all' || tabela === 'tecnicos') {
        const { data } = await supabase.from('tecnicos').select('*');
        if (data) localTecnicos = data;
    }
    if (tabela === 'all' || tabela === 'vendas') {
        const { data } = await supabase.from('vendas').select('*');
        if (data) localVendas = data;
    }

    // Força uma rederização inicial em todas as telas registradas
    if (tabela === 'all' && onDataUpdateCallback) {
        onDataUpdateCallback('ordens');
        onDataUpdateCallback('tecnicos');
        onDataUpdateCallback('vendas');
    }
}

// Getters Síncronos
function getOrdens() { return localOrdens; }
function getTecnicos() { return localTecnicos; }
function getVendas() { return localVendas; }

// Modificadores Assíncronos no BD
// O Upsert serve tanto para Insert quanto para Update (baseado no ID)
async function saveOrdemDB(ordem) { await supabase.from('ordens').upsert([ordem]); }
async function deleteOrdemDB(id) { await supabase.from('ordens').delete().eq('id', id); }

async function saveTecnicoDB(tecnico) { await supabase.from('tecnicos').upsert([tecnico]); }
async function deleteTecnicoDB(id) { await supabase.from('tecnicos').delete().eq('id', id); }

async function saveVendaDB(venda) { await supabase.from('vendas').upsert([venda]); }
async function deleteVendaDB(id) { await supabase.from('vendas').delete().eq('id', id); }

// User Session (Mantém localmente)
function getLoggedUser() { return JSON.parse(localStorage.getItem('pontodasantenas_user')); }
function setLoggedUser(user) { localStorage.setItem('pontodasantenas_user', JSON.stringify(user)); }

// Sync com Supabase - Atualiza os dados dos técnicos com os mocks
async function syncDataWithSupabase() {
    try {
        if (typeof supabase === 'undefined') return;
        
        console.log('Sincronizando dados com Supabase...');
        
        // Para cada usuário mock, faz um upsert (atualiza se existe, insere se não)
        for (const tecnico of MOCK_TECNICOS) {
            await supabase.from('tecnicos').upsert([tecnico], { onConflict: 'email' });
        }
        
        console.log('Dados sincronizados com sucesso!');
        
        // Recarrega os dados após sincronizar
        await loadInitialData('tecnicos');
        
    } catch (error) {
        console.error('Erro ao sincronizar dados:', error);
    }
}

// Inicia escuta automaticamente
if (typeof supabase !== 'undefined') {
    // Sincroniza os dados primeiro, depois inicia os listeners
    syncDataWithSupabase().then(() => {
        initSupabaseListeners();
    });
}