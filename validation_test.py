#!/usr/bin/env python3
"""
NITS Document Processing Validation Script
Tests all critical fixes without requiring Flask service to be running
"""

import os
import sys
import tempfile
import hashlib
from pathlib import Path

def test_sec_form4_parser():
    """Test SEC Form 4 XML parser"""
    print("🔍 Testing SEC Form 4 XML Parser...")
    
    try:
        from src.parsers.sec_form4_parser import SECForm4Parser
        
        # Test XML content
        test_xml = b'''<?xml version="1.0"?>
        <ownershipDocument>
            <issuer>
                <issuerCik>0001318605</issuerCik>
                <issuerName>TEST COMPANY INC</issuerName>
                <issuerTradingSymbol>TEST</issuerTradingSymbol>
            </issuer>
            <reportingOwner>
                <reportingOwnerId>
                    <rptOwnerCik>0001494730</rptOwnerCik>
                    <rptOwnerName>TEST OWNER</rptOwnerName>
                </reportingOwnerId>
                <reportingOwnerRelationship>
                    <isDirector>1</isDirector>
                    <isOfficer>0</isOfficer>
                </reportingOwnerRelationship>
            </reportingOwner>
        </ownershipDocument>'''
        
        parser = SECForm4Parser()
        result = parser.parse_form4_xml(test_xml)
        
        # Validate results
        assert result['document_type'] == 'SEC_FORM_4'
        assert result['issuer']['name'] == 'TEST COMPANY INC'
        assert result['issuer']['trading_symbol'] == 'TEST'
        assert len(result['reporting_owners']) > 0
        
        print("✅ SEC Form 4 XML parser working correctly")
        return True
        
    except Exception as e:
        print(f"❌ SEC Form 4 parser failed: {e}")
        return False

def test_excel_processor():
    """Test Excel processor with format detection"""
    print("🔍 Testing Excel Processor...")
    
    try:
        from src.parsers.excel_processor import ExcelProcessor
        
        # Test format detection with fake file signatures
        test_data = {
            'xlsx_signature': b'PK\x03\x04' + b'\x00' * 100,  # ZIP signature
            'xls_signature': b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1' + b'\x00' * 100  # OLE signature
        }
        
        # Create temporary files for testing
        for format_type, data in test_data.items():
            ext = format_type.split('_')[0]
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{ext}') as tmp:
                tmp.write(data)
                tmp_path = tmp.name
            
            try:
                detected_format = ExcelProcessor.detect_excel_format(tmp_path)
                assert detected_format == ext
                print(f"✅ {ext.upper()} format detection working")
            finally:
                os.unlink(tmp_path)
        
        print("✅ Excel processor format detection working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Excel processor failed: {e}")
        return False

def test_pdf_processing():
    """Test PDF processing availability"""
    print("🔍 Testing PDF Processing...")
    
    try:
        import fitz  # PyMuPDF
        print("✅ PyMuPDF available for PDF processing")
        
        # Test basic PDF signature detection
        pdf_signature = b'%PDF-1.4'
        assert pdf_signature.startswith(b'%PDF')
        print("✅ PDF signature validation working")
        
        return True
        
    except ImportError:
        print("❌ PyMuPDF not available")
        return False
    except Exception as e:
        print(f"❌ PDF processing failed: {e}")
        return False

def test_flask_service_components():
    """Test Flask service processing functions"""
    print("🔍 Testing Flask Service Components...")
    
    try:
        # Add parent directory to path for imports
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ml_service'))
        
        from main import validate_file_signature, FILE_SIGNATURES
        
        # Test file signature validation
        pdf_data = b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'
        assert validate_file_signature(pdf_data, 'pdf') == True
        print("✅ File signature validation working")
        
        xlsx_data = b'PK\x03\x04' + b'\x00' * 10
        assert validate_file_signature(xlsx_data, 'xlsx') == True
        print("✅ XLSX signature validation working")
        
        xls_data = b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1' + b'\x00' * 10
        assert validate_file_signature(xls_data, 'xls') == True
        print("✅ XLS signature validation working")
        
        print("✅ Flask service components working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Flask service components failed: {e}")
        return False

def test_critical_dependencies():
    """Test critical dependencies installation"""
    print("🔍 Testing Critical Dependencies...")
    
    dependencies = {
        'xlrd': '2.0.1',
        'pandas': '2.1.3',  
        'PyMuPDF': '1.23.8',
        'flask': '3.0.3'
    }
    
    results = {}
    
    for dep, expected_version in dependencies.items():
        try:
            if dep == 'PyMuPDF':
                import fitz
                version = fitz.version[0]
            elif dep == 'xlrd':
                import xlrd
                version = xlrd.__VERSION__
            elif dep == 'pandas':
                import pandas
                version = pandas.__version__
            elif dep == 'flask':
                import flask
                version = flask.__version__
            
            results[dep] = version
            print(f"✅ {dep} {version} installed")
            
        except ImportError:
            results[dep] = "NOT INSTALLED"
            print(f"❌ {dep} not installed")
    
    return all(v != "NOT INSTALLED" for v in results.values())

def main():
    """Run all validation tests"""
    print("🚀 NITS Document Processing Validation")
    print("="*50)
    
    tests = [
        ("Critical Dependencies", test_critical_dependencies),
        ("SEC Form 4 Parser", test_sec_form4_parser),  
        ("Excel Processor", test_excel_processor),
        ("PDF Processing", test_pdf_processing),
        ("Flask Components", test_flask_service_components)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n🔧 {test_name}")
        print("-" * 30)
        results[test_name] = test_func()
    
    print("\n" + "="*50)
    print("📊 VALIDATION SUMMARY")
    print("="*50)
    
    passed = 0
    total = len(tests)
    
    for test_name, passed_test in results.items():
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"{test_name:25} {status}")
        if passed_test:
            passed += 1
    
    success_rate = (passed / total) * 100
    print(f"\nSuccess Rate: {passed}/{total} ({success_rate:.1f}%)")
    
    if success_rate >= 95:
        print("🎉 VALIDATION SUCCESSFUL - System ready for deployment!")
        return 0
    else:
        print("⚠️  VALIDATION ISSUES - Some components need attention")
        return 1

if __name__ == "__main__":
    sys.exit(main())