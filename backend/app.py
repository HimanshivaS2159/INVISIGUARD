"""
Main Flask Application for INVISIGUARD Fraud Detection System
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime

# Import configuration
from config.settings import config

# Import route blueprints
from routes.predict import predict_bp

def create_app(config_name='default'):
    """
    Application factory function
    
    Args:
        config_name: Configuration name (development, production, default)
        
    Returns:
        Flask application instance
    """
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Configure CORS — allow all so ngrok tunnel works
    CORS(app, origins='*', supports_credentials=False)
    
    # Configure logging
    setup_logging(app)
    
    # Register blueprints
    app.register_blueprint(predict_bp, url_prefix='/api/v1')
    
    # Add root endpoint
    @app.route('/')
    def index():
        """Root endpoint with API information"""
        return jsonify({
            'name': 'INVISIGUARD Fraud Detection API',
            'version': '1.0.0',
            'status': 'running',
            'timestamp': datetime.now().isoformat(),
            'endpoints': {
                'health': '/api/v1/health',
                'predict': '/api/v1/predict',
                'model_info': '/api/v1/model/info',
                'user_profile': '/api/v1/user/<user_id>/profile',
                'analytics': '/api/v1/analytics/summary'
            },
            'documentation': 'https://github.com/invisiguard/docs'
        })
    
    # Add health check endpoint
    @app.route('/health')
    def health():
        """Simple health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'service': 'INVISIGUARD Fraud Detection'
        })
    
    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Not found',
            'message': 'The requested resource was not found',
            'timestamp': datetime.now().isoformat()
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred',
            'timestamp': datetime.now().isoformat()
        }), 500
    
    # Request logging middleware
    @app.before_request
    def log_request():
        """Log incoming requests"""
        logger = logging.getLogger(__name__)
        logger.info(f"Request: {request.method} {request.path} from {request.remote_addr}")
    
    @app.after_request
    def log_response(response):
        """Log responses"""
        logger = logging.getLogger(__name__)
        logger.info(f"Response: {response.status_code} for {request.path}")
        return response
    
    return app

def setup_logging(app):
    """
    Setup logging configuration
    
    Args:
        app: Flask application instance
    """
    log_level = getattr(logging, app.config.get('LOG_LEVEL', 'INFO'))
    log_file = app.config.get('LOG_FILE', 'invisiguard.log')
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Setup file handler
    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(formatter)
    file_handler.setLevel(log_level)
    
    # Setup console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        handlers=[file_handler, console_handler]
    )
    
    # Log application startup
    logger = logging.getLogger(__name__)
    logger.info("INVISIGUARD Fraud Detection System Starting...")
    logger.info(f"Log level: {app.config.get('LOG_LEVEL')}")
    logger.info(f"Debug mode: {app.config.get('DEBUG')}")

# Create application instance
app = create_app(os.environ.get('FLASK_ENV', 'default'))

if __name__ == '__main__':
    env = os.environ.get('FLASK_ENV', 'development')
    port = int(os.environ.get('PORT', 5000))
    use_ngrok = os.environ.get('USE_NGROK', 'true').lower() == 'true'

    public_url = None
    if use_ngrok:
        try:
            from pyngrok import ngrok, conf
            # Use authtoken from env if set
            token = os.environ.get('NGROK_AUTHTOKEN')
            if token:
                conf.get_default().auth_token = token
            public_url = ngrok.connect(port, bind_tls=True).public_url
        except Exception as e:
            print(f"[ngrok] Could not start tunnel: {e}")

    print("=" * 60)
    print("🔐 INVISIGUARD Fraud Detection System")
    print("=" * 60)
    print(f"Environment : {env}")
    print(f"Local URL   : http://127.0.0.1:{port}")
    if public_url:
        print(f"Public URL  : {public_url}")
        print(f"Public API  : {public_url}/api/v1")
    print("=" * 60)

    app.run(
        host='0.0.0.0',
        port=port,
        debug=app.config.get('DEBUG', False),
        threaded=True,
        use_reloader=False   # disable reloader so ngrok doesn't double-start
    )
