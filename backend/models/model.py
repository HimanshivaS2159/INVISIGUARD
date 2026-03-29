"""
Machine Learning Model for INVISIGUARD Fraud Detection System
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
import logging
from typing import Tuple, Dict, Any

logger = logging.getLogger(__name__)

class FraudDetectionModel:
    """
    Machine Learning Model for Fraud Detection
    
    This class encapsulates the ML model used for fraud detection,
    including training, prediction, and model management.
    """
    
    def __init__(self, model_path: str = None):
        """
        Initialize the fraud detection model
        
        Args:
            model_path: Path to saved model file (optional)
        """
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = model_path or 'fraud_model.pkl'
        self.is_trained = False
        
        # Feature names for explainability
        self.feature_names = [
            'amount',           # Transaction amount
            'is_night',        # Night transaction (0/1)
            'new_location',     # New location (0/1)
            'new_device'        # New device (0/1)
        ]
        
        # Try to load existing model
        self._load_model()
    
    def _generate_sample_data(self, n_samples: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate sample training data for demonstration purposes
        
        In a real production environment, this would be replaced with
        actual historical transaction data.
        
        Args:
            n_samples: Number of samples to generate
            
        Returns:
            Tuple of (X, y) where X is features and y is labels
        """
        np.random.seed(42)  # For reproducible results
        
        # Generate features
        amounts = np.random.exponential(scale=1000, size=n_samples)
        amounts = np.clip(amounts, 1, 50000)  # Clip to realistic range
        
        is_night = np.random.binomial(1, 0.3, n_samples)  # 30% night transactions
        new_location = np.random.binomial(1, 0.2, n_samples)  # 20% new locations
        new_device = np.random.binomial(1, 0.15, n_samples)  # 15% new devices
        
        # Combine features
        X = np.column_stack([amounts, is_night, new_location, new_device])
        
        # Generate fraud labels based on rules (simplified for demo)
        fraud_prob = (
            (amounts > 3000) * 0.3 +           # High amount
            (is_night == 1) * 0.2 +              # Night transaction
            (new_location == 1) * 0.25 +           # New location
            (new_device == 1) * 0.25                # New device
        )
        
        # Add some noise and convert to binary labels
        fraud_prob += np.random.normal(0, 0.1, n_samples)
        y = (fraud_prob > 0.5).astype(int)
        
        return X, y
    
    def train(self, X: np.ndarray = None, y: np.ndarray = None) -> Dict[str, Any]:
        """
        Train the fraud detection model
        
        Args:
            X: Training features (optional, will generate sample data if None)
            y: Training labels (optional, will generate sample data if None)
            
        Returns:
            Dictionary with training metrics
        """
        logger.info("Training fraud detection model...")
        
        # Generate sample data if not provided
        if X is None or y is None:
            X, y = self._generate_sample_data()
        
        # Split data for training and validation
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)
        
        # Train Random Forest model
        self.model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        train_score = self.model.score(X_train_scaled, y_train)
        val_score = self.model.score(X_val_scaled, y_val)
        
        # Get feature importance
        feature_importance = dict(zip(
            self.feature_names,
            self.model.feature_importances_
        ))
        
        self.is_trained = True
        
        # Save model
        self._save_model()
        
        logger.info("Model trained successfully!")
        logger.info(f"Training accuracy: {train_score:.3f}")
        logger.info(f"Validation accuracy: {val_score:.3f}")
        
        return {
            'training_accuracy': train_score,
            'validation_accuracy': val_score,
            'feature_importance': feature_importance,
            'n_samples': len(X),
            'n_features': len(self.feature_names)
        }
    
    def predict(self, features: list) -> Tuple[float, int]:
        """
        Make prediction for a single transaction
        
        Args:
            features: List of features [amount, is_night, new_location, new_device]
            
        Returns:
            Tuple of (fraud_probability, fraud_label)
        """
        if not self.is_trained:
            logger.warning("Warning: Model not trained. Using default prediction.")
            return 0.1, 0
        
        try:
            # Convert to numpy array and reshape
            features_array = np.array(features).reshape(1, -1)
            
            # Scale features
            features_scaled = self.scaler.transform(features_array)
            
            # Get prediction probabilities
            fraud_prob = self.model.predict_proba(features_scaled)[0][1]
            fraud_label = int(fraud_prob > 0.5)
            
            return fraud_prob, fraud_label
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return 0.1, 0
    
    def predict_batch(self, features_list: list) -> list:
        """
        Make predictions for multiple transactions
        
        Args:
            features_list: List of feature arrays
            
        Returns:
            List of prediction tuples
        """
        results = []
        for features in features_list:
            prob, label = self.predict(features)
            results.append((prob, label))
        
        return results
    
    def _save_model(self):
        """Save the trained model to disk"""
        try:
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'feature_names': self.feature_names,
                'is_trained': self.is_trained
            }
            joblib.dump(model_data, self.model_path)
            logger.info(f"Model saved to {self.model_path}")
        except Exception as e:
            logger.error(f"Error saving model: {e}")
    
    def _load_model(self):
        """Load a trained model from disk"""
        try:
            if os.path.exists(self.model_path):
                model_data = joblib.load(self.model_path)
                self.model = model_data['model']
                self.scaler = model_data['scaler']
                self.feature_names = model_data['feature_names']
                self.is_trained = model_data['is_trained']
                logger.info(f"Model loaded from {self.model_path}")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            # Train with sample data if loading fails
            self.train()
    
    def get_feature_explanation(self, features: list) -> Dict[str, str]:
        """
        Get explanation for prediction based on feature importance
        
        Args:
            features: List of features used for prediction
            
        Returns:
            Dictionary with feature explanations
        """
        explanations = {
            'amount': f"Transaction amount: ${features[0]:.2f}",
            'is_night': "Night transaction" if features[1] else "Daytime transaction",
            'new_location': "New location detected" if features[2] else "Known location",
            'new_device': "New device detected" if features[3] else "Known device"
        }
        
        return explanations

# Global model instance
fraud_model = FraudDetectionModel()
