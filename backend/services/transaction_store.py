"""
In-memory transaction store for real-time analytics
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any
from collections import deque
import threading

class TransactionStore:
    """Thread-safe in-memory store for recent transactions"""

    def __init__(self, max_size: int = 1000):
        self._store: deque = deque(maxlen=max_size)
        self._lock = threading.Lock()

    def add(self, record: Dict[str, Any]):
        with self._lock:
            record['stored_at'] = datetime.now().isoformat()
            self._store.append(record)

    def get_all(self) -> List[Dict]:
        with self._lock:
            return list(self._store)

    def get_recent(self, hours: int = 24) -> List[Dict]:
        cutoff = datetime.now() - timedelta(hours=hours)
        with self._lock:
            return [
                r for r in self._store
                if datetime.fromisoformat(r['stored_at']) > cutoff
            ]

    def get_summary(self) -> Dict[str, Any]:
        records = self.get_all()
        if not records:
            return {
                'total_transactions': 0,
                'fraudulent_transactions': 0,
                'safe_transactions': 0,
                'fraud_rate': 0.0,
                'average_risk_score': 0.0,
                'total_amount_analyzed': 0.0,
                'risk_distribution': {'low': 0, 'medium': 0, 'high': 0},
                'top_risk_factors': [],
                'last_updated': datetime.now().isoformat()
            }

        total = len(records)
        fraud = sum(1 for r in records if r.get('result') == 'FRAUD')
        safe = total - fraud
        avg_risk = sum(r.get('risk_score', 0) for r in records) / total
        total_amount = sum(r.get('amount', 0) for r in records)

        # Risk distribution
        low = sum(1 for r in records if r.get('risk_score', 0) <= 30)
        medium = sum(1 for r in records if 30 < r.get('risk_score', 0) <= 70)
        high = sum(1 for r in records if r.get('risk_score', 0) > 70)

        # Top risk factors
        factor_counts: Dict[str, int] = {}
        for r in records:
            for reason in r.get('reasons', []):
                key = reason[:40]
                factor_counts[key] = factor_counts.get(key, 0) + 1

        top_factors = sorted(factor_counts.items(), key=lambda x: x[1], reverse=True)[:5]

        # Hourly trend (last 24h)
        hourly: Dict[int, int] = {i: 0 for i in range(24)}
        recent = self.get_recent(hours=24)
        for r in recent:
            try:
                h = datetime.fromisoformat(r['stored_at']).hour
                hourly[h] += 1
            except Exception:
                pass

        return {
            'total_transactions': total,
            'fraudulent_transactions': fraud,
            'safe_transactions': safe,
            'fraud_rate': round((fraud / total) * 100, 2) if total else 0,
            'average_risk_score': round(avg_risk, 2),
            'total_amount_analyzed': round(total_amount, 2),
            'risk_distribution': {
                'low': low,
                'medium': medium,
                'high': high
            },
            'top_risk_factors': [{'factor': f, 'count': c} for f, c in top_factors],
            'hourly_trend': [{'hour': h, 'count': hourly[h]} for h in range(24)],
            'last_updated': datetime.now().isoformat()
        }

    def clear(self):
        with self._lock:
            self._store.clear()


transaction_store = TransactionStore()
