# NITS Production Examples

This directory contains production-ready examples demonstrating best practices from **DEPLOYMENT_FIX_GUIDE.md**.

## Examples

### production_batch_example.py

A comprehensive batch processing example demonstrating:

- **Performance Tip #1:** Preloading dossier on startup
- **Performance Tip #2:** Using batch processing for multiple documents
- **Performance Tip #3:** Caching extracted text
- **Error Handling:** Try-catch blocks and logging
- **Production Monitoring:** Integration with monitoring system

#### Usage

```bash
# Run from repository root
python3 examples/production_batch_example.py
```

#### Features

- ✅ Preloaded analyzer (initialize once)
- ✅ Text caching for performance
- ✅ Comprehensive error handling
- ✅ Production logging to file and console
- ✅ Real-time monitoring integration
- ✅ Batch processing with statistics
- ✅ JSON report generation

#### Output

The example creates:
- `nits_production_batch.log` - Detailed processing logs
- `output/batch_processing_report.json` - Batch results
- `production_metrics.json` - Performance metrics

### Expected Results

When running successfully:
- All documents processed
- Success rate: 100%
- Processing speed: >100 docs/min
- No errors in logs
- Monitoring summary displayed

## Integration Examples

### Single Document Processing

```python
from critical_fixes import FixedNITSAnalyzer

# Initialize once
analyzer = FixedNITSAnalyzer('master_dossier.json')

# Analyze document
result = analyzer.analyze_sec_document(
    text="Document content here",
    document_name="document.txt"
)

print(f"Violations: {len(result['violations'])}")
```

### Batch Processing with Monitoring

```python
from production_monitor import ProductionMonitor

monitor = ProductionMonitor()

# Process documents
for doc in documents:
    result = process_document(doc)
    monitor.record_processing(
        document_name=doc.name,
        violations=len(result['violations']),
        processing_time=result['processing_time'],
        success=result['success']
    )

# View results
monitor.print_summary()
```

### Custom Alert Integration

```python
def send_alert(message: str):
    """Customize for your alerting system"""
    # Slack example
    # slack_webhook.post({'text': message})
    
    # Email example
    # smtp.send_email(to='alerts@company.com', subject='NITS Alert', body=message)
    
    # PagerDuty example
    # pagerduty.trigger_incident(message)
    
    print(f"ALERT: {message}")
```

## Performance Tips

From DEPLOYMENT_FIX_GUIDE.md:

1. **Preload Dossier:** Initialize analyzer once, reuse many times
2. **Batch Processing:** Much faster than individual processing
3. **Cache Text:** Cache extracted text for reprocessing
4. **Monitor Performance:** Track metrics and alert on issues

## Troubleshooting

### Issue: Import errors

```bash
# Make sure you're in repository root
cd /path/to/N.I.T.S-
python3 examples/production_batch_example.py
```

### Issue: No documents found

The example will create a sample document automatically if none exist.

### Issue: Dossier not found

Create a sample dossier:

```bash
python3 -c "
from critical_fixes import FixedNITSAnalyzer
import json
dossier = [
    {'category': 'test', 'keywords': ['test'], 'regulation': 'TEST-001', 'severity': 50}
]
with open('master_dossier.json', 'w') as f:
    json.dump(dossier, f)
"
```

## Best Practices

- ✅ Initialize analyzer once per application lifecycle
- ✅ Use batch processing for multiple documents
- ✅ Cache text when reprocessing same documents
- ✅ Monitor performance metrics continuously
- ✅ Configure alerts for production issues
- ✅ Log all processing events
- ✅ Save metrics for analysis

## See Also

- [PRODUCTION_QUICKSTART.md](../PRODUCTION_QUICKSTART.md) - Quick start guide
- [DEPLOYMENT_FIX_GUIDE.md](../DEPLOYMENT_FIX_GUIDE.md) - Detailed fixes
- [production_monitor.py](../production_monitor.py) - Monitoring module
- [critical_fixes.py](../critical_fixes.py) - Core fixes
