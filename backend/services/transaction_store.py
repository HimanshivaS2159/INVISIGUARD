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
            # Return structure matching frontend AnalyticsSummary type
            return {
                'total_transactions': 0,
                'fraud_count': 0,
                'fraudulent_transactions': 0,
                'safe_count': 0,
                'safe_transactions': 0,
                'fraud_rate': 0.0,
                'avg_risk_score': 0.0,
                'average_risk_score': 0.0,
                'recent_transactions': [],
                'risk_distribution': {'0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0},
                'hourly_trend': [{'hour': h, 'count': 0, 'fraud': 0} for h in range(24)],
                'last_updated': datetime.now().isoformat()
            }

        total = len(records)
        fraud = sum(1 for r in records if r.get('result') == 'FRAUD')
        safe = total - fraud
        avg_risk = sum(r.get('risk_score', 0) for r in records) / total

        # Risk distribution in 0-20, 20-40, ... buckets (matching frontend)
        dist = {'0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0}
        for r in records:
            s = r.get('risk_score', 0)
            if s <= 20: dist['0-20'] += 1
            elif s <= 40: dist['20-40'] += 1
            elif s <= 60: dist['40-60'] += 1
            elif s <= 80: dist['60-80'] += 1
            else: dist['80-100'] += 1

        # Hourly trend (last 24h) with fraud breakdown
        hourly_total: Dict[int, int] = {i: 0 for i in range(24)}
        hourly_fraud: Dict[int, int] = {i: 0 for i in range(24)}
        recent = self.get_recent(hours=24)
        for r in recent:
            try:
                h = datetime.fromisoformat(r['stored_at']).hour
                hourly_total[h] += 1
                if r.get('result') == 'FRAUD':
                    hourly_fraud[h] += 1
            except Exception:
                pass

        # Recent transactions in frontend-expected format
        recent_tx = []
        for r in list(reversed(records))[:10]:
            recent_tx.append({
                'user_id': r.get('user_id', 'unknown'),
                'amount': r.get('amount', 0),
                'risk_score': r.get('risk_score', 0),
                'result': r.get('result', 'SAFE'),
                'timestamp': r.get('stored_at', datetime.now().isoformat()),
                'reasons': r.get('reasons', [])
            })

        return {
            'total_transactions': total,
            'fraud_count': fraud,
            'fraudulent_transactions': fraud,   # alias
            'safe_count': safe,
            'safe_transactions': safe,           # alias
            'fraud_rate': round((fraud / total) * 100, 2) if total else 0,
            'avg_risk_score': round(avg_risk, 2),
            'average_risk_score': round(avg_risk, 2),  # alias
            'recent_transactions': recent_tx,
            'risk_distribution': dist,
            'hourly_trend': [{'hour': h, 'count': hourly_total[h], 'fraud': hourly_fraud[h]} for h in range(24)],
            'last_updated': datetime.now().isoformat()
        }

    def clear(self):
        with self._lock:
            self._store.clear()


transaction_store = TransactionStore()
