"""
API Routes for INVISIGUARD Fraud Detection System
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any
import time
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Import our modules
from models.model import fraud_model
from services.behavior import behavior_analyzer
from utils.location import location_analyzer

# Create Blueprint
predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    
    Returns:
        JSON with system status
    """
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'model_trained': fraud_model.is_trained
    })

@predict_bp.route('/predict', methods=['POST'])
def predict_fraud():
    """
    Main fraud prediction endpoint
    
    Expected JSON payload:
    {
        "amount": 1000.00,
        "is_night": 0 or 1,
        "new_location": 0 or 1,
        "new_device": 0 or 1,
        "user_id": "optional_user_id",
        "ip_address": "optional_ip_address"
    }
    
    Returns:
        JSON with prediction results
    """
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Please provide transaction data in JSON format'
            }), 400
        
        # Validate required fields
        required_fields = ['amount', 'is_night', 'new_location', 'new_device']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'missing_fields': missing_fields
            }), 400
        
        # Extract transaction features
        amount = float(data['amount'])
        is_night = int(data['is_night'])
        new_location = int(data['new_location'])
        new_device = int(data['new_device'])
        user_id = data.get('user_id', 'anonymous')
        ip_address = data.get('ip_address', request.remote_addr)
        
        # Validate data types and ranges
        if amount <= 0:
            return jsonify({
                'error': 'Invalid amount',
                'message': 'Transaction amount must be greater than 0'
            }), 400
        
        if not all(isinstance(x, int) and not isinstance(x, bool) and x in [0, 1] for x in [is_night, new_location, new_device]):
            return jsonify({
                'error': 'Invalid binary values',
                'message': 'is_night, new_location, and new_device must be 0 or 1'
            }), 400
        
        # Prepare features for ML model
        features = [amount, is_night, new_location, new_device]
        
        # Get ML model prediction
        start_time = time.time()
        ml_probability, ml_prediction = fraud_model.predict(features)
        ml_time = time.time() - start_time
        
        # Get behavioral analysis
        transaction_data = {
            'amount': amount,
            'is_night': is_night,
            'new_location': new_location,
            'new_device': new_device,
            'location': ip_address,  # Using IP as location proxy
            'timestamp': datetime.now()
        }
        
        behavior_score, behavior_reasons = behavior_analyzer.analyze_transaction_behavior(
            user_id, transaction_data
        )
        
        # Get location-based risk
        location_score, location_reason = location_analyzer.get_location_risk(ip_address)
        
        # Calculate combined risk score
        # Weight: 40% ML model, 35% Behavior, 25% Location
        ml_weight = 0.4
        behavior_weight = 0.35
        location_weight = 0.25
        
        # Convert ML probability to percentage
        ml_score = ml_probability * 100
        
        # Calculate weighted risk score
        combined_risk_score = (
            ml_score * ml_weight +
            behavior_score * behavior_weight +
            location_score * location_weight
        )
        
        # Cap at 100
        combined_risk_score = min(combined_risk_score, 100)
        
        # Determine final result
        threshold = 50  # Can be made configurable
        final_result = 'FRAUD' if combined_risk_score > threshold else 'SAFE'
        
        # Compile all reasons
        all_reasons = []
        
        # Add ML model reasons
        if ml_score > 60:
            all_reasons.append("ML model indicates high fraud probability")
        elif ml_score > 30:
            all_reasons.append("ML model indicates moderate risk")
        
        # Add behavioral reasons
        all_reasons.extend(behavior_reasons)
        
        # Add location reason
        if location_score > 10:
            all_reasons.append(location_reason)
        
        # Get feature explanations
        feature_explanations = fraud_model.get_feature_explanation(features)
        
        # Prepare response
        response_data = {
            'result': final_result,
            'risk_score': round(combined_risk_score, 2),
            'confidence': round(abs(50 - combined_risk_score) / 50, 2),
            'analysis': {
                'ml_model': {
                    'probability': round(ml_probability, 4),
                    'prediction': 'FRAUD' if ml_prediction == 1 else 'SAFE',
                    'score': round(ml_score, 2),
                    'processing_time_ms': round(ml_time * 1000, 2)
                },
                'behavioral': {
                    'score': behavior_score,
                    'reasons': behavior_reasons
                },
                'location': {
                    'score': location_score,
                    'reason': location_reason,
                    'ip_address': ip_address
                }
            },
            'reasons': all_reasons,
            'feature_explanations': feature_explanations,
            'transaction_data': {
                'amount': amount,
                'currency': 'USD',
                'timestamp': datetime.now().isoformat(),
                'user_id': user_id
            },
            'metadata': {
                'model_version': '1.0.0',
                'analysis_timestamp': datetime.now().isoformat(),
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }
        }
        
        return jsonify(response_data)
        
    except ValueError as e:
        return jsonify({
            'error': 'Invalid data format',
            'message': str(e)
        }), 400
        
    except Exception as e:
        # Log the error in production
        logger.error(f"Prediction error: {e}")
        
        return jsonify({
            'error': 'Internal server error',
            'message': 'An error occurred during fraud analysis'
        }), 500

@predict_bp.route('/model/info', methods=['GET'])
def model_info():
    """
    Get information about the ML model
    
    Returns:
        JSON with model information
    """
    if not fraud_model.is_trained:
        return jsonify({
            'error': 'Model not trained',
            'message': 'The fraud detection model is not trained yet'
        }), 503
    
    return jsonify({
        'model_status': 'trained',
        'model_type': 'RandomForestClassifier',
        'features': fraud_model.feature_names,
        'feature_importance': fraud_model.model.feature_importances_.tolist() if fraud_model.model else [],
        'model_version': '1.0.0'
    })

@predict_bp.route('/user/<user_id>/profile', methods=['GET'])
def get_user_profile(user_id: str):
    """
    Get risk profile for a specific user
    
    Args:
        user_id: Unique user identifier
        
    Returns:
        JSON with user risk profile
    """
    try:
        profile = behavior_analyzer.get_user_risk_profile(user_id)
        
        if 'error' in profile:
            return jsonify(profile), 404
        
        return jsonify(profile)
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get user profile',
            'message': str(e)
        }), 500

@predict_bp.route('/analytics/summary', methods=['GET'])
def get_analytics_summary():
    """
    Get analytics summary for the system
    
    Returns:
        JSON with analytics data
    """
    try:
        # In a real system, this would query a database
        # For demo, return mock data
        summary_data = {
            'total_transactions': 1247,
            'fraudulent_transactions': 89,
            'blocked_transactions': 76,
            'success_rate': 92.8,
            'average_risk_score': 23.4,
            'top_risk_factors': [
                {'factor': 'High Amount', 'count': 234},
                {'factor': 'New Location', 'count': 189},
                {'factor': 'Night Transaction', 'count': 156},
                {'factor': 'New Device', 'count': 134}
            ],
            'risk_distribution': {
                'low': 65.2,    # 0-30%
                'medium': 24.8,  # 30-70%
                'high': 10.0     # 70-100%
            },
            'last_updated': datetime.now().isoformat()
        }
        
        return jsonify(summary_data)
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get analytics',
            'message': str(e)
        }), 500

@predict_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'The requested API endpoint does not exist'
    }), 404

@predict_bp.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({
        'error': 'Method not allowed',
        'message': 'HTTP method not allowed for this endpoint'
    }), 405

@predict_bp.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500
