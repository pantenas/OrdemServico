let statusChart, prioridadeChart, tecnicosChart, evolucaoChart;

function initCharts() {
    const ordens = getOrdens();
    renderStatusChart(ordens);
    renderPrioridadeChart(ordens);
    renderTecnicosChart(ordens);
    renderEvolucaoChart(ordens);
    updateKPIs(ordens);
}

function updateKPIs(ordens) {
    document.getElementById('kpiTotal').textContent = ordens.length;
    document.getElementById('kpiAberta').textContent = ordens.filter(o => o.status === 'Aberta').length;
    document.getElementById('kpiConcluida').textContent = ordens.filter(o => o.status === 'Concluída').length;
}

function renderStatusChart(ordens) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    const data = {
        labels: ['Aberta', 'Em Andamento', 'Concluída', 'Cancelada'],
        datasets: [{
            data: [
                ordens.filter(o => o.status === 'Aberta').length,
                ordens.filter(o => o.status === 'Em Andamento').length,
                ordens.filter(o => o.status === 'Concluída').length,
                ordens.filter(o => o.status === 'Cancelada').length
            ],
            backgroundColor: ['#eab308', '#3b82f6', '#22c55e', '#ef4444']
        }]
    };

    if (statusChart) statusChart.destroy();
    statusChart = new Chart(ctx, { type: 'doughnut', data, options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } } });
}

function renderPrioridadeChart(ordens) {
    const ctx = document.getElementById('prioridadeChart').getContext('2d');
    const data = {
        labels: ['Baixa', 'Média', 'Alta', 'Urgente'],
        datasets: [{
            data: [
                ordens.filter(o => o.prioridade === 'Baixa').length,
                ordens.filter(o => o.prioridade === 'Média').length,
                ordens.filter(o => o.prioridade === 'Alta').length,
                ordens.filter(o => o.prioridade === 'Urgente').length
            ],
            backgroundColor: ['#94a3b8', '#3b82f6', '#eab308', '#ef4444']
        }]
    };

    if (prioridadeChart) prioridadeChart.destroy();
    prioridadeChart = new Chart(ctx, { type: 'polarArea', data, options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } } });
}

function renderTecnicosChart(ordens) {
    const ctx = document.getElementById('tecnicosChart').getContext('2d');
    const counts = {};
    ordens.forEach(o => counts[o.tecnico] = (counts[o.tecnico] || 0) + 1);

    const data = {
        labels: Object.keys(counts),
        datasets: [{
            label: 'Ordens por Colaborador',
            data: Object.values(counts),
            backgroundColor: '#3b82f6'
        }]
    };

    if (tecnicosChart) tecnicosChart.destroy();
    tecnicosChart = new Chart(ctx, { type: 'bar', data, options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } }, plugins: { legend: { display: false } } } });
}

function renderEvolucaoChart(ordens) {
    const ctx = document.getElementById('evolucaoChart').getContext('2d');
    // Implementação simplificada de evolução por mês
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const data = {
        labels: months,
        datasets: [{
            label: 'OS Criadas',
            data: [12, 19, ordens.length, 5, 2, 3],
            borderColor: '#3b82f6',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }]
    };

    if (evolucaoChart) evolucaoChart.destroy();
    evolucaoChart = new Chart(ctx, { type: 'line', data, options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } }, plugins: { legend: { display: false } } } });
}
