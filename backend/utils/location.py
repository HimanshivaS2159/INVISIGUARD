"""
Location-based risk assessment utilities for INVISIGUARD Fraud Detection
"""

import requests
import time
import logging
from typing import Tuple, Dict, Any

logger = logging.getLogger(__name__)

class LocationRiskAnalyzer:
    """Analyzes location-based risk factors for transactions"""
    
    def __init__(self):
        self.cache = {}
        self.cache_duration = 3600  # 1 hour cache
        
        # High-risk countries (simplified for demo)
        self.high_risk_countries = {
            'NG', 'PK', 'RU', 'CN', 'IR', 'KP', 'MM', 'AF', 'SO', 'SD', 'YE'
        }
        
        # Medium-risk countries
        self.medium_risk_countries = {
            'IN', 'BR', 'ZA', 'MX', 'PH', 'ID', 'TH', 'VN', 'BD', 'NG', 'KE'
        }
    
    def get_location_risk(self, ip_address: str = None) -> Tuple[int, str]:
        """
        Get location-based risk score and reason
        
        Args:
            ip_address: IP address to analyze (optional)
            
        Returns:
            Tuple of (risk_score, reason)
        """
        if not ip_address:
            return 0, "Unknown location"
        
        # Check cache first
        cache_key = f"location_{ip_address}"
        current_time = time.time()
        
        if cache_key in self.cache:
            cached_data = self.cache[cache_key]
            if current_time - cached_data['timestamp'] < self.cache_duration:
                return cached_data['score'], cached_data['reason']
        
        try:
            # Get location data from IP (using ipinfo.io as example)
            location_data = self._fetch_location_data(ip_address)
            
            if not location_data:
                return 0, "Location unknown"
            
            country = location_data.get('country', 'Unknown')
            city = location_data.get('city', 'Unknown')
            
            # Calculate risk based on country
            if country in self.high_risk_countries:
                risk_score = 25
                reason = f"High-risk country: {country}"
            elif country in self.medium_risk_countries:
                risk_score = 15
                reason = f"Medium-risk country: {country}"
            else:
                risk_score = 5
                reason = f"Normal location: {country}, {city}"
            
            # Cache the result
            self.cache[cache_key] = {
                'score': risk_score,
                'reason': reason,
                'timestamp': current_time
            }
            
            return risk_score, reason
            
        except Exception as e:
            logger.error(f"Location analysis error: {e}")
            return 0, "Location analysis failed"
    
    def _fetch_location_data(self, ip_address: str) -> Dict[str, Any]:
        """
        Fetch location data from IP geolocation service
        
        Args:
            ip_address: IP address to lookup
            
        Returns:
            Dictionary with location information
        """
        try:
            # Using ipinfo.io as example (replace with your preferred service)
            url = f"https://ipinfo.io/{ip_address}/json"
            
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.json()
            else:
                return {}
                
        except requests.RequestException:
            # Fallback to mock data for demo purposes
            return self._get_mock_location_data()
    
    def _get_mock_location_data(self) -> Dict[str, Any]:
        """
        Generate mock location data for demo/testing purposes
        """
        import random
        
        mock_locations = [
            {'country': 'US', 'city': 'New York', 'region': 'Northeast'},
            {'country': 'GB', 'city': 'London', 'region': 'Europe'},
            {'country': 'IN', 'city': 'Mumbai', 'region': 'Asia'},
            {'country': 'NG', 'city': 'Lagos', 'region': 'Africa'},
            {'country': 'CN', 'city': 'Beijing', 'region': 'Asia'}
        ]
        
        return random.choice(mock_locations)
    
    def is_new_location(self, current_ip: str, previous_ips: list) -> bool:
        """
        Check if the current IP/location is new for the user
        
        Args:
            current_ip: Current IP address
            previous_ips: List of previous IP addresses
            
        Returns:
            True if this is a new location, False otherwise
        """
        if not previous_ips:
            return True
        
        return current_ip not in previous_ips
    
    def clear_cache(self):
        """Clear the location cache"""
        self.cache.clear()

# Singleton instance for location analysis
location_analyzer = LocationRiskAnalyzer()
