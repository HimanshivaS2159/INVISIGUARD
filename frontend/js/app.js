/**
 * INVISIGUARD - Fraud Detection Dashboard
 */

// Global State
const state = {
    currentTab: 'dashboard',
    transactionHistory: [],
    alerts: [],
    stats: {
        totalTransactions: 0,
        fraudDetected: 0,
        safeTransactions: 0,
        avgRiskScore: 0,
        totalRiskScore: 0
    },
    isLoading: false
};

// DOM Elements
const elements = {
    navTabs: document.querySelectorAll('.nav-tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    totalTransactions: document.getElementById('totalTransactions'),
    fraudDetected: document.getElementById('fraudDetected'),
    safeTransactions: document.getElementById('safeTransactions'),
    avgRiskScore: document.getElementById('avgRiskScore'),
    volumeChart: document.getElementById('volumeChart'),
    riskChart: document.getElementById('riskChart'),
    recentActivity: document.getElementById('recentActivity'),
    amountSlider: document.getElementById('amountSlider'),
    amountValue: document.getElementById('amountValue'),
    nightToggle: document.getElementById('nightToggle'),
    locationToggle: document.getElementById('locationToggle'),
    deviceToggle: document.getElementById('deviceToggle'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    resetBtn: document.getElementById('resetBtn'),
    simulateBtn: document.getElementById('simulateBtn'),
    resultsSection: document.getElementById('resultsSection'),
    riskScore: document.getElementById('riskScore'),
    riskCircle: document.getElementById('riskCircle'),
    resultBadge: document.getElementById('resultBadge'),
    confidenceFill: document.getElementById('confidenceFill'),
    confidencePercentage: document.getElementById('confidencePercentage'),
    reasonsList: document.getElementById('reasonsList'),
    riskTrendChart: document.getElementById('riskTrendChart'),
    fraudPieChart: document.getElementById('fraudPieChart'),
    riskFactorsChart: document.getElementById('riskFactorsChart'),
    activityHeatmap: document.getElementById('activityHeatmap'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    alertsList: document.getElementById('alertsList'),
    historyTable: document.getElementById('historyTable'),
    exportBtn: document.getElementById('exportBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    toastContainer: document.getElementById('toastContainer')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function () {
    initializeNavigation();
    initializeEventListeners();
    initializeCharts();
    loadTransactionHistory();
    startRealTimeUpdates();
    updateDashboard();
});

// Navigation
function initializeNavigation() {
    elements.navTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            switchTab(this.dataset.tab);
        });
    });
}

function switchTab(tabName) {
    elements.navTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === tabName));
    elements.tabContents.forEach(content => content.classList.toggle('active', content.id === `${tabName}-tab`));
    state.currentTab = tabName;
    if (tabName === 'analytics') updateAnalyticsCharts();
    else if (tabName === 'alerts') updateAlertsList();
}

// Event Listeners
function initializeEventListeners() {
    elements.amountSlider.addEventListener('input', function () {
        elements.amountValue.textContent = parseInt(this.value).toLocaleString();
    });
    elements.analyzeBtn.addEventListener('click', analyzeTransaction);
    elements.resetBtn.addEventListener('click', resetForm);
    elements.simulateBtn.addEventListener('click', simulateFraud);
    elements.filterBtns.forEach(btn => btn.addEventListener('click', function () {
        filterAlerts(this.dataset.filter);
    }));
    elements.exportBtn.addEventListener('click', exportData);
    elements.refreshBtn.addEventListener('click', refreshDashboard);
    elements.settingsBtn.addEventListener('click', () => switchTab('settings'));
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') analyzeTransaction();
        if (e.key >= '1' && e.key <= '5') {
            switchTab(['dashboard', 'analyze', 'analytics', 'alerts', 'settings'][parseInt(e.key) - 1]);
        }
    });
}

// Form
function resetForm() {
    elements.amountSlider.value = 1000;
    elements.amountValue.textContent = '1,000';
    elements.nightToggle.checked = false;
    elements.locationToggle.checked = false;
    elements.deviceToggle.checked = false;
    elements.resultsSection.style.display = 'none';
    showToast('Form reset successfully', 'success');
}

// Transaction Analysis
async function analyzeTransaction() {
    const amount = parseInt(elements.amountSlider.value);
    if (!amount || amount <= 0) {
        showToast('Please enter a valid transaction amount', 'error');
        return;
    }

    const transactionData = {
        amount: amount,
        is_night: elements.nightToggle.checked ? 1 : 0,
        new_location: elements.locationToggle.checked ? 1 : 0,
        new_device: elements.deviceToggle.checked ? 1 : 0
    };

    try {
        showLoading(true);
        const response = await fetch('http://127.0.0.1:5000/api/v1/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        displayResults(result);
        addToHistory(transactionData, result);
        updateStats(result);
        addAlert(result);
        updateDashboard();

        const message = result.result === 'FRAUD'
            ? `🚨 Fraud Detected! Risk Score: ${result.risk_score}`
            : `✅ Transaction Safe! Risk Score: ${result.risk_score}`;
        showToast(message, result.result === 'FRAUD' ? 'error' : 'success');

    } catch (error) {
        console.error('Analysis error:', error);
        showToast('Failed to analyze transaction. Is the backend running?', 'error');
    } finally {
        showLoading(false);
    }
}

// Simulate Fraud
function simulateFraud() {
    elements.amountSlider.value = 7500;
    elements.amountValue.textContent = '7,500';
    elements.nightToggle.checked = true;
    elements.locationToggle.checked = true;
    elements.deviceToggle.checked = true;
    showToast('🚨 Fraud simulation activated', 'warning');
    setTimeout(() => analyzeTransaction(), 500);
}

// Display Results
function displayResults(result) {
    elements.resultsSection.style.display = 'block';
    animateRiskScore(result.risk_score);
    updateResultBadge(result.result);
    updateConfidence(result.confidence);
    updateReasons(result.reasons);
}

function animateRiskScore(targetScore) {
    const duration = 1500;
    const startTime = Date.now();

    function update() {
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(targetScore * eased);
        elements.riskScore.textContent = current;

        const circumference = 2 * Math.PI * 90;
        elements.riskCircle.style.strokeDashoffset = circumference - (current / 100) * circumference;

        if (progress < 1) requestAnimationFrame(update);
    }
    update();
}

function updateResultBadge(result) {
    elements.resultBadge.className = `result-badge ${result.toLowerCase()}`;
    // Update text — handle both .badge-text child and direct text
    const badgeText = elements.resultBadge.querySelector('.badge-text');
    if (badgeText) {
        badgeText.textContent = result;
    } else {
        elements.resultBadge.textContent = result;
    }
}

function updateConfidence(confidence) {
    const pct = Math.round(confidence * 100);
    elements.confidenceFill.style.width = `${pct}%`;
    elements.confidencePercentage.textContent = `${pct}%`;
}

function updateReasons(reasons) {
    elements.reasonsList.innerHTML = '';
    reasons.forEach((reason, index) => {
        const li = document.createElement('li');
        li.className = 'reason-item';
        li.style.cssText = 'opacity:0; transform:translateX(-20px)';
        li.innerHTML = `<span class="reason-icon">${getReasonIcon(reason)}</span><span>${reason}</span>`;
        elements.reasonsList.appendChild(li);
        setTimeout(() => {
            li.style.transition = 'all 0.3s ease';
            li.style.opacity = '1';
            li.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

function getReasonIcon(reason) {
    const r = reason.toLowerCase();
    if (r.includes('amount')) return '💳';
    if (r.includes('night')) return '🌙';
    if (r.includes('location')) return '📍';
    if (r.includes('device')) return '📱';
    if (r.includes('high')) return '⚠️';
    return '🔍';
}

// Dashboard
function updateDashboard() {
    updateStatsDisplay();
    updateCharts();
    updateRecentActivity();
    updateHistoryTable();
}

function updateStatsDisplay() {
    elements.totalTransactions.textContent = state.stats.totalTransactions;
    elements.fraudDetected.textContent = state.stats.fraudDetected;
    elements.safeTransactions.textContent = state.stats.safeTransactions;
    elements.avgRiskScore.textContent = state.stats.avgRiskScore;
}

function updateStats(result) {
    state.stats.totalTransactions++;
    state.stats.totalRiskScore += result.risk_score;
    if (result.result === 'FRAUD') state.stats.fraudDetected++;
    else state.stats.safeTransactions++;
    state.stats.avgRiskScore = Math.round(state.stats.totalRiskScore / state.stats.totalTransactions);
}

// Charts
function initializeCharts() {
    createVolumeChart();
    createActivityHeatmap();
}

function createVolumeChart() {
    const chart = elements.volumeChart;
    if (!chart) return;
    chart.innerHTML = '';
    [65, 78, 90, 45, 88, 72, 56, 91, 73, 68, 82, 59].forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${value}%`;
        bar.title = `Day ${index + 1}: ${value} transactions`;
        chart.appendChild(bar);
    });
}

function createActivityHeatmap() {
    const heatmap = elements.activityHeatmap;
    if (!heatmap) return;
    heatmap.innerHTML = '';
    for (let hour = 0; hour < 24; hour++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        const risk = Math.random();
        cell.classList.add(risk > 0.7 ? 'high' : risk > 0.4 ? 'medium' : 'low');
        cell.title = `Hour ${hour}:00 - ${Math.round(risk * 100)}% activity`;
        heatmap.appendChild(cell);
    }
}

function updateCharts() {
    const chart = elements.volumeChart;
    if (!chart || !chart.children.length) return;
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${Math.random() * 100}%`;
    chart.appendChild(bar);
    if (chart.children.length > 12) chart.removeChild(chart.firstChild);
}

// Analytics
function updateAnalyticsCharts() {
    if (elements.riskTrendChart) elements.riskTrendChart.innerHTML = '<div class="line-chart"></div>';
    if (elements.fraudPieChart) elements.fraudPieChart.innerHTML = '<div class="pie-chart-large"></div>';
    createRiskFactorsChart();
}

function createRiskFactorsChart() {
    const chart = elements.riskFactorsChart;
    if (!chart) return;
    chart.innerHTML = '';
    [{ label: 'Amount', value: 85 }, { label: 'Location', value: 72 }, { label: 'Device', value: 68 }, { label: 'Time', value: 45 }]
        .forEach(factor => {
            const item = document.createElement('div');
            item.className = 'h-bar-item';
            item.innerHTML = `
                <div class="h-bar-label">${factor.label}</div>
                <div class="h-bar-container"><div class="h-bar-fill" style="width:${factor.value}%"></div></div>
                <div class="h-bar-value">${factor.value}%</div>`;
            chart.appendChild(item);
        });
}

// Recent Activity
function updateRecentActivity() {
    const activity = elements.recentActivity;
    if (!activity) return;
    activity.innerHTML = '';
    const recent = state.transactionHistory.slice(0, 5);
    if (!recent.length) {
        activity.innerHTML = '<div class="activity-item">No recent activity</div>';
        return;
    }
    recent.forEach(tx => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        const icon = tx.result === 'FRAUD' ? '🚨' : '✅';
        const color = tx.result === 'FRAUD' ? 'var(--danger-red, #ef4444)' : 'var(--primary-green, #22c55e)';
        item.innerHTML = `
            <span class="activity-icon" style="color:${color}">${icon}</span>
            <div class="activity-content">
                <div class="activity-title">$${tx.amount.toLocaleString()} - ${tx.result}</div>
                <div class="activity-time">${new Date(tx.timestamp).toLocaleTimeString()}</div>
            </div>`;
        activity.appendChild(item);
    });
}

// Alerts
function addAlert(result) {
    if (result.result !== 'FRAUD') return;
    state.alerts.unshift({
        id: Date.now(),
        amount: result.transaction_data?.amount || 0,
        reason: result.reasons?.[0] || 'High risk detected',
        time: new Date().toISOString(),
        risk: 'high'
    });
    if (state.alerts.length > 10) state.alerts.pop();
    if (state.currentTab === 'alerts') updateAlertsList();
}

function updateAlertsList() {
    const list = elements.alertsList;
    if (!list) return;
    list.innerHTML = '';
    if (!state.alerts.length) {
        list.innerHTML = '<div class="alert-item">No alerts at this time</div>';
        return;
    }
    state.alerts.forEach(alert => {
        const div = document.createElement('div');
        div.className = `alert-item ${alert.risk}-risk`;
        const icon = alert.risk === 'high' ? '🚨' : alert.risk === 'medium' ? '⚠️' : '🔍';
        div.innerHTML = `
            <span class="alert-icon">${icon}</span>
            <div class="alert-content">
                <div class="alert-title">Fraud Detected - $${alert.amount.toLocaleString()}</div>
                <div class="alert-details">${alert.reason}</div>
                <div class="alert-time">${new Date(alert.time).toLocaleTimeString()}</div>
            </div>
            <span class="alert-badge ${alert.risk}">${alert.risk.toUpperCase()}</span>`;
        list.appendChild(div);
    });
}

function filterAlerts(filter) {
    elements.filterBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));
    const filtered = filter === 'all' ? state.alerts : state.alerts.filter(a => a.risk === filter);
    const list = elements.alertsList;
    if (!list) return;
    list.innerHTML = '';
    filtered.forEach(alert => {
        const div = document.createElement('div');
        div.className = `alert-item ${alert.risk}-risk`;
        const icon = alert.risk === 'high' ? '🚨' : alert.risk === 'medium' ? '⚠️' : '🔍';
        div.innerHTML = `
            <span class="alert-icon">${icon}</span>
            <div class="alert-content">
                <div class="alert-title">Fraud Detected - $${alert.amount.toLocaleString()}</div>
                <div class="alert-details">${alert.reason}</div>
                <div class="alert-time">${new Date(alert.time).toLocaleTimeString()}</div>
            </div>
            <span class="alert-badge ${alert.risk}">${alert.risk.toUpperCase()}</span>`;
        list.appendChild(div);
    });
}

// History
function addToHistory(txData, result) {
    state.transactionHistory.unshift({
        amount: txData.amount,
        result: result.result,
        riskScore: result.risk_score,
        timestamp: new Date().toISOString()
    });
    if (state.transactionHistory.length > 10) state.transactionHistory = state.transactionHistory.slice(0, 10);
    saveTransactionHistory();
}

function updateHistoryTable() {
    const table = elements.historyTable;
    if (!table) return;
    table.innerHTML = '';
    if (!state.transactionHistory.length) {
        table.innerHTML = '<div class="history-item">No transactions yet</div>';
        return;
    }
    state.transactionHistory.slice(0, 5).forEach(tx => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <span class="history-amount">$${tx.amount.toLocaleString()}</span>
            <span class="history-risk">${tx.riskScore}</span>
            <span class="history-result ${tx.result.toLowerCase()}">${tx.result}</span>`;
        table.appendChild(item);
    });
}

// Persistence
function saveTransactionHistory() {
    try { localStorage.setItem('invisiguard_history', JSON.stringify(state.transactionHistory)); }
    catch (e) { console.warn('Could not save history:', e); }
}

function loadTransactionHistory() {
    try {
        const saved = localStorage.getItem('invisiguard_history');
        if (saved) { state.transactionHistory = JSON.parse(saved); updateHistoryTable(); }
    } catch (e) { console.warn('Could not load history:', e); }
}

// Loading
function showLoading(show) {
    state.isLoading = show;
    if (elements.loadingOverlay) elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    if (elements.analyzeBtn) elements.analyzeBtn.disabled = show;
}

// Toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const title = type === 'success' ? '✅ Success' : type === 'error' ? '❌ Error' : type === 'warning' ? '⚠️ Warning' : 'ℹ️ Info';
    toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-message">${message}</div>`;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// Actions
function exportData() {
    const data = { stats: state.stats, history: state.transactionHistory, alerts: state.alerts, exportTime: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invisiguard-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully', 'success');
}

function refreshDashboard() {
    updateDashboard();
    showToast('Dashboard refreshed', 'success');
}

// Real-time Updates
function startRealTimeUpdates() {
    setInterval(() => { if (state.currentTab === 'dashboard') updateCharts(); }, 5000);
    setInterval(() => {
        if (Math.random() > 0.8) {
            state.alerts.unshift({
                id: Date.now(),
                amount: Math.floor(Math.random() * 10000) + 1000,
                reason: 'Suspicious activity detected',
                time: new Date().toISOString(),
                risk: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
            });
            if (state.alerts.length > 10) state.alerts.pop();
            if (state.currentTab === 'alerts') updateAlertsList();
        }
    }, 15000);
}

// Error handling
window.addEventListener('error', () => showToast('An unexpected error occurred', 'error'));
window.addEventListener('online', () => showToast('Connection restored', 'success'));
window.addEventListener('offline', () => showToast('Connection lost', 'error'));
