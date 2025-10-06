#!/usr/bin/env python3
"""
NITS Production Monitoring Script
Based on DEPLOYMENT_FIX_GUIDE.md - Production Deployment section

This script provides real-time monitoring and alerting for NITS in production.
Features:
- Performance metrics tracking
- Error rate monitoring
- Batch processing stats
- Automated alerting
- Log rotation and management
"""

import json
import time
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List
from dataclasses import dataclass, asdict
import threading

# Configure logging as per DEPLOYMENT_FIX_GUIDE
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('nits.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('NITS.Monitor')


@dataclass
class PerformanceMetrics:
    """Track system performance metrics"""
    timestamp: str
    documents_processed: int = 0
    processing_time_seconds: float = 0.0
    violations_found: int = 0
    errors_count: int = 0
    success_rate: float = 100.0
    avg_processing_speed: float = 0.0  # docs per minute
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ProductionMonitor:
    """
    Production monitoring system for NITS
    Implements best practices from DEPLOYMENT_FIX_GUIDE.md
    """
    
    def __init__(self, metrics_file: str = "production_metrics.json"):
        self.metrics_file = Path(metrics_file)
        self.current_metrics = PerformanceMetrics(
            timestamp=datetime.now().isoformat()
        )
        self.alert_threshold = {
            'error_rate': 0.05,  # 5% error rate
            'min_success_rate': 0.95,  # 95% success rate
            'min_processing_speed': 50  # 50 docs/min from guide
        }
        logger.info("✅ Production Monitor initialized")
    
    def record_processing(self, 
                         document_name: str,
                         violations: int,
                         processing_time: float,
                         success: bool):
        """Record a document processing event"""
        self.current_metrics.documents_processed += 1
        self.current_metrics.processing_time_seconds += processing_time
        self.current_metrics.violations_found += violations
        
        if not success:
            self.current_metrics.errors_count += 1
        
        # Calculate success rate
        if self.current_metrics.documents_processed > 0:
            self.current_metrics.success_rate = (
                (self.current_metrics.documents_processed - self.current_metrics.errors_count) /
                self.current_metrics.documents_processed * 100
            )
        
        # Calculate processing speed (docs/min)
        if self.current_metrics.processing_time_seconds > 0:
            self.current_metrics.avg_processing_speed = (
                self.current_metrics.documents_processed /
                (self.current_metrics.processing_time_seconds / 60)
            )
        
        # Log processing
        status = "✅" if success else "❌"
        logger.info(
            f"{status} Processed: {document_name} | "
            f"Violations: {violations} | "
            f"Time: {processing_time:.2f}s"
        )
        
        # Check for alerts
        self._check_alerts()
    
    def _check_alerts(self):
        """Check metrics against thresholds and send alerts"""
        error_rate = (self.current_metrics.errors_count / 
                     max(self.current_metrics.documents_processed, 1))
        
        # Alert on high error rate
        if error_rate > self.alert_threshold['error_rate']:
            self._send_alert(
                f"⚠️  HIGH ERROR RATE: {error_rate*100:.1f}% "
                f"(threshold: {self.alert_threshold['error_rate']*100}%)"
            )
        
        # Alert on low success rate
        if self.current_metrics.success_rate < self.alert_threshold['min_success_rate'] * 100:
            self._send_alert(
                f"⚠️  LOW SUCCESS RATE: {self.current_metrics.success_rate:.1f}% "
                f"(threshold: {self.alert_threshold['min_success_rate']*100}%)"
            )
        
        # Alert on slow processing
        if (self.current_metrics.avg_processing_speed > 0 and 
            self.current_metrics.avg_processing_speed < self.alert_threshold['min_processing_speed']):
            self._send_alert(
                f"⚠️  SLOW PROCESSING: {self.current_metrics.avg_processing_speed:.1f} docs/min "
                f"(threshold: {self.alert_threshold['min_processing_speed']} docs/min)"
            )
    
    def _send_alert(self, message: str):
        """
        Send alert notification
        In production, integrate with Slack, email, PagerDuty, etc.
        """
        logger.error(f"🚨 ALERT: {message}")
        # TODO: Integrate with your alerting system
        # Examples:
        # - send_slack_alert(message)
        # - send_email_alert(message)
        # - trigger_pagerduty(message)
    
    def save_metrics(self):
        """Save current metrics to file"""
        try:
            with open(self.metrics_file, 'w') as f:
                json.dump(self.current_metrics.to_dict(), f, indent=2)
            logger.info(f"💾 Metrics saved to {self.metrics_file}")
        except Exception as e:
            logger.error(f"❌ Failed to save metrics: {e}")
    
    def get_summary(self) -> Dict[str, Any]:
        """Get current performance summary"""
        return {
            'status': self._get_health_status(),
            'metrics': self.current_metrics.to_dict(),
            'alerts': self._get_active_alerts()
        }
    
    def _get_health_status(self) -> str:
        """Determine overall system health"""
        if self.current_metrics.success_rate >= 95 and \
           self.current_metrics.avg_processing_speed >= 50:
            return "✅ EXCELLENT"
        elif self.current_metrics.success_rate >= 90:
            return "⚠️  GOOD"
        else:
            return "❌ CRITICAL"
    
    def _get_active_alerts(self) -> List[str]:
        """Get list of active alerts"""
        alerts = []
        
        error_rate = (self.current_metrics.errors_count / 
                     max(self.current_metrics.documents_processed, 1))
        
        if error_rate > self.alert_threshold['error_rate']:
            alerts.append(f"High error rate: {error_rate*100:.1f}%")
        
        if self.current_metrics.success_rate < self.alert_threshold['min_success_rate'] * 100:
            alerts.append(f"Low success rate: {self.current_metrics.success_rate:.1f}%")
        
        if (self.current_metrics.avg_processing_speed > 0 and 
            self.current_metrics.avg_processing_speed < self.alert_threshold['min_processing_speed']):
            alerts.append(f"Slow processing: {self.current_metrics.avg_processing_speed:.1f} docs/min")
        
        return alerts
    
    def print_summary(self):
        """Print a formatted summary of current metrics"""
        print("\n" + "="*60)
        print("║     NITS PRODUCTION MONITORING SUMMARY")
        print("="*60)
        print(f"\n🎯 System Health: {self._get_health_status()}")
        print(f"\n📊 Performance Metrics:")
        print(f"   Documents Processed: {self.current_metrics.documents_processed}")
        print(f"   Success Rate: {self.current_metrics.success_rate:.1f}%")
        print(f"   Processing Speed: {self.current_metrics.avg_processing_speed:.1f} docs/min")
        print(f"   Total Violations: {self.current_metrics.violations_found}")
        print(f"   Error Count: {self.current_metrics.errors_count}")
        print(f"   Total Time: {self.current_metrics.processing_time_seconds:.2f}s")
        
        alerts = self._get_active_alerts()
        if alerts:
            print(f"\n🚨 Active Alerts ({len(alerts)}):")
            for alert in alerts:
                print(f"   - {alert}")
        else:
            print(f"\n✅ No active alerts")
        
        print("\n" + "="*60 + "\n")


def example_usage():
    """Example usage of the production monitor"""
    monitor = ProductionMonitor()
    
    # Simulate processing some documents
    print("Simulating document processing...\n")
    
    for i in range(10):
        monitor.record_processing(
            document_name=f"document_{i}.txt",
            violations=3,
            processing_time=0.5,
            success=True
        )
        time.sleep(0.1)
    
    # Show summary
    monitor.print_summary()
    
    # Save metrics
    monitor.save_metrics()


if __name__ == "__main__":
    logger.info("🚀 NITS Production Monitor - Demo Mode")
    example_usage()
