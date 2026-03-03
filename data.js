const MOCK_TECNICOS = [
    { id: '1', nome: 'Carlos Silva', especialidade: 'Técnico', telefone: '(11) 99999-1111', email: 'carlos.silva@pontodasantenas.com', senha: '123', role: 'Técnico' },
    { id: '2', nome: 'Ana Oliveira', especialidade: 'Vendedor', telefone: '(11) 99999-2222', email: 'ana.oliveira@pontodasantenas.com', senha: '123', role: 'Vendedor' },
    { id: '3', nome: 'Roberto Santos', especialidade: 'Técnico', telefone: '(11) 99999-3333', email: 'roberto.santos@pontodasantenas.com', senha: '123', role: 'Técnico' },
    { id: '4', nome: 'Admin', especialidade: 'Administrador', telefone: '(11) 99999-4444', email: 'admin@pontodasantenas.com', senha: 'admin', role: 'Administrador' }
];

const MOCK_ORDENS = [
    {
        id: '101',
        numero: '00001',
        cliente: 'João Pereira',
        telefone: '(11) 98888-0001',
        endereco: 'Rua das Flores, 123, São Paulo',
        descricao: 'Instalação de antena digital externa',
        tipo: 'Instalação',
        prioridade: 'Média',
        status: 'Aberta',
        tecnico: 'Carlos Silva',
        data: new Date().toISOString(),
        previsao: new Date().toISOString().split('T')[0],
        valor: '150.00',
        pago: false,
        fotos: []
    },
    {
        id: '102',
        numero: '00002',
        cliente: 'Maria Souza',
        telefone: '(11) 98888-0002',
        endereco: 'Av. Paulista, 1000, São Paulo',
        descricao: 'Manutenção em sistema de recepção',
        tipo: 'Manutenção',
        prioridade: 'Alta',
        status: 'Em Andamento',
        tecnico: 'Roberto Santos',
        data: new Date().toISOString(),
        previsao: new Date().toISOString().split('T')[0],
        valor: '250.00',
        pago: true,
        fotos: []
    }
];

// DATA LAYER
function getOrdens() {
    const data = localStorage.getItem('pontodasantenas_ordens');
    if (!data) {
        saveOrdens(MOCK_ORDENS);
        return MOCK_ORDENS;
    }
    return JSON.parse(data);
}

function saveOrdens(ordens) {
    localStorage.setItem('pontodasantenas_ordens', JSON.stringify(ordens));
}

function getTecnicos() {
    const data = localStorage.getItem('pontodasantenas_tecnicos');
    if (!data) {
        saveTecnicos(MOCK_TECNICOS);
        return MOCK_TECNICOS;
    }
    return JSON.parse(data);
}

function saveTecnicos(tecnicos) {
    localStorage.setItem('pontodasantenas_tecnicos', JSON.stringify(tecnicos));
}

function getLoggedUser() {
    return JSON.parse(localStorage.getItem('pontodasantenas_user'));
}

function setLoggedUser(user) {
    localStorage.setItem('pontodasantenas_user', JSON.stringify(user));
}
