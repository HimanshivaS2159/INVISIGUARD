/**
 * Loading Component for INVISIGUARD Fraud Detection System
 * 
 * This module provides loading overlay functionality
 * for showing loading states during API calls.
 */

class Loader {
    constructor() {
        this.overlay = null;
        this.spinner = null;
        this.text = null;
        this.init();
    }

    /**
     * Initialize the loader component
     */
    init() {
        this.overlay = document.getElementById('loadingOverlay');
        this.spinner = this.overlay?.querySelector('.spinner');
        this.text = this.overlay?.querySelector('.loading-text');
    }

    /**
     * Show the loading overlay
     * @param {string} message - Custom loading message (optional)
     */
    show(message = 'Analyzing transaction...') {
        if (this.overlay) {
            if (this.text && message) {
                this.text.textContent = message;
            }
            this.overlay.style.display = 'flex';
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide the loading overlay
     */
    hide() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
            
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }

    /**
     * Update loading message
     * @param {string} message - New loading message
     */
    updateMessage(message) {
        if (this.text) {
            this.text.textContent = message;
        }
    }

    /**
     * Check if loader is currently visible
     * @returns {boolean} - True if loader is visible
     */
    isVisible() {
        return this.overlay && this.overlay.style.display === 'flex';
    }

    /**
     * Show loader with a timeout
     * @param {string} message - Loading message
     * @param {number} timeout - Timeout in milliseconds
     */
    showWithTimeout(message, timeout = 30000) {
        this.show(message);
        
        setTimeout(() => {
            this.hide();
        }, timeout);
    }

    /**
     * Show progress indicator
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} message - Progress message
     */
    showProgress(progress, message = 'Processing...') {
        this.show(`${message} ${progress}%`);
        
        // Add progress bar if needed
        this.addProgressBar(progress);
    }

    /**
     * Add progress bar to loading overlay
     * @param {number} progress - Progress percentage
     */
    addProgressBar(progress) {
        // Remove existing progress bar
        const existingBar = this.overlay?.querySelector('.progress-bar-container');
        if (existingBar) {
            existingBar.remove();
        }

        // Create progress bar container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-bar-container';
        progressContainer.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
        `;

        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            overflow: hidden;
        `;

        const progressFill = document.createElement('div');
        progressFill.style.cssText = `
            height: 100%;
            width: ${progress}%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            border-radius: 3px;
            transition: width 0.3s ease;
        `;

        // Create progress text
        const progressText = document.createElement('div');
        progressText.style.cssText = `
            text-align: center;
            margin-top: 10px;
            font-size: 0.9rem;
            color: #ffffff;
        `;
        progressText.textContent = `${progress}% Complete`;

        // Assemble progress bar
        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);

        // Add to overlay
        if (this.overlay) {
            this.overlay.appendChild(progressContainer);
        }
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        this.show(message);
        
        // Change spinner color to indicate error
        if (this.spinner) {
            this.spinner.style.borderTopColor = '#ef4444';
        }
    }

    /**
     * Show success state
     * @param {string} message - Success message
     */
    showSuccess(message) {
        this.show(message);
        
        // Change spinner color to indicate success
        if (this.spinner) {
            this.spinner.style.borderTopColor = '#22c55e';
        }
    }

    /**
     * Create loading dots animation
     */
    showDotsAnimation() {
        if (this.text) {
            const originalText = this.text.textContent.replace(/\.\.\.$/, '');
            let dots = 0;
            
            const interval = setInterval(() => {
                dots = (dots + 1) % 4;
                this.text.textContent = originalText + '.'.repeat(dots);
            }, 500);

            // Store interval ID for cleanup
            this.dotsInterval = interval;
        }
    }

    /**
     * Clear dots animation
     */
    clearDotsAnimation() {
        if (this.dotsInterval) {
            clearInterval(this.dotsInterval);
            this.dotsInterval = null;
        }
    }

    /**
     * Destroy the loader component
     */
    destroy() {
        this.hide();
        this.clearDotsAnimation();
        
        // Clean up event listeners if any
        this.overlay = null;
        this.spinner = null;
        this.text = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Loader;
} else {
    // Global assignment for browser
    window.Loader = Loader;
}
