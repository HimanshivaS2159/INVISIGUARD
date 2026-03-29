/**
 * INVISIGUARD - Fraud Detection Dashboard
 */

const API = 'http://127.0.0.1:5000/api/v1';

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

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    initializeNavigation();
    initializeEventListeners();
    initializeCharts();
    loadTransactionHistory();
    fetchLiveAnalytics();
    startRealTimeUpdates();
});

// ─── Navigation ───────────────────────────────────────────────────────────────

function initializeNavigation() {
    elements.navTabs.forEach(tab => {
        tab.addEventListener('click', function () { switchTab(this.dataset.tab); });
    });
}

function switchTab(tabName) {
    elements.navTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    elements.tabContents.forEach(c => c.classList.toggle('active', c.id === `${tabName}-tab`));
    state.currentTab = tabName;
    if (tabName === 'analytics') updateAnalyticsCharts();
    else if (tabName === 'alerts') updateAlertsList();
}

// ─── Event Listeners ──────────────────────────────────────────────────────────

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
        if (e.key >= '1' && e.key <= '5')
            switchTab(['dashboard', 'analyze', 'analytics', 'alerts', 'settings'][parseInt(e.key) - 1]);
    });
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function resetForm() {
    elements.amountSlider.value = 1000;
    elements.amountValue.textContent = '1,000';
    elements.nightToggle.checked = false;
    elements.locationToggle.checked = false;
    elements.deviceToggle.checked = false;
    elements.resultsSection.style.display = 'none';
    showToast('Form reset', 'success');
}

// ─── Analyze ──────────────────────────────────────────────────────────────────

async function analyzeTransaction() {
    const amount = parseInt(elements.amountSlider.value);
    if (!amount || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }

    const payload = {
        amount,
        is_night: elements.nightToggle.checked ? 1 : 0,
        new_location: elements.locationToggle.checked ? 1 : 0,
        new_device: elements.deviceToggle.checked ? 1 : 0
    };

    await _callAndDisplay(payload);
}

// ─── Simulate ─────────────────────────────────────────────────────────────────

async function simulateFraud() {
    showToast('🚨 Simulating fraud scenario...', 'warning');
    showLoading(true);
    try {
        const res = await fetch(`${API}/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenario: 'fraud' })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();

        // Reflect simulated inputs on sliders/toggles
        if (result.input) {
            elements.amountSlider.value = result.input.amount;
            elements.amountValue.textContent = result.input.amount.toLocaleString();
            elements.nightToggle.checked = result.input.is_night === 1;
            elements.locationToggle.checked = result.input.new_location === 1;
            elements.deviceToggle.checked = result.input.new_device === 1;
        }

        displayResults(result);
        addToHistory({ amount: result.input?.amount || 0 }, result);
        updateStats(result);
        addAlert(result);
        updateDashboard();
        showToast(`🚨 Fraud Simulated! Risk: ${result.risk_score}`, 'error');
    } catch (err) {
        console.error(err);
        showToast('Simulation failed. Is the backend running?', 'error');
    } finally {
        showLoading(false);
    }
}

// ─── Shared call + display ────────────────────────────────────────────────────

async function _callAndDisplay(payload) {
    try {
        showLoading(true);
        const res = await fetch(`${API}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();

        displayResults(result);
        addToHistory(payload, result);
        updateStats(result);
        addAlert(result);
        updateDashboard();

        const msg = result.result === 'FRAUD'
            ? `🚨 Fraud Detected! Risk: ${result.risk_score}`
            : `✅ Transaction Safe! Risk: ${result.risk_score}`;
        showToast(msg, result.result === 'FRAUD' ? 'error' : 'success');
    } catch (err) {
        console.error(err);
        showToast('Analysis failed. Is the backend running?', 'error');
    } finally {
        showLoading(false);
    }
}

// ─── Display Results ──────────────────────────────────────────────────────────

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
    const circumference = 2 * Math.PI * 90;

    // Set circle color based on score
    const color = targetScore > 70 ? '#ef4444' : targetScore > 40 ? '#f59e0b' : '#22c55e';
    elements.riskCircle.style.stroke = color;
    elements.riskScore.style.color = color;

    function update() {
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(targetScore * eased);
        elements.riskScore.textContent = current;
        elements.riskCircle.style.strokeDashoffset = circumference - (current / 100) * circumference;
        if (progress < 1) requestAnimationFrame(update);
    }
    update();
}

function updateResultBadge(result) {
    elements.resultBadge.className = `result-badge ${result.toLowerCase()}`;
    const badgeText = elements.resultBadge.querySelector('.badge-text');
    if (badgeText) badgeText.textContent = result;
    else elements.resultBadge.textContent = result;
}

function updateConfidence(confidence) {
    const pct = Math.round(confidence * 100);
    elements.confidenceFill.style.width = `${pct}%`;
    elements.confidencePercentage.textContent = `${pct}%`;
}

function updateReasons(reasons) {
    elements.reasonsList.innerHTML = '';
    reasons.forEach((reason, i) => {
        const li = document.createElement('li');
        li.className = 'reason-item';
        li.style.cssText = 'opacity:0;transform:translateX(-20px)';
        li.innerHTML = `<span class="reason-icon">${getReasonIcon(reason)}</span><span>${reason}</span>`;
        elements.reasonsList.appendChild(li);
        setTimeout(() => {
            li.style.transition = 'all 0.3s ease';
            li.style.opacity = '1';
            li.style.transform = 'translateX(0)';
        }, i * 100);
    });
}

function getReasonIcon(r) {
    r = r.toLowerCase();
    if (r.includes('amount')) return '💳';
    if (r.includes('night') || r.includes('hour')) return '🌙';
    if (r.includes('location')) return '📍';
    if (r.includes('device')) return '📱';
    if (r.includes('ml') || r.includes('model')) return '🤖';
    if (r.includes('frequency') || r.includes('rapid')) return '⚡';
    if (r.includes('velocity') || r.includes('spike')) return '📈';
    return '🔍';
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

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

// ─── Live Analytics from backend ─────────────────────────────────────────────

async function fetchLiveAnalytics() {
    try {
        const res = await fetch(`${API}/analytics/summary`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.total_transactions > 0) {
            state.stats.totalTransactions = data.total_transactions;
            state.stats.fraudDetected = data.fraudulent_transactions;
            state.stats.safeTransactions = data.safe_transactions;
            state.stats.avgRiskScore = data.average_risk_score;
            updateStatsDisplay();
        }

        // Update analytics tab if open
        if (state.currentTab === 'analytics') updateAnalyticsCharts(data);
    } catch (e) {
        // Backend not reachable — use local state
    }
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function initializeCharts() {
    createVolumeChart();
    createActivityHeatmap();
}

function createVolumeChart() {
    const chart = elements.volumeChart;
    if (!chart) return;
    chart.innerHTML = '';
    [65, 78, 90, 45, 88, 72, 56, 91, 73, 68, 82, 59].forEach((v, i) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${v}%`;
        bar.title = `Day ${i + 1}: ${v} transactions`;
        chart.appendChild(bar);
    });
}

function createActivityHeatmap() {
    const heatmap = elements.activityHeatmap;
    if (!heatmap) return;
    heatmap.innerHTML = '';
    for (let h = 0; h < 24; h++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        const risk = Math.random();
        cell.classList.add(risk > 0.7 ? 'high' : risk > 0.4 ? 'medium' : 'low');
        cell.title = `${h}:00 — ${Math.round(risk * 100)}% activity`;
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

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function updateAnalyticsCharts(data) {
    if (elements.riskTrendChart) elements.riskTrendChart.innerHTML = '<div class="line-chart"></div>';

    // Fraud vs Safe pie
    if (elements.fraudPieChart && data) {
        const fraud = data.fraudulent_transactions || 0;
        const safe = data.safe_transactions || 0;
        const total = fraud + safe || 1;
        const fraudPct = Math.round((fraud / total) * 100);
        elements.fraudPieChart.innerHTML = `
            <div style="text-align:center;padding:20px">
                <div style="font-size:2.5rem;font-weight:800;color:#ef4444">${fraudPct}%</div>
                <div style="color:#94a3b8;margin-top:4px">Fraud Rate</div>
                <div style="margin-top:12px;display:flex;gap:16px;justify-content:center;font-size:0.85rem">
                    <span style="color:#ef4444">🔴 Fraud: ${fraud}</span>
                    <span style="color:#22c55e">🟢 Safe: ${safe}</span>
                </div>
            </div>`;
    }

    // Risk factors
    if (elements.riskFactorsChart && data && data.top_risk_factors?.length) {
        elements.riskFactorsChart.innerHTML = '';
        data.top_risk_factors.forEach(f => {
            const maxCount = data.top_risk_factors[0].count || 1;
            const pct = Math.round((f.count / maxCount) * 100);
            const item = document.createElement('div');
            item.className = 'h-bar-item';
            item.innerHTML = `
                <div class="h-bar-label">${f.factor.substring(0, 30)}</div>
                <div class="h-bar-container"><div class="h-bar-fill" style="width:${pct}%"></div></div>
                <div class="h-bar-value">${f.count}</div>`;
            elements.riskFactorsChart.appendChild(item);
        });
    } else {
        createRiskFactorsChartDefault();
    }
}

function createRiskFactorsChartDefault() {
    const chart = elements.riskFactorsChart;
    if (!chart) return;
    chart.innerHTML = '';
    [{ label: 'High Amount', value: 85 }, { label: 'New Location', value: 72 },
     { label: 'New Device', value: 68 }, { label: 'Night Transaction', value: 45 }]
        .forEach(f => {
            const item = document.createElement('div');
            item.className = 'h-bar-item';
            item.innerHTML = `
                <div class="h-bar-label">${f.label}</div>
                <div class="h-bar-container"><div class="h-bar-fill" style="width:${f.value}%"></div></div>
                <div class="h-bar-value">${f.value}%</div>`;
            chart.appendChild(item);
        });
}

// ─── Recent Activity ──────────────────────────────────────────────────────────

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
        const color = tx.result === 'FRAUD' ? '#ef4444' : '#22c55e';
        item.innerHTML = `
            <span class="activity-icon" style="color:${color}">${icon}</span>
            <div class="activity-content">
                <div class="activity-title">₹${tx.amount.toLocaleString()} — ${tx.result}</div>
                <div class="activity-time">${new Date(tx.timestamp).toLocaleTimeString()}</div>
            </div>`;
        activity.appendChild(item);
    });
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

function addAlert(result) {
    if (result.result !== 'FRAUD') return;
    state.alerts.unshift({
        id: Date.now(),
        amount: result.transaction_data?.amount || 0,
        reason: result.reasons?.[0] || 'High risk detected',
        time: new Date().toISOString(),
        risk: result.risk_score > 70 ? 'high' : 'medium'
    });
    if (state.alerts.length > 20) state.alerts.pop();
    if (state.currentTab === 'alerts') updateAlertsList();
}

function _renderAlerts(list) {
    const el = elements.alertsList;
    if (!el) return;
    el.innerHTML = '';
    if (!list.length) { el.innerHTML = '<div class="alert-item">No alerts at this time</div>'; return; }
    list.forEach(alert => {
        const div = document.createElement('div');
        div.className = `alert-item ${alert.risk}-risk`;
        const icon = alert.risk === 'high' ? '🚨' : '⚠️';
        div.innerHTML = `
            <span class="alert-icon">${icon}</span>
            <div class="alert-content">
                <div class="alert-title">Fraud Detected — ₹${Number(alert.amount).toLocaleString()}</div>
                <div class="alert-details">${alert.reason}</div>
                <div class="alert-time">${new Date(alert.time).toLocaleTimeString()}</div>
            </div>
            <span class="alert-badge ${alert.risk}">${alert.risk.toUpperCase()}</span>`;
        el.appendChild(div);
    });
}

function updateAlertsList() { _renderAlerts(state.alerts); }

function filterAlerts(filter) {
    elements.filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
    _renderAlerts(filter === 'all' ? state.alerts : state.alerts.filter(a => a.risk === filter));
}

// ─── History ──────────────────────────────────────────────────────────────────

function addToHistory(txData, result) {
    state.transactionHistory.unshift({
        amount: txData.amount || 0,
        result: result.result,
        riskScore: result.risk_score,
        timestamp: new Date().toISOString()
    });
    if (state.transactionHistory.length > 20) state.transactionHistory = state.transactionHistory.slice(0, 20);
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
            <span class="history-amount">₹${Number(tx.amount).toLocaleString()}</span>
            <span class="history-risk">${tx.riskScore}</span>
            <span class="history-result ${tx.result.toLowerCase()}">${tx.result}</span>`;
        table.appendChild(item);
    });
}

// ─── Persistence ──────────────────────────────────────────────────────────────

function saveTransactionHistory() {
    try { localStorage.setItem('invisiguard_history', JSON.stringify(state.transactionHistory)); }
    catch (e) { console.warn('Save failed:', e); }
}

function loadTransactionHistory() {
    try {
        const saved = localStorage.getItem('invisiguard_history');
        if (saved) { state.transactionHistory = JSON.parse(saved); updateHistoryTable(); }
    } catch (e) { console.warn('Load failed:', e); }
}

// ─── Loading ──────────────────────────────────────────────────────────────────

function showLoading(show) {
    state.isLoading = show;
    if (elements.loadingOverlay) elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    if (elements.analyzeBtn) elements.analyzeBtn.disabled = show;
    if (elements.simulateBtn) elements.simulateBtn.disabled = show;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const title = { success: '✅ Success', error: '❌ Error', warning: '⚠️ Warning' }[type] || 'ℹ️ Info';
    toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-message">${message}</div>`;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3500);
}

// ─── Export / Refresh ─────────────────────────────────────────────────────────

function exportData() {
    const blob = new Blob([JSON.stringify({
        stats: state.stats, history: state.transactionHistory,
        alerts: state.alerts, exportTime: new Date().toISOString()
    }, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: `invisiguard-${Date.now()}.json`
    });
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Data exported', 'success');
}

async function refreshDashboard() {
    await fetchLiveAnalytics();
    updateDashboard();
    showToast('Dashboard refreshed', 'success');
}

// ─── Real-time updates ────────────────────────────────────────────────────────

function startRealTimeUpdates() {
    // Refresh charts every 5s
    setInterval(() => { if (state.currentTab === 'dashboard') updateCharts(); }, 5000);
    // Pull live analytics every 30s
    setInterval(fetchLiveAnalytics, 30000);
    // Simulate background alerts occasionally
    setInterval(() => {
        if (Math.random() > 0.85) {
            state.alerts.unshift({
                id: Date.now(),
                amount: Math.floor(Math.random() * 50000) + 1000,
                reason: 'Suspicious pattern detected',
                time: new Date().toISOString(),
                risk: Math.random() > 0.5 ? 'high' : 'medium'
            });
            if (state.alerts.length > 20) state.alerts.pop();
            if (state.currentTab === 'alerts') updateAlertsList();
        }
    }, 20000);
}

// ─── Global error handling ────────────────────────────────────────────────────

window.addEventListener('error', () => showToast('An unexpected error occurred', 'error'));
window.addEventListener('online', () => showToast('Connection restored', 'success'));
window.addEventListener('offline', () => showToast('Connection lost', 'error'));
