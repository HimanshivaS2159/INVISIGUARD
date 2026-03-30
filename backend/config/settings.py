"""
Configuration settings for INVISIGUARD Fraud Detection System
"""

import os

class Config:
    """Base configuration class"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'invisiguard-secret-key-2024'
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    # API Settings
    API_VERSION = 'v1'
    API_PREFIX = f'/api/{API_VERSION}'
    
    # ML Model Settings
    MODEL_THRESHOLD = 0.5  # Default threshold for fraud detection
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE = 60
    
    # Security Settings — allow all origins so ngrok tunnel works
    CORS_ORIGINS = '*'
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = 'invisiguard.log'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    LOG_LEVEL = 'WARNING'

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
