"""
Behavioral Analysis Service for INVISIGUARD Fraud Detection System
"""

from typing import List, Dict, Any, Tuple
import time
from datetime import datetime, timedelta

class BehaviorAnalyzer:
    """
    Analyzes behavioral patterns for fraud detection
    
    This class implements rule-based and behavioral analysis
    to complement the machine learning model predictions.
    """
    
    def __init__(self):
        # Risk weights for different behavioral factors
        self.risk_weights = {
            'high_amount': 25,        # High transaction amount
            'night_transaction': 15,    # Transaction during night hours
            'new_location': 20,         # Transaction from new location
            'new_device': 20,           # Transaction from new device
            'rapid_transactions': 30,    # Multiple transactions in short time
            'unusual_amount': 18,       # Amount significantly different from usual
            'high_frequency': 15         # High transaction frequency
        }
        
        # Define night hours (22:00 - 06:00)
        self.night_start_hour = 22
        self.night_end_hour = 6
        
        # High amount threshold (configurable)
        self.high_amount_threshold = 3000
        
        # User behavior tracking (in production, this would be persistent)
        self.user_profiles = {}
    
    def analyze_transaction_behavior(self, user_id: str, transaction_data: Dict[str, Any]) -> Tuple[int, List[str]]:
        """
        Analyze transaction behavior and return risk score and reasons
        
        Args:
            user_id: Unique identifier for the user
            transaction_data: Dictionary containing transaction details
            
        Returns:
            Tuple of (risk_score, list_of_reasons)
        """
        risk_score = 0
        reasons = []
        
        # Initialize user profile if not exists
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {
                'transaction_count': 0,
                'total_amount': 0,
                'avg_amount': 0,
                'last_transaction_time': None,
                'locations': set(),
                'devices': set(),
                'recent_transactions': []
            }
        
        profile = self.user_profiles[user_id]
        
        # Analyze amount
        amount = transaction_data.get('amount', 0)
        amount_risk, amount_reasons = self._analyze_amount(amount, profile)
        risk_score += amount_risk
        reasons.extend(amount_reasons)
        
        # Analyze timing
        is_night = transaction_data.get('is_night', False)
        if is_night:
            risk_score += self.risk_weights['night_transaction']
            reasons.append("Transaction during night hours")
        
        # Analyze location
        new_location = transaction_data.get('new_location', False)
        if new_location:
            risk_score += self.risk_weights['new_location']
            reasons.append("Transaction from new location")
        
        # Analyze device
        new_device = transaction_data.get('new_device', False)
        if new_device:
            risk_score += self.risk_weights['new_device']
            reasons.append("Transaction from new device")
        
        # Analyze transaction frequency
        freq_risk, freq_reasons = self._analyze_frequency(profile)
        risk_score += freq_risk
        reasons.extend(freq_reasons)
        
        # Update user profile
        self._update_user_profile(user_id, transaction_data)
        
        # Cap risk score at 100
        risk_score = min(risk_score, 100)
        
        return risk_score, reasons
    
    def _analyze_amount(self, amount: float, profile: Dict) -> Tuple[int, List[str]]:
        """
        Analyze transaction amount for risk factors
        
        Args:
            amount: Transaction amount
            profile: User profile data
            
        Returns:
            Tuple of (risk_score, list_of_reasons)
        """
        risk_score = 0
        reasons = []
        
        # Check for high amount
        if amount > self.high_amount_threshold:
            risk_score += self.risk_weights['high_amount']
            reasons.append(f"High transaction amount: ${amount:.2f}")
        
        # Check for unusual amount compared to user average
        if profile['transaction_count'] > 0:
            avg_amount = profile['avg_amount']
            if avg_amount > 0:
                amount_ratio = amount / avg_amount
                if amount_ratio > 5:  # 5x higher than usual
                    risk_score += self.risk_weights['unusual_amount']
                    reasons.append(f"Unusual amount: {amount_ratio:.1f}x user average")
        
        return risk_score, reasons
    
    def _analyze_frequency(self, profile: Dict) -> Tuple[int, List[str]]:
        """
        Analyze transaction frequency for risk factors
        
        Args:
            profile: User profile data
            
        Returns:
            Tuple of (risk_score, list_of_reasons)
        """
        risk_score = 0
        reasons = []
        
        current_time = datetime.now()
        recent_transactions = profile.get('recent_transactions', [])
        
        # Count transactions in last hour
        one_hour_ago = current_time - timedelta(hours=1)
        recent_hour_count = sum(1 for t in recent_transactions if t > one_hour_ago)
        
        if recent_hour_count > 10:  # More than 10 transactions in an hour
            risk_score += self.risk_weights['rapid_transactions']
            reasons.append(f"High frequency: {recent_hour_count} transactions in last hour")
        
        # Count transactions in last 24 hours
        one_day_ago = current_time - timedelta(hours=24)
        recent_day_count = sum(1 for t in recent_transactions if t > one_day_ago)
        
        if recent_day_count > 50:  # More than 50 transactions in a day
            risk_score += self.risk_weights['high_frequency']
            reasons.append(f"High activity: {recent_day_count} transactions in last 24 hours")
        
        return risk_score, reasons
    
    def _update_user_profile(self, user_id: str, transaction_data: Dict[str, Any]):
        """
        Update user profile with new transaction data
        
        Args:
            user_id: Unique identifier for the user
            transaction_data: Dictionary containing transaction details
        """
        profile = self.user_profiles[user_id]
        current_time = datetime.now()
        amount = transaction_data.get('amount', 0)
        
        # Update basic statistics
        profile['transaction_count'] += 1
        profile['total_amount'] += amount
        profile['avg_amount'] = profile['total_amount'] / profile['transaction_count']
        profile['last_transaction_time'] = current_time
        
        # Add to recent transactions (keep last 100)
        profile['recent_transactions'].append(current_time)
        if len(profile['recent_transactions']) > 100:
            profile['recent_transactions'] = profile['recent_transactions'][-100:]
        
        # Update locations and devices (if available)
        location = transaction_data.get('location')
        if location:
            profile['locations'].add(location)
        
        device = transaction_data.get('device')
        if device:
            profile['devices'].add(device)
    
    def is_night_transaction(self, timestamp: datetime = None) -> bool:
        """
        Check if a transaction occurred during night hours
        
        Args:
            timestamp: Transaction timestamp (defaults to current time)
            
        Returns:
            True if transaction is during night hours
        """
        if timestamp is None:
            timestamp = datetime.now()
        
        hour = timestamp.hour
        return hour >= self.night_start_hour or hour < self.night_end_hour
    
    def get_user_risk_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Get comprehensive risk profile for a user
        
        Args:
            user_id: Unique identifier for the user
            
        Returns:
            Dictionary containing user risk profile
        """
        if user_id not in self.user_profiles:
            return {'error': 'User not found'}
        
        profile = self.user_profiles[user_id]
        
        # Calculate risk metrics
        total_transactions = profile['transaction_count']
        avg_amount = profile['avg_amount']
        unique_locations = len(profile['locations'])
        unique_devices = len(profile['devices'])
        
        # Calculate frequency score
        recent_transactions = profile.get('recent_transactions', [])
        current_time = datetime.now()
        one_day_ago = current_time - timedelta(hours=24)
        recent_day_count = sum(1 for t in recent_transactions if t > one_day_ago)
        
        frequency_score = min(recent_day_count / 10, 1.0) * 100  # Normalize to 0-100
        
        return {
            'user_id': user_id,
            'total_transactions': total_transactions,
            'average_transaction_amount': avg_amount,
            'unique_locations': unique_locations,
            'unique_devices': unique_devices,
            'frequency_score': frequency_score,
            'last_transaction': profile['last_transaction_time'].isoformat() if profile['last_transaction_time'] else None,
            'risk_level': self._calculate_user_risk_level(profile)
        }
    
    def _calculate_user_risk_level(self, profile: Dict) -> str:
        """
        Calculate overall risk level for a user
        
        Args:
            profile: User profile data
            
        Returns:
            Risk level string (LOW, MEDIUM, HIGH)
        """
        # Simple risk calculation based on user behavior
        risk_score = 0
        
        # High transaction volume
        if profile['transaction_count'] > 100:
            risk_score += 20
        elif profile['transaction_count'] > 50:
            risk_score += 10
        
        # High average amount
        if profile['avg_amount'] > 2000:
            risk_score += 15
        elif profile['avg_amount'] > 1000:
            risk_score += 8
        
        # Many locations/devices
        if len(profile['locations']) > 10:
            risk_score += 15
        elif len(profile['locations']) > 5:
            risk_score += 8
        
        if len(profile['devices']) > 5:
            risk_score += 10
        elif len(profile['devices']) > 3:
            risk_score += 5
        
        # Determine risk level
        if risk_score >= 40:
            return 'HIGH'
        elif risk_score >= 20:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def clear_user_profiles(self):
        """Clear all user profiles (for testing/reset)"""
        self.user_profiles.clear()

# Global behavior analyzer instance
behavior_analyzer = BehaviorAnalyzer()
