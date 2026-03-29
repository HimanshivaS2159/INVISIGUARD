"""
Behavioral Analysis Service for INVISIGUARD Fraud Detection System
Enhanced with velocity checks, anomaly scoring, and richer profiling
"""

from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class BehaviorAnalyzer:
    def __init__(self):
        self.risk_weights = {
            'high_amount': 25,
            'night_transaction': 15,
            'new_location': 20,
            'new_device': 20,
            'rapid_transactions': 30,
            'unusual_amount': 18,
            'high_frequency': 15,
            'velocity_spike': 22,
            'odd_hour': 12
        }

        self.night_start_hour = 22
        self.night_end_hour = 6
        self.high_amount_threshold = 5000

        # In-memory user profiles
        self.user_profiles: Dict[str, Dict] = {}

    def _init_profile(self) -> Dict:
        return {
            'transaction_count': 0,
            'total_amount': 0.0,
            'avg_amount': 0.0,
            'last_transaction_time': None,
            'locations': set(),
            'devices': set(),
            'recent_transactions': [],   # list of (datetime, amount)
            'hourly_counts': [0] * 24    # transactions per hour bucket
        }

    def analyze_transaction_behavior(
        self, user_id: str, transaction_data: Dict[str, Any]
    ) -> Tuple[int, List[str]]:

        risk_score = 0
        reasons = []

        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = self._init_profile()

        profile = self.user_profiles[user_id]
        amount = float(transaction_data.get('amount', 0))
        now = datetime.now()

        # --- Amount analysis ---
        if amount > self.high_amount_threshold:
            risk_score += self.risk_weights['high_amount']
            reasons.append(f"High transaction amount: ₹{amount:,.0f}")

        if profile['transaction_count'] > 2 and profile['avg_amount'] > 0:
            velocity = amount / profile['avg_amount']
            if velocity > 8:
                risk_score += self.risk_weights['velocity_spike']
                reasons.append(f"Amount spike: {velocity:.1f}x your usual average")
            elif velocity > 4:
                risk_score += self.risk_weights['unusual_amount']
                reasons.append(f"Unusual amount: {velocity:.1f}x user average")

        # --- Timing ---
        if transaction_data.get('is_night', False):
            risk_score += self.risk_weights['night_transaction']
            reasons.append("Transaction during night hours (22:00–06:00)")

        hour = now.hour
        if 0 <= hour <= 4:
            risk_score += self.risk_weights['odd_hour']
            reasons.append(f"Very late night transaction at {hour:02d}:00")

        # --- Location & Device ---
        if transaction_data.get('new_location', False):
            risk_score += self.risk_weights['new_location']
            reasons.append("Transaction from new/unrecognized location")

        if transaction_data.get('new_device', False):
            risk_score += self.risk_weights['new_device']
            reasons.append("Transaction from new/unrecognized device")

        # --- Frequency analysis ---
        recent = profile['recent_transactions']
        one_hour_ago = now - timedelta(hours=1)
        one_day_ago = now - timedelta(hours=24)

        count_1h = sum(1 for t, _ in recent if t > one_hour_ago)
        count_24h = sum(1 for t, _ in recent if t > one_day_ago)

        if count_1h > 8:
            risk_score += self.risk_weights['rapid_transactions']
            reasons.append(f"Rapid transactions: {count_1h} in the last hour")
        elif count_1h > 4:
            risk_score += 10
            reasons.append(f"Elevated frequency: {count_1h} transactions in last hour")

        if count_24h > 30:
            risk_score += self.risk_weights['high_frequency']
            reasons.append(f"High daily activity: {count_24h} transactions today")

        # Update profile
        self._update_profile(user_id, transaction_data, amount, now)

        return min(risk_score, 100), reasons

    def _update_profile(self, user_id: str, tx: Dict, amount: float, now: datetime):
        p = self.user_profiles[user_id]
        p['transaction_count'] += 1
        p['total_amount'] += amount
        p['avg_amount'] = p['total_amount'] / p['transaction_count']
        p['last_transaction_time'] = now
        p['recent_transactions'].append((now, amount))
        # Keep last 200
        if len(p['recent_transactions']) > 200:
            p['recent_transactions'] = p['recent_transactions'][-200:]
        p['hourly_counts'][now.hour] += 1

        loc = tx.get('location')
        if loc:
            p['locations'].add(loc)
        dev = tx.get('device')
        if dev:
            p['devices'].add(dev)

    def get_transaction_count_24h(self, user_id: str) -> int:
        if user_id not in self.user_profiles:
            return 0
        recent = self.user_profiles[user_id]['recent_transactions']
        cutoff = datetime.now() - timedelta(hours=24)
        return sum(1 for t, _ in recent if t > cutoff)

    def get_amount_velocity(self, user_id: str, amount: float) -> float:
        if user_id not in self.user_profiles:
            return 1.0
        avg = self.user_profiles[user_id].get('avg_amount', 0)
        if avg <= 0:
            return 1.0
        return round(min(amount / avg, 10.0), 2)

    def is_night_transaction(self, timestamp: datetime = None) -> bool:
        if timestamp is None:
            timestamp = datetime.now()
        h = timestamp.hour
        return h >= self.night_start_hour or h < self.night_end_hour

    def get_user_risk_profile(self, user_id: str) -> Dict[str, Any]:
        if user_id not in self.user_profiles:
            return {'error': 'User not found'}

        p = self.user_profiles[user_id]
        now = datetime.now()
        cutoff_24h = now - timedelta(hours=24)
        count_24h = sum(1 for t, _ in p['recent_transactions'] if t > cutoff_24h)
        frequency_score = min(count_24h / 10, 1.0) * 100

        return {
            'user_id': user_id,
            'total_transactions': p['transaction_count'],
            'average_transaction_amount': round(p['avg_amount'], 2),
            'total_amount': round(p['total_amount'], 2),
            'unique_locations': len(p['locations']),
            'unique_devices': len(p['devices']),
            'transactions_last_24h': count_24h,
            'frequency_score': round(frequency_score, 2),
            'peak_hour': int(np.argmax(p['hourly_counts'])) if any(p['hourly_counts']) else None,
            'last_transaction': p['last_transaction_time'].isoformat() if p['last_transaction_time'] else None,
            'risk_level': self._calculate_risk_level(p)
        }

    def _calculate_risk_level(self, p: Dict) -> str:
        score = 0
        if p['transaction_count'] > 100: score += 20
        elif p['transaction_count'] > 50: score += 10
        if p['avg_amount'] > 5000: score += 20
        elif p['avg_amount'] > 2000: score += 10
        if len(p['locations']) > 10: score += 15
        elif len(p['locations']) > 5: score += 8
        if len(p['devices']) > 5: score += 10
        elif len(p['devices']) > 3: score += 5
        if score >= 40: return 'HIGH'
        if score >= 20: return 'MEDIUM'
        return 'LOW'

    def clear_user_profiles(self):
        self.user_profiles.clear()


# numpy needed for argmax
import numpy as np

behavior_analyzer = BehaviorAnalyzer()
