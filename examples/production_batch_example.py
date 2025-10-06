#!/usr/bin/env python3
"""
NITS Production Batch Processing Example
Based on DEPLOYMENT_FIX_GUIDE.md - Production Deployment section

This example demonstrates:
1. Preloading dossier on startup (Performance Tip #1)
2. Using batch processing for multiple docs (Performance Tip #2)
3. Caching extracted text (Performance Tip #3)
4. Error handling and logging
5. Production monitoring integration
"""

import sys
import logging
from pathlib import Path
from typing import Dict, Any, List

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from critical_fixes import FixedNITSAnalyzer
    from production_monitor import ProductionMonitor
except ImportError:
    print("❌ Error: Required modules not found")
    print("   Make sure you're running from the repository root:")
    print("   python3 examples/production_batch_example.py")
    sys.exit(1)

# Configure logging as per DEPLOYMENT_FIX_GUIDE
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('nits_production_batch.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('NITS.ProductionBatch')


class ProductionBatchProcessor:
    """
    Production-ready batch processor implementing best practices
    from DEPLOYMENT_FIX_GUIDE.md
    """
    
    def __init__(self, dossier_path: str = "master_dossier.json"):
        """
        Initialize processor with preloaded dossier
        Performance Tip #1: Initialize once, reuse many times
        """
        logger.info("🚀 Initializing Production Batch Processor")
        
        # Initialize analyzer once (not per document)
        try:
            self.analyzer = FixedNITSAnalyzer(dossier_path)
            logger.info(f"✅ Analyzer initialized with {dossier_path}")
        except Exception as e:
            logger.error(f"❌ Failed to initialize analyzer: {e}")
            raise
        
        # Initialize monitoring
        self.monitor = ProductionMonitor()
        logger.info("✅ Production monitor initialized")
        
        # Performance Tip #3: Cache extracted text
        self.text_cache: Dict[str, str] = {}
        logger.info("✅ Text cache initialized")
    
    def get_text(self, filepath: Path) -> str:
        """
        Get text content with caching
        Performance Tip #3: Cache extracted text for reprocessing
        """
        filepath_str = str(filepath)
        
        if filepath_str not in self.text_cache:
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    self.text_cache[filepath_str] = f.read()
                logger.debug(f"📄 Loaded and cached: {filepath.name}")
            except Exception as e:
                logger.error(f"❌ Failed to read {filepath.name}: {e}")
                raise
        else:
            logger.debug(f"💾 Using cached text: {filepath.name}")
        
        return self.text_cache[filepath_str]
    
    def process_single_document(self, filepath: Path) -> Dict[str, Any]:
        """
        Process a single document with error handling and monitoring
        """
        import time
        start_time = time.time()
        success = False
        violations = 0
        
        try:
            logger.info(f"📄 Processing: {filepath.name}")
            
            # Get text (with caching)
            text = self.get_text(filepath)
            
            # Analyze document
            result = self.analyzer.analyze_sec_document(
                text=text,
                document_name=filepath.name
            )
            
            violations = result.total_violations
            success = True
            
            logger.info(
                f"✅ Completed: {filepath.name} | "
                f"Violations: {violations} | "
                f"Threat: {result.threat_score:.1f}"
            )
            
            return {
                'success': True,
                'filepath': str(filepath),
                'violations': violations,
                'threat_score': result.threat_score,
                'result': result
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to process {filepath.name}: {e}")
            return {
                'success': False,
                'filepath': str(filepath),
                'error': str(e)
            }
        
        finally:
            # Record processing in monitor
            processing_time = time.time() - start_time
            self.monitor.record_processing(
                document_name=filepath.name,
                violations=violations,
                processing_time=processing_time,
                success=success
            )
    
    def process_batch(self, documents_dir: Path) -> Dict[str, Any]:
        """
        Performance Tip #2: Use batch processing for multiple docs
        """
        logger.info("="*60)
        logger.info("🚀 Starting Batch Processing")
        logger.info("="*60)
        
        documents = list(documents_dir.glob('*.txt'))
        if not documents:
            logger.warning(f"⚠️  No .txt files found in {documents_dir}")
            return {
                'total_documents': 0,
                'successful': 0,
                'failed': 0,
                'results': []
            }
        
        logger.info(f"📁 Found {len(documents)} documents to process")
        
        results = []
        successful = 0
        failed = 0
        
        for doc in documents:
            result = self.process_single_document(doc)
            results.append(result)
            
            if result['success']:
                successful += 1
            else:
                failed += 1
        
        logger.info("="*60)
        logger.info("📊 Batch Processing Complete")
        logger.info("="*60)
        logger.info(f"✅ Successful: {successful}")
        logger.info(f"❌ Failed: {failed}")
        logger.info(f"📈 Success Rate: {(successful/len(documents)*100):.1f}%")
        
        return {
            'total_documents': len(documents),
            'successful': successful,
            'failed': failed,
            'results': results
        }
    
    def save_report(self, batch_results: Dict[str, Any], output_path: Path):
        """Save batch processing report"""
        try:
            import json
            with open(output_path, 'w') as f:
                json.dump(batch_results, f, indent=2, default=str)
            logger.info(f"💾 Report saved to {output_path}")
        except Exception as e:
            logger.error(f"❌ Failed to save report: {e}")


def alert_handler(message: str):
    """
    Example alert handler integration
    In production: integrate with Slack, email, PagerDuty, etc.
    """
    logger.error(f"🚨 ALERT: {message}")
    # TODO: Integrate with your alerting system
    # send_slack_alert(message)
    # send_email_alert(message)


def main():
    """Main execution with error handling"""
    try:
        # Initialize processor with preloaded dossier
        processor = ProductionBatchProcessor("master_dossier.json")
        
        # Create sample documents directory if needed
        sample_dir = Path("sample_docs")
        if not sample_dir.exists():
            sample_dir.mkdir()
            logger.info(f"📁 Created {sample_dir}")
        
        # Check for documents
        if not any(sample_dir.glob('*.txt')):
            logger.warning(f"⚠️  No test documents found in {sample_dir}")
            logger.info("ℹ️  Creating sample document for demonstration...")
            
            # Create a sample document
            sample_doc = sample_dir / "sample_financial_report.txt"
            with open(sample_doc, 'w') as f:
                f.write("""
Financial Report - Q4 2024

Executive Summary:
The company has identified potential compliance issues in our financial reporting.
We have discovered material accounting errors that were not disclosed.
Safety violations were reported but not documented properly.
Risk management procedures were inadequate.

The company has implemented corrective measures to address these issues.
                """.strip())
            logger.info(f"✅ Created sample document: {sample_doc.name}")
        
        # Process batch
        results = processor.process_batch(sample_dir)
        
        # Save report
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)
        report_path = output_dir / "batch_processing_report.json"
        processor.save_report(results, report_path)
        
        # Show monitoring summary
        processor.monitor.print_summary()
        processor.monitor.save_metrics()
        
        logger.info("🎉 Batch processing completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Batch processing failed: {e}")
        alert_handler(f"Batch processing failed: {e}")
        raise


if __name__ == "__main__":
    logger.info("🚀 NITS Production Batch Processor")
    main()
