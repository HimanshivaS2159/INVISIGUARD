"""
Machine Learning Model for INVISIGUARD Fraud Detection System
Enhanced with 8 features and richer training data
"""

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
import logging
from typing import Tuple, Dict, Any

logger = logging.getLogger(__name__)

class FraudDetectionModel:
    def __init__(self, model_path: str = None):
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = model_path or 'fraud_model.pkl'
        self.is_trained = False

        self.feature_names = [
            'amount',               # Transaction amount
            'is_night',             # Night transaction (0/1)
            'new_location',         # New location (0/1)
            'new_device',           # New device (0/1)
            'hour_of_day',          # Hour 0-23
            'day_of_week',          # Day 0-6
            'amount_velocity',      # Ratio vs user avg (capped at 10)
            'transaction_count_24h' # Transactions in last 24h
        ]

        self._load_model()

    def _generate_sample_data(self, n_samples: int = 5000) -> Tuple[np.ndarray, np.ndarray]:
        np.random.seed(42)

        amounts = np.random.exponential(scale=800, size=n_samples)
        amounts = np.clip(amounts, 10, 100000)

        is_night = np.random.binomial(1, 0.25, n_samples)
        new_location = np.random.binomial(1, 0.18, n_samples)
        new_device = np.random.binomial(1, 0.12, n_samples)
        hour_of_day = np.random.randint(0, 24, n_samples)
        day_of_week = np.random.randint(0, 7, n_samples)
        amount_velocity = np.random.exponential(scale=1.5, size=n_samples)
        amount_velocity = np.clip(amount_velocity, 0.1, 10)
        transaction_count_24h = np.random.poisson(lam=3, size=n_samples)
        transaction_count_24h = np.clip(transaction_count_24h, 0, 50)

        X = np.column_stack([
            amounts, is_night, new_location, new_device,
            hour_of_day, day_of_week, amount_velocity, transaction_count_24h
        ])

        # Fraud probability based on multiple signals
        fraud_prob = (
            (amounts > 5000) * 0.25 +
            (amounts > 20000) * 0.20 +
            (is_night == 1) * 0.15 +
            (new_location == 1) * 0.20 +
            (new_device == 1) * 0.18 +
            ((hour_of_day >= 0) & (hour_of_day <= 4)) * 0.12 +
            (amount_velocity > 5) * 0.20 +
            (transaction_count_24h > 10) * 0.15 +
            (new_location & new_device) * 0.10  # combo risk
        )

        fraud_prob += np.random.normal(0, 0.08, n_samples)
        y = (fraud_prob > 0.55).astype(int)

        return X, y

    def train(self, X: np.ndarray = None, y: np.ndarray = None) -> Dict[str, Any]:
        logger.info("Training fraud detection model...")

        if X is None or y is None:
            X, y = self._generate_sample_data()

        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)

        self.model = GradientBoostingClassifier(
            n_estimators=150,
            learning_rate=0.1,
            max_depth=5,
            random_state=42,
            subsample=0.8
        )

        self.model.fit(X_train_scaled, y_train)

        train_score = self.model.score(X_train_scaled, y_train)
        val_score = self.model.score(X_val_scaled, y_val)

        feature_importance = dict(zip(self.feature_names, self.model.feature_importances_))
        self.is_trained = True
        self._save_model()

        logger.info(f"Model trained | train_acc={train_score:.3f} val_acc={val_score:.3f}")

        return {
            'training_accuracy': train_score,
            'validation_accuracy': val_score,
            'feature_importance': feature_importance,
            'n_samples': len(X),
            'n_features': len(self.feature_names)
        }

    def predict(self, features: list) -> Tuple[float, int]:
        if not self.is_trained:
            logger.warning("Model not trained. Using default prediction.")
            return 0.1, 0

        try:
            features_array = np.array(features).reshape(1, -1)
            features_scaled = self.scaler.transform(features_array)
            fraud_prob = self.model.predict_proba(features_scaled)[0][1]
            fraud_label = int(fraud_prob > 0.5)
            return fraud_prob, fraud_label
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return 0.1, 0

    def predict_batch(self, features_list: list) -> list:
        return [self.predict(f) for f in features_list]

    def _save_model(self):
        try:
            joblib.dump({
                'model': self.model,
                'scaler': self.scaler,
                'feature_names': self.feature_names,
                'is_trained': self.is_trained
            }, self.model_path)
            logger.info(f"Model saved to {self.model_path}")
        except Exception as e:
            logger.error(f"Error saving model: {e}")

    def _load_model(self):
        try:
            if os.path.exists(self.model_path):
                data = joblib.load(self.model_path)
                # Retrain if feature count changed
                if len(data.get('feature_names', [])) != len(self.feature_names):
                    logger.info("Feature count changed — retraining model.")
                    self.train()
                    return
                self.model = data['model']
                self.scaler = data['scaler']
                self.feature_names = data['feature_names']
                self.is_trained = data['is_trained']
                logger.info(f"Model loaded from {self.model_path}")
            else:
                self.train()
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.train()

    def get_feature_explanation(self, features: list) -> Dict[str, str]:
        return {
            'amount': f"Transaction amount: ₹{features[0]:,.2f}",
            'is_night': "Night transaction (22:00–06:00)" if features[1] else "Daytime transaction",
            'new_location': "New/unknown location detected" if features[2] else "Known location",
            'new_device': "New/unknown device detected" if features[3] else "Known device",
            'hour_of_day': f"Transaction at hour {int(features[4])}:00",
            'day_of_week': f"Day of week: {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][int(features[5]) % 7]}",
            'amount_velocity': f"Amount is {features[6]:.1f}x user average",
            'transaction_count_24h': f"{int(features[7])} transactions in last 24h"
        }

# Global model instance
fraud_model = FraudDetectionModel()
