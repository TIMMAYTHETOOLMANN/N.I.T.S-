#!/usr/bin/env python3
"""
Quick test script to verify all deployment fixes are working
"""

import sys
from pathlib import Path

def test_critical_fixes():
    """Test critical_fixes.py can be imported and run"""
    print("Testing critical_fixes.py...")
    try:
        import critical_fixes
        print("✅ critical_fixes.py imports successfully")
        
        # Test sample dossier creation
        if Path("master_dossier.json").exists():
            Path("master_dossier.json").unlink()
        
        critical_fixes.create_sample_dossier()
        print("✅ Sample dossier created")
        
        # Test analyzer initialization
        analyzer = critical_fixes.FixedNITSAnalyzer("master_dossier.json")
        print("✅ Analyzer initialized")
        
        # Test analysis
        test_text = "This document contains fraud and misleading statements."
        result = analyzer.analyze_sec_document(test_text, "test.txt")
        print(f"✅ Analysis complete: {result.total_violations} violations found")
        
        return True
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_diagnostics():
    """Test diagnostics.py can be imported"""
    print("\nTesting diagnostics.py...")
    try:
        import diagnostics
        print("✅ diagnostics.py imports successfully")
        return True
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing NITS Deployment Fixes\n")
    print("=" * 60)
    
    results = []
    
    results.append(("critical_fixes.py", test_critical_fixes()))
    results.append(("diagnostics.py", test_diagnostics()))
    
    print("\n" + "=" * 60)
    print("SUMMARY:")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! System is ready.")
        return 0
    else:
        print("\n⚠️  Some tests failed. Please review errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
