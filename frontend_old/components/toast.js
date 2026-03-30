/**
 * Toast Notification Component for INVISIGUARD Fraud Detection System
 * 
 * This module provides toast notification functionality
 * for showing success, error, and warning messages.
 */

class Toast {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.maxToasts = 5;
        this.defaultDuration = 4000;
        this.init();
    }

    /**
     * Initialize the toast component
     */
    init() {
        // Create toast container
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1002;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type of toast (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds (optional)
     * @param {Object} options - Additional options (optional)
     */
    show(message, type = 'info', duration = null, options = {}) {
        const toast = this.createToast(message, type, options);
        this.addToast(toast);
        
        // Auto remove after duration
        const toastDuration = duration || this.defaultDuration;
        setTimeout(() => {
            this.remove(toast);
        }, toastDuration);

        return toast;
    }

    /**
     * Show success toast
     * @param {string} message - Success message
     * @param {number} duration - Duration in milliseconds (optional)
     */
    success(message, duration = null) {
        return this.show(message, 'success', duration);
    }

    /**
     * Show error toast
     * @param {string} message - Error message
     * @param {number} duration - Duration in milliseconds (optional)
     */
    error(message, duration = null) {
        return this.show(message, 'error', duration);
    }

    /**
     * Show warning toast
     * @param {string} message - Warning message
     * @param {number} duration - Duration in milliseconds (optional)
     */
    warning(message, duration = null) {
        return this.show(message, 'warning', duration);
    }

    /**
     * Show info toast
     * @param {string} message - Info message
     * @param {number} duration - Duration in milliseconds (optional)
     */
    info(message, duration = null) {
        return this.show(message, 'info', duration);
    }

    /**
     * Create a toast element
     * @param {string} message - Message to display
     * @param {string} type - Type of toast
     * @param {Object} options - Additional options
     * @returns {HTMLElement} Toast element
     */
    createToast(message, type, options = {}) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Apply custom styles
        const customStyles = {
            animation: 'slideInRight 0.3s ease-out',
            ...options.styles
        };
        
        Object.assign(toast.style, customStyles);
        
        // Add icon based on type
        const icon = this.getIcon(type);
        if (icon) {
            const iconElement = document.createElement('span');
            iconElement.className = 'toast-icon';
            iconElement.textContent = icon;
            iconElement.style.cssText = `
                margin-right: 10px;
                font-size: 1.2rem;
            `;
            toast.appendChild(iconElement);
        }
        
        // Add message
        const messageElement = document.createElement('span');
        messageElement.className = 'toast-message';
        messageElement.textContent = message;
        messageElement.style.cssText = `
            flex: 1;
            word-wrap: break-word;
        `;
        toast.appendChild(messageElement);
        
        // Add close button if enabled
        if (options.closable !== false) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'toast-close';
            closeBtn.innerHTML = '×';
            closeBtn.style.cssText = `
                background: none;
                border: none;
                color: inherit;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                margin-left: 10px;
                opacity: 0.7;
                transition: opacity 0.2s ease;
            `;
            closeBtn.onclick = () => this.remove(toast);
            closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
            closeBtn.onmouseout = () => closeBtn.style.opacity = '0.7';
            toast.appendChild(closeBtn);
        }
        
        // Store reference
        toast.dataset.toastId = Date.now() + Math.random();
        
        return toast;
    }

    /**
     * Get icon for toast type
     * @param {string} type - Toast type
     * @returns {string} Icon character
     */
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || '';
    }

    /**
     * Add toast to container
     * @param {HTMLElement} toast - Toast element
     */
    addToast(toast) {
        // Remove oldest toast if max reached
        if (this.toasts.length >= this.maxToasts) {
            const oldestToast = this.toasts.shift();
            this.remove(oldestToast);
        }
        
        // Add to container and array
        this.container.appendChild(toast);
        this.toasts.push(toast);
        
        // Enable pointer events for container
        this.container.style.pointerEvents = 'auto';
        
        // Adjust positions
        this.adjustPositions();
    }

    /**
     * Remove toast
     * @param {HTMLElement} toast - Toast element to remove
     */
    remove(toast) {
        if (!toast || !toast.parentNode) return;
        
        // Add exit animation
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            
            // Remove from array
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
            
            // Hide container if no toasts
            if (this.toasts.length === 0) {
                this.container.style.pointerEvents = 'none';
            }
            
            // Adjust positions
            this.adjustPositions();
        }, 300);
    }

    /**
     * Adjust positions of all toasts
     */
    adjustPositions() {
        this.toasts.forEach((toast, index) => {
            const offset = index * 80; // 80px spacing between toasts
            toast.style.transform = `translateY(${offset}px)`;
        });
    }

    /**
     * Clear all toasts
     */
    clear() {
        const toastsToRemove = [...this.toasts];
        toastsToRemove.forEach(toast => this.remove(toast));
    }

    /**
     * Show persistent toast (doesn't auto-hide)
     * @param {string} message - Message to display
     * @param {string} type - Type of toast
     * @param {Object} options - Additional options
     */
    persistent(message, type = 'info', options = {}) {
        const toast = this.show(message, type, 0, { ...options, closable: true });
        return toast;
    }

    /**
     * Show progress toast
     * @param {string} message - Message to display
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} type - Type of toast
     */
    progress(message, progress, type = 'info') {
        const toast = this.createToast(message, type, { closable: false });
        
        // Add progress bar
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            margin-top: 8px;
            overflow: hidden;
        `;
        
        const progressFill = document.createElement('div');
        progressFill.style.cssText = `
            height: 100%;
            width: ${Math.min(progress, 100)}%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            border-radius: 2px;
            transition: width 0.3s ease;
        `;
        
        progressBar.appendChild(progressFill);
        toast.appendChild(progressBar);
        
        this.addToast(toast);
        
        // Store reference for updates
        toast.progressBar = progressFill;
        
        return toast;
    }

    /**
     * Update progress toast
     * @param {HTMLElement} toast - Toast element
     * @param {number} progress - New progress percentage
     */
    updateProgress(toast, progress) {
        if (toast && toast.progressBar) {
            toast.progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
    }

    /**
     * Show confirmation toast
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Callback for confirm action
     * @param {Function} onCancel - Callback for cancel action (optional)
     */
    confirm(message, onConfirm, onCancel = null) {
        const toast = this.createToast(message, 'info');
        
        // Add action buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 12px;
        `;
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Confirm';
        confirmBtn.style.cssText = `
            background: #22c55e;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
        `;
        confirmBtn.onclick = () => {
            onConfirm();
            this.remove(toast);
        };
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = `
            background: #64748b;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
        `;
        cancelBtn.onclick = () => {
            if (onCancel) onCancel();
            this.remove(toast);
        };
        
        buttonContainer.appendChild(confirmBtn);
        buttonContainer.appendChild(cancelBtn);
        toast.appendChild(buttonContainer);
        
        this.addToast(toast);
        
        // Don't auto-hide confirmation toasts
        return toast;
    }

    /**
     * Destroy the toast component
     */
    destroy() {
        this.clear();
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        this.toasts = [];
        this.container = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Toast;
} else {
    // Global assignment for browser
    window.Toast = Toast;
}
