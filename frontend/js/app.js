/**
 * INVISIGUARD - Premium Fintech Dashboard JavaScript
 * Enterprise-level fraud detection dashboard functionality
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
        avgRiskScore: 0
    },
    isLoading: false
};

// DOM Elements
const elements = {
    // Navigation
    navTabs: document.querySelectorAll('.nav-tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Dashboard
    totalTransactions: document.getElementById('totalTransactions'),
    fraudDetected: document.getElementById('fraudDetected'),
    safeTransactions: document.getElementById('safeTransactions'),
    avgRiskScore: document.getElementById('avgRiskScore'),
    volumeChart: document.getElementById('volumeChart'),
    riskChart: document.getElementById('riskChart'),
    recentActivity: document.getElementById('recentActivity'),
    
    // Analyze Tab
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
    
    // Analytics
    riskTrendChart: document.getElementById('riskTrendChart'),
    fraudPieChart: document.getElementById('fraudPieChart'),
    riskFactorsChart: document.getElementById('riskFactorsChart'),
    activityHeatmap: document.getElementById('activityHeatmap'),
    
    // Alerts
    filterBtns: document.querySelectorAll('.filter-btn'),
    alertsList: document.getElementById('alertsList'),
    
    // Insights Panel
    historyTable: document.getElementById('historyTable'),
    exportBtn: document.getElementById('exportBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    
    // UI Elements
    loadingOverlay: document.getElementById('loadingOverlay'),
    toastContainer: document.getElementById('toastContainer')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 INVISIGUARD Premium Dashboard Initialized');
    initializeNavigation();
    initializeEventListeners();
    initializeCharts();
    loadTransactionHistory();
    startRealTimeUpdates();
    updateDashboard();
});

// Navigation System
function initializeNavigation() {
    elements.navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Update active states
    elements.navTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    state.currentTab = tabName;
    
    // Initialize tab-specific content
    if (tabName === 'analytics') {
        updateAnalyticsCharts();
    } else if (tabName === 'alerts') {
        updateAlertsList();
    }
}

// Event Listeners
function initializeEventListeners() {
    // Amount Slider
    elements.amountSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        elements.amountValue.textContent = value.toLocaleString();
    });
    
    // Analyze Button
    elements.analyzeBtn.addEventListener('click', analyzeTransaction);
    
    // Reset Button
    elements.resetBtn.addEventListener('click', resetForm);
    
    // Simulate Button
    elements.simulateBtn.addEventListener('click', simulateFraud);
    
    // Filter Buttons
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            filterAlerts(filter);
        });
    });
    
    // Action Buttons
    elements.exportBtn.addEventListener('click', exportData);
    elements.refreshBtn.addEventListener('click', refreshDashboard);
    elements.settingsBtn.addEventListener('click', () => switchTab('settings'));
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            analyzeTransaction();
        }
        if (e.key >= '1' && e.key <= '5') {
            const tabs = ['dashboard', 'analyze', 'analytics', 'alerts', 'settings'];
            switchTab(tabs[parseInt(e.key) - 1]);
        }
    });
}

// Form Functions
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
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        displayResults(result);
        addToHistory(transactionData, result);
        updateStats(result);
        addAlert(result);
        updateDashboard();
        
        const message = result.result === 'FRAUD' ? 
            `🚨 Fraud Detected! Risk Score: ${result.risk_score}` : 
            `✅ Transaction Safe! Risk Score: ${result.risk_score}`;
        showToast(message, result.result === 'FRAUD' ? 'error' : 'success');
        
    } catch (error) {
        console.error('❌ Analysis error:', error);
        showToast('Failed to analyze transaction. Please try again.', 'error');
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
    
    setTimeout(() => {
        analyzeTransaction();
    }, 500);
    
    showToast('🚨 Fraud simulation activated - High risk scenario loaded', 'warning');
}

// Display Results
function displayResults(result) {
    // Show results section
    elements.resultsSection.style.display = 'block';
    elements.resultsSection.classList.add('fade-in');
    
    // Animate risk score
    animateRiskScore(result.risk_score);
    
    // Update result badge
    updateResultBadge(result.result);
    
    // Update confidence
    updateConfidence(result.confidence);
    
    // Update reasons
    updateReasons(result.reasons);
}

// Animate Risk Score
function animateRiskScore(targetScore) {
    const duration = 1500;
    const startScore = 0;
    const startTime = Date.now();
    
    function update() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentScore = Math.round(startScore + (targetScore - startScore) * easeOutQuart);
        
        elements.riskScore.textContent = currentScore;
        
        // Update circle color based on score
        const circumference = 2 * Math.PI * 90;
        const offset = circumference - (currentScore / 100) * circumference;
        elements.riskCircle.style.strokeDashoffset = offset;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// Update Result Badge
function updateResultBadge(result) {
    elements.resultBadge.className = `result-badge ${result.toLowerCase()}`;
    elements.resultBadge.querySelector('.badge-text').textContent = result;
}

// Update Confidence
function updateConfidence(confidence) {
    const confidencePercent = Math.round(confidence * 100);
    elements.confidenceFill.style.width = `${confidencePercent}%`;
    elements.confidencePercentage.textContent = `${confidencePercent}%`;
}

// Update Reasons
function updateReasons(reasons) {
    elements.reasonsList.innerHTML = '';
    
    reasons.forEach((reason, index) => {
        const li = document.createElement('li');
        li.className = 'reason-item';
        li.style.opacity = '0';
        li.style.transform = 'translateX(-20px)';
        
        const icon = getReasonIcon(reason);
        li.innerHTML = `
            <span class="reason-icon">${icon}</span>
            <span>${reason}</span>
        `;
        
        elements.reasonsList.appendChild(li);
        
        setTimeout(() => {
            li.style.transition = 'all 0.3s ease';
            li.style.opacity = '1';
            li.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

// Get Reason Icon
function getReasonIcon(reason) {
    const reasonLower = reason.toLowerCase();
    if (reasonLower.includes('amount')) return '💳';
    if (reasonLower.includes('night')) return '🌙';
    if (reasonLower.includes('location')) return '📍';
    if (reasonLower.includes('device')) return '📱';
    if (reasonLower.includes('high')) return '⚠️';
    return '🔍';
}

// Dashboard Updates
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
    
    if (result.result === 'FRAUD') {
        state.stats.fraudDetected++;
    } else {
        state.stats.safeTransactions++;
    }
    
    state.stats.avgRiskScore = Math.round(state.stats.totalRiskScore / state.stats.totalTransactions);
}

// Charts
function initializeCharts() {
    createVolumeChart();
    createRiskDistributionChart();
    createActivityHeatmap();
}

function createVolumeChart() {
    const chart = elements.volumeChart;
    chart.innerHTML = '';
    
    // Generate sample data
    const data = [65, 78, 90, 45, 88, 72, 56, 91, 73, 68, 82, 59];
    
    data.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${value}%`;
        bar.title = `Day ${index + 1}: ${value} transactions`;
        chart.appendChild(bar);
    });
}

function createRiskDistributionChart() {
    const chart = elements.riskChart;
    chart.innerHTML = '';
    
    const pieChart = document.createElement('div');
    pieChart.className = 'pie-chart';
    chart.appendChild(pieChart);
}

function createActivityHeatmap() {
    const heatmap = elements.activityHeatmap;
    if (!heatmap) return;
    
    heatmap.innerHTML = '';
    
    for (let hour = 0; hour < 24; hour++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        
        const riskLevel = Math.random();
        if (riskLevel > 0.7) {
            cell.classList.add('high');
        } else if (riskLevel > 0.4) {
            cell.classList.add('medium');
        } else {
            cell.classList.add('low');
        }
        
        cell.title = `Hour ${hour}:00 - ${Math.round(riskLevel * 100)}% activity`;
        heatmap.appendChild(cell);
    }
}

function updateCharts() {
    // Add new data point to volume chart
    const volumeChart = elements.volumeChart;
    if (volumeChart && volumeChart.children.length > 0) {
        const newBar = document.createElement('div');
        newBar.className = 'bar';
        newBar.style.height = `${Math.random() * 100}%`;
        volumeChart.appendChild(newBar);
        
        if (volumeChart.children.length > 12) {
            volumeChart.removeChild(volumeChart.firstChild);
        }
    }
}

// Analytics Charts
function updateAnalyticsCharts() {
    createRiskTrendChart();
    createFraudPieChart();
    createRiskFactorsChart();
}

function createRiskTrendChart() {
    const chart = elements.riskTrendChart;
    chart.innerHTML = '<div class="line-chart"></div>';
}

function createFraudPieChart() {
    const chart = elements.fraudPieChart;
    chart.innerHTML = '<div class="pie-chart-large"></div>';
}

function createRiskFactorsChart() {
    const chart = elements.riskFactorsChart;
    chart.innerHTML = '';
    
    const factors = [
        { label: 'Amount', value: 85 },
        { label: 'Location', value: 72 },
        { label: 'Device', value: 68 },
        { label: 'Time', value: 45 }
    ];
    
    factors.forEach(factor => {
        const item = document.createElement('div');
        item.className = 'h-bar-item';
        item.innerHTML = `
            <div class="h-bar-label">${factor.label}</div>
            <div class="h-bar-container">
                <div class="h-bar-fill" style="width: ${factor.value}%"></div>
            </div>
            <div class="h-bar-value">${factor.value}%</div>
        `;
        chart.appendChild(item);
    });
}

// Activity
function updateRecentActivity() {
    const activity = elements.recentActivity;
    if (!activity) return;
    
    activity.innerHTML = '';
    
    const recentTransactions = state.transactionHistory.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        activity.innerHTML = '<div class="activity-item">No recent activity</div>';
        return;
    }
    
    recentTransactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        const icon = transaction.result === 'FRAUD' ? '🚨' : '✅';
        const color = transaction.result === 'FRAUD' ? 'var(--danger-red)' : 'var(--primary-green)';
        
        item.innerHTML = `
            <span class="activity-icon" style="color: ${color}">${icon}</span>
            <div class="activity-content">
                <div class="activity-title">$${transaction.amount.toLocaleString()} - ${transaction.result}</div>
                <div class="activity-time">${new Date(transaction.timestamp).toLocaleTimeString()}</div>
            </div>
        `;
        
        activity.appendChild(item);
    });
}

// Alerts System
function addAlert(result) {
    if (result.result === 'FRAUD') {
        const alert = {
            id: Date.now(),
            amount: result.amount || 7500,
            reason: result.reasons?.[0] || 'High risk detected',
            time: new Date().toISOString(),
            risk: 'high',
            result: 'FRAUD'
        };
        
        state.alerts.unshift(alert);
        if (state.alerts.length > 10) {
            state.alerts.pop();
        }
        
        if (state.currentTab === 'alerts') {
            updateAlertsList();
        }
    }
}

function updateAlertsList() {
    const alertsList = elements.alertsList;
    if (!alertsList) return;
    
    alertsList.innerHTML = '';
    
    if (state.alerts.length === 0) {
        alertsList.innerHTML = '<div class="alert-item">No alerts at this time</div>';
        return;
    }
    
    state.alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-item ${alert.risk}-risk`;
        
        const icon = alert.risk === 'high' ? '🚨' : alert.risk === 'medium' ? '⚠️' : '🔍';
        
        alertDiv.innerHTML = `
            <span class="alert-icon">${icon}</span>
            <div class="alert-content">
                <div class="alert-title">Fraud Detected - $${alert.amount.toLocaleString()}</div>
                <div class="alert-details">${alert.reason}</div>
                <div class="alert-time">${new Date(alert.time).toLocaleTimeString()}</div>
            </div>
            <span class="alert-badge ${alert.risk}">${alert.risk.toUpperCase()}</span>
        `;
        
        alertsList.appendChild(alertDiv);
    });
}

function filterAlerts(filter) {
    elements.filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    const filteredAlerts = filter === 'all' ? 
        state.alerts : 
        state.alerts.filter(alert => alert.risk === filter);
    
    const alertsList = elements.alertsList;
    alertsList.innerHTML = '';
    
    filteredAlerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-item ${alert.risk}-risk`;
        
        const icon = alert.risk === 'high' ? '🚨' : alert.risk === 'medium' ? '⚠️' : '🔍';
        
        alertDiv.innerHTML = `
            <span class="alert-icon">${icon}</span>
            <div class="alert-content">
                <div class="alert-title">Fraud Detected - $${alert.amount.toLocaleString()}</div>
                <div class="alert-details">${alert.reason}</div>
                <div class="alert-time">${new Date(alert.time).toLocaleTimeString()}</div>
            </div>
            <span class="alert-badge ${alert.risk}">${alert.risk.toUpperCase()}</span>
        `;
        
        alertsList.appendChild(alertDiv);
    });
}

// History
function addToHistory(transactionData, result) {
    const historyItem = {
        amount: transactionData.amount,
        result: result.result,
        riskScore: result.risk_score,
        timestamp: new Date().toISOString()
    };
    
    state.transactionHistory.unshift(historyItem);
    if (state.transactionHistory.length > 10) {
        state.transactionHistory = state.transactionHistory.slice(0, 10);
    }
    
    saveTransactionHistory();
}

function updateHistoryTable() {
    const historyTable = elements.historyTable;
    if (!historyTable) return;
    
    historyTable.innerHTML = '';
    
    if (state.transactionHistory.length === 0) {
        historyTable.innerHTML = '<div class="history-item">No transactions yet</div>';
        return;
    }
    
    state.transactionHistory.slice(0, 5).forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        item.innerHTML = `
            <span class="history-amount">$${transaction.amount.toLocaleString()}</span>
            <span class="history-risk">${transaction.riskScore}</span>
            <span class="history-result ${transaction.result.toLowerCase()}">${transaction.result}</span>
        `;
        
        historyTable.appendChild(item);
    });
}

// Data Persistence
function saveTransactionHistory() {
    try {
        localStorage.setItem('invisiguard_history', JSON.stringify(state.transactionHistory));
    } catch (error) {
        console.warn('Could not save transaction history:', error);
    }
}

function loadTransactionHistory() {
    try {
        const saved = localStorage.getItem('invisiguard_history');
        if (saved) {
            state.transactionHistory = JSON.parse(saved);
            updateHistoryTable();
        }
    } catch (error) {
        console.warn('Could not load transaction history:', error);
    }
}

// Utility Functions
function showLoading(show) {
    state.isLoading = show;
    elements.loadingOverlay.classList.toggle('active', show);
    elements.analyzeBtn.disabled = show;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const title = type === 'success' ? '✅ Success' : 
                  type === 'error' ? '❌ Error' : 
                  type === 'warning' ? '⚠️ Warning' : 'ℹ️ Info';
    
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Action Functions
function exportData() {
    const data = {
        stats: state.stats,
        history: state.transactionHistory,
        alerts: state.alerts,
        exportTime: new Date().toISOString()
    };
    
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
    // Update dashboard every 5 seconds
    setInterval(() => {
        if (state.currentTab === 'dashboard') {
            updateCharts();
        }
    }, 5000);
    
    // Simulate random alerts
    setInterval(() => {
        if (Math.random() > 0.8) {
            const randomAlert = {
                id: Date.now(),
                amount: Math.floor(Math.random() * 10000) + 1000,
                reason: 'Suspicious activity detected',
                time: new Date().toISOString(),
                risk: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
                result: 'FRAUD'
            };
            
            state.alerts.unshift(randomAlert);
            if (state.alerts.length > 10) {
                state.alerts.pop();
            }
            
            if (state.currentTab === 'alerts') {
                updateAlertsList();
            }
        }
    }, 15000);
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('❌ Application error:', e.error);
    showToast('An unexpected error occurred', 'error');
});

// Network Status
window.addEventListener('online', () => showToast('Connection restored', 'success'));
window.addEventListener('offline', () => showToast('Connection lost', 'error'));

// Initialize on load
console.log('🚀 INVISIGUARD Premium Dashboard Ready');
    
    // Dashboard elements
    totalTransactions: null,
    fraudCount: null,
    avgRisk: null,
    successRate: null,
    riskChart: null,
    
    // History elements
    historyList: null,
    
    // Status elements
    statusIndicator: null
};

/**
 * Initialize the application
 */
function initApp() {
    // Initialize components
    loader = new Loader();
    toast = new Toast();
    
    // Get DOM elements
    initializeElements();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadInitialData();
    
    // Start real-time updates
    startRealTimeUpdates();
    
    console.log('� INVISIGUARD Fraud Detection System initialized');
}

/**
 * Initialize DOM elements
 */
function initializeElements() {
    // Form elements
    elements.analysisForm = document.getElementById('analysisForm');
    elements.amountInput = document.getElementById('amount');
    elements.nightCheckbox = document.getElementById('night');
    elements.locationCheckbox = document.getElementById('location');
    elements.deviceCheckbox = document.getElementById('device');
    elements.analyzeBtn = document.getElementById('analyzeBtn');
    
    // Results elements
    elements.resultsSection = document.getElementById('resultsSection');
    elements.resultStatus = document.getElementById('resultStatus');
    elements.riskScore = document.getElementById('riskScore');
    elements.progressFill = document.getElementById('progressFill');
    elements.reasonsList = document.getElementById('reasonsList');
    
    // Tab elements
    elements.tabButtons = document.querySelectorAll('.tab-button');
    elements.tabPanes = document.querySelectorAll('.tab-pane');
    
    // Dashboard elements
    elements.totalTransactions = document.getElementById('totalTransactions');
    elements.fraudCount = document.getElementById('fraudCount');
    elements.avgRisk = document.getElementById('avgRisk');
    elements.successRate = document.getElementById('successRate');
    elements.riskChart = document.getElementById('riskChart');
    
    // History elements
    elements.historyList = document.getElementById('historyList');
    
    // Status elements
    elements.statusIndicator = document.getElementById('statusIndicator');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Form submission
    if (elements.analysisForm) {
        elements.analysisForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Tab navigation
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
    });
    
    // Input validation
    if (elements.amountInput) {
        elements.amountInput.addEventListener('input', validateAmount);
        elements.amountInput.addEventListener('keypress', handleKeyPress);
    }
    
    // Checkbox changes
    [elements.nightCheckbox, elements.locationCheckbox, elements.deviceCheckbox].forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', handleCheckboxChange);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Window resize
    window.addEventListener('resize', handleResize);
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (AppState.isLoading) {
        toast.warning('Analysis already in progress...');
        return;
    }
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Get form data
    const formData = getFormData();
    
    // Analyze transaction
    await analyzeTransaction(formData);
}

/**
 * Validate the form
 */
function validateForm() {
    const amount = parseFloat(elements.amountInput.value);
    
    if (!amount || amount <= 0) {
        toast.error('Please enter a valid transaction amount greater than 0');
        elements.amountInput.focus();
        return false;
    }
    
    if (amount > 1000000) {
        toast.error('Transaction amount seems unusually high. Please verify.');
        return false;
    }
    
    return true;
}

/**
 * Validate amount input
 */
function validateAmount() {
    const amount = parseFloat(elements.amountInput.value);
    
    if (amount < 0) {
        elements.amountInput.value = 0;
    }
    
    // Add visual feedback for validation
    if (amount > 0) {
        elements.amountInput.style.borderColor = 'rgba(34, 197, 94, 0.5)';
    } else {
        elements.amountInput.style.borderColor = '';
    }
}

/**
 * Get form data
 */
function getFormData() {
    return {
        amount: parseFloat(elements.amountInput.value),
        is_night: elements.nightCheckbox.checked ? 1 : 0,
        new_location: elements.locationCheckbox.checked ? 1 : 0,
        new_device: elements.deviceCheckbox.checked ? 1 : 0,
        user_id: 'web_user_' + Date.now(), // Generate unique user ID
        ip_address: null // Will be determined by backend
    };
}

/**
 * Analyze transaction via API
 */
async function analyzeTransaction(formData) {
    try {
        AppState.isLoading = true;
        setLoadingState(true);
        
        console.log('🔍 Analyzing transaction:', formData);
        
        const response = await fetch(AppState.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📊 Analysis result:', result);
        
        // Display results
        displayResults(result);
        
        // Update history and statistics
        addToHistory(formData, result);
        updateStatistics();
        
        // Show appropriate notification
        if (result.result === 'FRAUD') {
            toast.warning(`🚨 Fraud detected! Risk score: ${result.risk_score}%`);
        } else {
            toast.success(`✅ Transaction approved! Risk score: ${result.risk_score}%`);
        }
        
    } catch (error) {
        console.error('❌ Analysis error:', error);
        
        let errorMessage = 'Failed to analyze transaction';
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Unable to connect to fraud detection service. Please check your connection.';
        } else if (error.message.includes('HTTP error')) {
            errorMessage = 'Service temporarily unavailable. Please try again later.';
        }
        
        toast.error(errorMessage);
        
    } finally {
        AppState.isLoading = false;
        setLoadingState(false);
    }
}

/**
 * Display analysis results
 */
function displayResults(result) {
    if (!elements.resultsSection) return;
    
    // Set result status
    if (elements.resultStatus) {
        elements.resultStatus.textContent = result.result;
        elements.resultStatus.className = `result-status ${result.result.toLowerCase()}`;
    }
    
    // Set risk score
    if (elements.riskScore) {
        elements.riskScore.textContent = `Risk: ${result.risk_score}%`;
    }
    
    // Animate progress bar
    if (elements.progressFill) {
        setTimeout(() => {
            elements.progressFill.style.width = `${result.risk_score}%`;
            
            // Set color based on risk level
            elements.progressFill.className = 'progress-fill';
            if (result.risk_score <= 30) {
                elements.progressFill.classList.add('low');
            } else if (result.risk_score <= 70) {
                elements.progressFill.classList.add('medium');
            } else {
                elements.progressFill.classList.add('high');
            }
        }, 100);
    }
    
    // Display reasons
    if (elements.reasonsList && result.reasons) {
        elements.reasonsList.innerHTML = '';
        result.reasons.forEach(reason => {
            const li = document.createElement('li');
            li.textContent = reason;
            elements.reasonsList.appendChild(li);
        });
    }
    
    // Show results section
    elements.resultsSection.style.display = 'block';
    
    // Scroll to results
    setTimeout(() => {
        elements.resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }, 300);
}

/**
 * Handle tab navigation
 */
function handleTabClick(event) {
    const button = event.currentTarget;
    const tabName = button.dataset.tab;
    
    if (tabName === AppState.currentTab) return;
    
    // Update active states
    elements.tabButtons.forEach(btn => btn.classList.remove('active'));
    elements.tabPanes.forEach(pane => pane.classList.remove('active'));
    
    button.classList.add('active');
    const targetPane = document.getElementById(`${tabName}-tab`);
    if (targetPane) {
        targetPane.classList.add('active');
    }
    
    AppState.currentTab = tabName;
    
    console.log(`🔄 Switched to ${tabName} tab`);
}

/**
 * Add transaction to history
 */
function addToHistory(formData, result) {
    const historyItem = {
        amount: formData.amount,
        result: result.result,
        riskScore: result.risk_score,
        timestamp: new Date(),
        reasons: result.reasons || [],
        factors: {
            night: formData.is_night === 1,
            newLocation: formData.new_location === 1,
            newDevice: formData.new_device === 1
        }
    };
    
    AppState.transactionHistory.unshift(historyItem);
    
    // Keep only last 50 transactions
    if (AppState.transactionHistory.length > 50) {
        AppState.transactionHistory = AppState.transactionHistory.slice(0, 50);
    }
    
    updateHistoryDisplay();
    updateStatistics();
}

/**
 * Update history display
 */
function updateHistoryDisplay() {
    if (!elements.historyList) return;
    
    elements.historyList.innerHTML = '';
    
    if (AppState.transactionHistory.length === 0) {
        elements.historyList.innerHTML = '<p style="text-align: center; color: #64748b;">No transactions yet</p>';
        return;
    }
    
    AppState.transactionHistory.slice(0, 10).forEach(item => {
        const historyDiv = document.createElement('div');
        historyDiv.className = 'history-item';
        
        const timeAgo = getTimeAgo(item.timestamp);
        const amountFormatted = `$${item.amount.toFixed(2)}`;
        
        historyDiv.innerHTML = `
            <div class="history-info">
                <div class="history-amount">${amountFormatted}</div>
                <div class="history-time">${timeAgo}</div>
            </div>
            <div class="history-result ${item.result.toLowerCase()}">${item.result}</div>
        `;
        
        elements.historyList.appendChild(historyDiv);
    });
}

/**
 * Update statistics
 */
function updateStatistics() {
    if (!elements.totalTransactions) return;
    
    // Calculate statistics
    const totalTransactions = AppState.transactionHistory.length;
    const fraudCount = AppState.transactionHistory.filter(t => t.result === 'FRAUD').length;
    const totalRisk = AppState.transactionHistory.reduce((sum, t) => sum + t.riskScore, 0);
    const avgRisk = totalTransactions > 0 ? Math.round(totalRisk / totalTransactions) : 0;
    const successRate = totalTransactions > 0 ? Math.round(((totalTransactions - fraudCount) / totalTransactions) * 100) : 100;
    
    // Update DOM
    elements.totalTransactions.textContent = totalTransactions;
    elements.fraudCount.textContent = fraudCount;
    elements.avgRisk.textContent = `${avgRisk}%`;
    elements.successRate.textContent = `${successRate}%`;
    
    // Update chart
    updateRiskChart();
    
    console.log('📊 Statistics updated:', { totalTransactions, fraudCount, avgRisk, successRate });
}

/**
 * Update risk chart
 */
function updateRiskChart() {
    if (!elements.riskChart) return;
    
    // Generate sample data for demonstration
    const chartData = [30, 45, 25, 60, 35, 50, 40];
    const bars = elements.riskChart.querySelectorAll('.bar');
    
    bars.forEach((bar, index) => {
        const height = chartData[index];
        bar.style.height = `${height}%`;
        const valueElement = bar.querySelector('.bar-value');
        if (valueElement) {
            valueElement.textContent = `${height}%`;
        }
    });
}

/**
 * Get time ago string
 */
function getTimeAgo(timestamp) {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

/**
 * Set loading state
 */
function setLoadingState(loading) {
    AppState.isLoading = loading;
    
    if (elements.analyzeBtn) {
        elements.analyzeBtn.disabled = loading;
        elements.analyzeBtn.innerHTML = loading ? 
            '<span class="btn-text">Analyzing...</span><span class="btn-icon">⏳</span>' :
            '<span class="btn-text">Analyze Transaction</span><span class="btn-icon">🔬</span>';
    }
    
    if (loader) {
        if (loading) {
            loader.show('Analyzing transaction...');
        } else {
            loader.hide();
        }
    }
}

/**
 * Handle checkbox changes
 */
function handleCheckboxChange(event) {
    const checkbox = event.target;
    const label = checkbox.nextElementSibling;
    
    if (label) {
        if (checkbox.checked) {
            label.style.color = '#3b82f6';
        } else {
            label.style.color = '';
        }
    }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + Enter to submit form
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (AppState.currentTab === 'analysis' && elements.analysisForm) {
            event.preventDefault();
            handleFormSubmit(event);
        }
    }
    
    // Number keys to switch tabs
    if (event.key === '1') {
        switchToTab('analysis');
    } else if (event.key === '2') {
        switchToTab('dashboard');
    } else if (event.key === '3') {
        switchToTab('history');
    }
}

/**
 * Switch to specific tab
 */
function switchToTab(tabName) {
    const button = document.querySelector(`[data-tab="${tabName}"]`);
    if (button) {
        button.click();
    }
}

/**
 * Handle key press in amount input
 */
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleFormSubmit(event);
    }
}

/**
 * Handle window resize
 */
function handleResize() {
    // Adjust chart dimensions if needed
    if (AppState.currentTab === 'dashboard' && elements.riskChart) {
        // Responsive chart adjustments
        const containerWidth = elements.riskChart.offsetWidth;
        if (containerWidth < 400) {
            // Adjust for small screens
            const bars = elements.riskChart.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.style.width = '20px';
            });
        }
    }
}

/**
 * Load initial data
 */
function loadInitialData() {
    // Load sample data for demonstration
    const sampleTransactions = [
        {
            amount: 1250,
            result: 'SAFE',
            riskScore: 15,
            timestamp: new Date(Date.now() - 120000),
            reasons: ['Normal transaction pattern']
        },
        {
            amount: 5000,
            result: 'FRAUD',
            riskScore: 85,
            timestamp: new Date(Date.now() - 900000),
            reasons: ['High amount', 'New location detected']
        },
        {
            amount: 750,
            result: 'SAFE',
            riskScore: 12,
            timestamp: new Date(Date.now() - 3600000),
            reasons: ['No risk factors detected']
        }
    ];
    
    AppState.transactionHistory = sampleTransactions;
    updateHistoryDisplay();
    updateStatistics();
    
    console.log('📋 Initial data loaded');
}

/**
 * Start real-time updates
 */
function startRealTimeUpdates() {
    // Update system status
    updateSystemStatus();
    
    // Simulate real-time data updates every 30 seconds
    setInterval(() => {
        if (AppState.currentTab === 'dashboard') {
            // Update some metrics
            const currentRisk = Math.floor(Math.random() * 30) + 10;
            const systemHealth = Math.floor(Math.random() * 5) + 95;
            
            // Update status indicator
            updateSystemStatus(currentRisk, systemHealth);
        }
    }, 30000);
    
    console.log('⏰ Real-time updates started');
}

/**
 * Update system status
 */
function updateSystemStatus(currentRisk = null, systemHealth = null) {
    if (!elements.statusIndicator) return;
    
    const statusText = elements.statusIndicator.querySelector('.status-text');
    const statusDot = elements.statusIndicator.querySelector('.status-dot');
    
    if (currentRisk > 70) {
        statusText.textContent = 'High Risk Alert';
        statusDot.style.background = '#ef4444';
        elements.statusIndicator.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        elements.statusIndicator.style.background = 'rgba(239, 68, 68, 0.1)';
    } else if (systemHealth < 90) {
        statusText.textContent = 'System Warning';
        statusDot.style.background = '#f59e0b';
        elements.statusIndicator.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        elements.statusIndicator.style.background = 'rgba(245, 158, 11, 0.1)';
    } else {
        statusText.textContent = 'System Active';
        statusDot.style.background = '#22c55e';
        elements.statusIndicator.style.borderColor = 'rgba(34, 197, 94, 0.3)';
        elements.statusIndicator.style.background = 'rgba(34, 197, 94, 0.2)';
    }
}

/**
 * Check API connectivity
 */
async function checkApiConnectivity() {
    try {
        const response = await fetch(`${AppState.apiEndpoint.replace('/predict', '/health')}`);
        return response.ok;
    } catch (error) {
        console.error('API connectivity check failed:', error);
        return false;
    }
}

/**
 * Initialize app when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    
    // Check API connectivity
    checkApiConnectivity().then(isConnected => {
        if (!isConnected) {
            toast.warning('⚠️ Unable to connect to fraud detection service');
        } else {
            console.log('✅ API connectivity confirmed');
        }
    });
});

/**
 * Handle page visibility change
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause real-time updates when page is hidden
        console.log('📱 Page hidden - pausing updates');
    } else {
        // Resume real-time updates when page is visible
        console.log('📱 Page visible - resuming updates');
        if (AppState.currentTab === 'dashboard') {
            updateStatistics();
        }
    }
});

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
    console.error('🚨 Global error:', event.error);
    toast.error('An unexpected error occurred');
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        initApp,
        analyzeTransaction,
        updateStatistics
    };
}
