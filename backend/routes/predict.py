"""
API Routes for INVISIGUARD Fraud Detection System
"""

from flask import Blueprint, request, jsonify
import time
import logging
import random
from datetime import datetime

logger = logging.getLogger(__name__)

from models.model import fraud_model
from services.behavior import behavior_analyzer
from utils.location import location_analyzer
from services.transaction_store import transaction_store

predict_bp = Blueprint('predict', __name__)


# ─── Health ───────────────────────────────────────────────────────────────────

@predict_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0',
        'model_trained': fraud_model.is_trained,
        'total_analyzed': len(transaction_store.get_all())
    })


# ─── Predict ──────────────────────────────────────────────────────────────────

@predict_bp.route('/predict', methods=['POST'])
def predict_fraud():
    """
    Main fraud prediction endpoint.

    Payload:
        amount        float   required
        is_night      0|1     required
        new_location  0|1     required
        new_device    0|1     required
        user_id       str     optional
        ip_address    str     optional
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        missing = [f for f in ['amount', 'is_night', 'new_location', 'new_device'] if f not in data]
        if missing:
            return jsonify({'error': 'Missing fields', 'missing_fields': missing}), 400

        amount = float(data['amount'])
        is_night = int(data['is_night'])
        new_location = int(data['new_location'])
        new_device = int(data['new_device'])
        user_id = data.get('user_id', 'anonymous')
        ip_address = data.get('ip_address', request.remote_addr)

        if amount <= 0:
            return jsonify({'error': 'Amount must be > 0'}), 400

        if not all(isinstance(x, int) and not isinstance(x, bool) and x in [0, 1]
                   for x in [is_night, new_location, new_device]):
            return jsonify({'error': 'is_night, new_location, new_device must be 0 or 1'}), 400

        now = datetime.now()

        # Extra behavioral features
        tx_count_24h = behavior_analyzer.get_transaction_count_24h(user_id)
        amount_velocity = behavior_analyzer.get_amount_velocity(user_id, amount)

        # 8-feature vector
        features = [
            amount,
            is_night,
            new_location,
            new_device,
            now.hour,
            now.weekday(),
            amount_velocity,
            tx_count_24h
        ]

        start_time = time.time()
        ml_probability, ml_prediction = fraud_model.predict(features)
        ml_time = time.time() - start_time

        # Behavioral analysis
        tx_data = {
            'amount': amount,
            'is_night': is_night,
            'new_location': new_location,
            'new_device': new_device,
            'location': ip_address,
            'timestamp': now
        }
        behavior_score, behavior_reasons = behavior_analyzer.analyze_transaction_behavior(user_id, tx_data)

        # Location risk
        location_score, location_reason = location_analyzer.get_location_risk(ip_address)

        # Weighted combined score: 45% ML, 35% Behavior, 20% Location
        ml_score = ml_probability * 100
        combined_risk_score = min(
            ml_score * 0.45 + behavior_score * 0.35 + location_score * 0.20,
            100
        )

        final_result = 'FRAUD' if combined_risk_score > 50 else 'SAFE'

        # Build reasons
        all_reasons = []
        if ml_score > 65:
            all_reasons.append("ML model indicates high fraud probability")
        elif ml_score > 35:
            all_reasons.append("ML model indicates moderate risk")
        all_reasons.extend(behavior_reasons)
        if location_score > 10:
            all_reasons.append(location_reason)
        if not all_reasons:
            all_reasons.append("No significant risk factors detected")

        feature_explanations = fraud_model.get_feature_explanation(features)

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
                    'reasons': behavior_reasons,
                    'transaction_count_24h': tx_count_24h,
                    'amount_velocity': amount_velocity
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
                'currency': 'INR',
                'timestamp': now.isoformat(),
                'user_id': user_id
            },
            'metadata': {
                'model_version': '2.0.0',
                'analysis_timestamp': now.isoformat(),
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }
        }

        # Store for analytics
        transaction_store.add({
            'result': final_result,
            'risk_score': round(combined_risk_score, 2),
            'amount': amount,
            'user_id': user_id,
            'reasons': all_reasons
        })

        return jsonify(response_data)

    except ValueError as e:
        return jsonify({'error': 'Invalid data format', 'message': str(e)}), 400
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


# ─── Simulate ─────────────────────────────────────────────────────────────────

@predict_bp.route('/simulate', methods=['POST'])
def simulate_transaction():
    """
    Simulate a fraud or safe scenario for demo purposes.

    Payload:
        scenario  str  'fraud' | 'safe' | 'random'
    """
    data = request.get_json() or {}
    scenario = data.get('scenario', 'random')

    if scenario == 'fraud':
        payload = {
            'amount': random.randint(15000, 80000),
            'is_night': 1,
            'new_location': 1,
            'new_device': 1,
            'user_id': f'demo_user_{random.randint(1, 5)}'
        }
    elif scenario == 'safe':
        payload = {
            'amount': random.randint(100, 2000),
            'is_night': 0,
            'new_location': 0,
            'new_device': 0,
            'user_id': f'demo_user_{random.randint(1, 5)}'
        }
    else:
        payload = {
            'amount': random.randint(500, 50000),
            'is_night': random.randint(0, 1),
            'new_location': random.randint(0, 1),
            'new_device': random.randint(0, 1),
            'user_id': f'demo_user_{random.randint(1, 10)}'
        }

    # Reuse predict logic via internal call
    with predict_bp.app.test_request_context(
        '/api/v1/predict',
        method='POST',
        json=payload
    ):
        pass

    # Just call predict directly
    from flask import current_app
    import json
    ctx = current_app._get_current_object()

    # Build response by calling predict logic inline
    amount = float(payload['amount'])
    is_night = payload['is_night']
    new_location = payload['new_location']
    new_device = payload['new_device']
    user_id = payload['user_id']
    now = datetime.now()

    tx_count_24h = behavior_analyzer.get_transaction_count_24h(user_id)
    amount_velocity = behavior_analyzer.get_amount_velocity(user_id, amount)

    features = [amount, is_night, new_location, new_device,
                now.hour, now.weekday(), amount_velocity, tx_count_24h]

    ml_probability, ml_prediction = fraud_model.predict(features)

    tx_data = {'amount': amount, 'is_night': is_night, 'new_location': new_location,
               'new_device': new_device, 'location': '127.0.0.1', 'timestamp': now}
    behavior_score, behavior_reasons = behavior_analyzer.analyze_transaction_behavior(user_id, tx_data)
    location_score, location_reason = location_analyzer.get_location_risk('127.0.0.1')

    ml_score = ml_probability * 100
    combined = min(ml_score * 0.45 + behavior_score * 0.35 + location_score * 0.20, 100)
    final_result = 'FRAUD' if combined > 50 else 'SAFE'

    all_reasons = []
    if ml_score > 65:
        all_reasons.append("ML model indicates high fraud probability")
    elif ml_score > 35:
        all_reasons.append("ML model indicates moderate risk")
    all_reasons.extend(behavior_reasons)
    if location_score > 10:
        all_reasons.append(location_reason)
    if not all_reasons:
        all_reasons.append("No significant risk factors detected")

    transaction_store.add({
        'result': final_result,
        'risk_score': round(combined, 2),
        'amount': amount,
        'user_id': user_id,
        'reasons': all_reasons
    })

    return jsonify({
        'scenario': scenario,
        'input': payload,
        'result': final_result,
        'risk_score': round(combined, 2),
        'confidence': round(abs(50 - combined) / 50, 2),
        'reasons': all_reasons,
        'analysis': {
            'ml_score': round(ml_score, 2),
            'behavior_score': behavior_score,
            'location_score': location_score
        }
    })


# ─── Analytics ────────────────────────────────────────────────────────────────

@predict_bp.route('/analytics/summary', methods=['GET'])
def get_analytics_summary():
    return jsonify(transaction_store.get_summary())


@predict_bp.route('/analytics/live', methods=['GET'])
def get_live_analytics():
    """Last 24h analytics"""
    recent = transaction_store.get_recent(hours=24)
    total = len(recent)
    fraud = sum(1 for r in recent if r.get('result') == 'FRAUD')
    avg_risk = sum(r.get('risk_score', 0) for r in recent) / total if total else 0

    return jsonify({
        'period': '24h',
        'total': total,
        'fraud': fraud,
        'safe': total - fraud,
        'fraud_rate': round((fraud / total) * 100, 2) if total else 0,
        'avg_risk_score': round(avg_risk, 2),
        'last_updated': datetime.now().isoformat()
    })


# ─── Model Info ───────────────────────────────────────────────────────────────

@predict_bp.route('/model/info', methods=['GET'])
def model_info():
    if not fraud_model.is_trained:
        return jsonify({'error': 'Model not trained'}), 503

    importance = dict(zip(
        fraud_model.feature_names,
        [round(float(v), 4) for v in fraud_model.model.feature_importances_]
    ))

    return jsonify({
        'model_status': 'trained',
        'model_type': 'GradientBoostingClassifier',
        'features': fraud_model.feature_names,
        'feature_importance': importance,
        'model_version': '2.0.0'
    })


# ─── User Profile ─────────────────────────────────────────────────────────────

@predict_bp.route('/user/<user_id>/profile', methods=['GET'])
def get_user_profile(user_id: str):
    try:
        profile = behavior_analyzer.get_user_risk_profile(user_id)
        if 'error' in profile:
            return jsonify(profile), 404
        return jsonify(profile)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── Error handlers ───────────────────────────────────────────────────────────

@predict_bp.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@predict_bp.errorhandler(405)
def method_not_allowed(e):
    return jsonify({'error': 'Method not allowed'}), 405

@predict_bp.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500
