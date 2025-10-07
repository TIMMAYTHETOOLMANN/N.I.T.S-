"""
SEC Form 4 XML Parser
Handles SEC EDGAR Ownership XML Technical Specification v1-v5
"""

import xml.etree.ElementTree as ET
from typing import Dict, List, Any
import requests
from datetime import datetime

class SECForm4Parser:
    """Parser for SEC Form 4 XML documents"""
    
    # SEC rate limit: 10 requests per second maximum
    RATE_LIMIT_DELAY = 0.11  # 110ms between requests
    
    # SEC requires User-Agent header with company name and email
    HEADERS = {
        "User-Agent": "NITS System admin@company.com",
        "Accept-Encoding": "gzip, deflate",
        "Host": "www.sec.gov"
    }
    
    def detect_format(self, url: str, content: bytes) -> str:
        """Detect if document is XML, PDF, or HTML"""
        
        # Check URL patterns
        if url.endswith('.xml') or 'ownership' in url.lower():
            return 'XML'
        
        # Check content signatures
        if content.startswith(b'<?xml') or b'<ownershipDocument>' in content[:1000]:
            return 'XML'
        elif content.startswith(b'%PDF'):
            return 'PDF'
        elif content.startswith(b'<HTML') or b'<!DOCTYPE html>' in content[:500]:
            return 'HTML'
        
        return 'UNKNOWN'
    
    def parse_form4_xml(self, xml_content: bytes) -> Dict[str, Any]:
        """
        Parse SEC Form 4 XML per EDGAR Ownership XML Technical Specification
        Supports schema versions v1 through v5
        """
        
        try:
            root = ET.fromstring(xml_content)
        except ET.ParseError as e:
            raise ValueError(f"Invalid XML content: {e}")
        
        # Extract namespace if present
        namespace = ''
        if '}' in root.tag:
            namespace = root.tag.split('}')[0] + '}'
        
        # Helper function for namespace-aware searches
        def find_text(element, path, default=''):
            """Find element and return text, handling namespaces"""
            try:
                found = element.find(f'.//{namespace}{path}')
                return found.text if found is not None else default
            except:
                return default
        
        # Parse document header
        schemaVersion = root.attrib.get('schemaVersion', 'unknown')
        
        # Extract issuer information
        issuer = {
            'cik': find_text(root, 'issuer/issuerCik'),
            'name': find_text(root, 'issuer/issuerName'),
            'trading_symbol': find_text(root, 'issuer/issuerTradingSymbol')
        }
        
        # Extract reporting owner information
        reporting_owners = []
        for owner_elem in root.findall(f'.//{namespace}reportingOwner'):
            owner = {
                'cik': find_text(owner_elem, 'reportingOwnerId/rptOwnerCik'),
                'name': find_text(owner_elem, 'reportingOwnerId/rptOwnerName'),
                'relationship': {
                    'is_director': find_text(owner_elem, 'reportingOwnerRelationship/isDirector') == '1',
                    'is_officer': find_text(owner_elem, 'reportingOwnerRelationship/isOfficer') == '1',
                    'is_ten_percent_owner': find_text(owner_elem, 'reportingOwnerRelationship/isTenPercentOwner') == '1',
                    'officer_title': find_text(owner_elem, 'reportingOwnerRelationship/officerTitle')
                }
            }
            reporting_owners.append(owner)
        
        # Extract non-derivative transactions
        transactions = []
        for trans_elem in root.findall(f'.//{namespace}nonDerivativeTransaction'):
            try:
                transaction = {
                    'type': 'non_derivative',
                    'security_title': find_text(trans_elem, 'securityTitle/value'),
                    'transaction_date': find_text(trans_elem, 'transactionDate/value'),
                    'transaction_code': find_text(trans_elem, 'transactionCoding/transactionCode'),
                    'transaction_form_type': find_text(trans_elem, 'transactionCoding/transactionFormType'),
                    'shares': find_text(trans_elem, 'transactionAmounts/transactionShares/value'),
                    'price_per_share': find_text(trans_elem, 'transactionAmounts/transactionPricePerShare/value'),
                    'acquired_disposed': find_text(trans_elem, 'transactionAmounts/transactionAcquiredDisposedCode/value'),
                    'shares_owned_following': find_text(trans_elem, 'postTransactionAmounts/sharesOwnedFollowingTransaction/value'),
                    'ownership_form': find_text(trans_elem, 'ownershipNature/directOrIndirectOwnership/value')
                }
                transactions.append(transaction)
            except Exception as e:
                print(f"Warning: Failed to parse transaction: {e}")
                continue
        
        # Extract derivative transactions
        for trans_elem in root.findall(f'.//{namespace}derivativeTransaction'):
            try:
                transaction = {
                    'type': 'derivative',
                    'security_title': find_text(trans_elem, 'securityTitle/value'),
                    'conversion_price': find_text(trans_elem, 'conversionOrExercisePrice/value'),
                    'transaction_date': find_text(trans_elem, 'transactionDate/value'),
                    'transaction_code': find_text(trans_elem, 'transactionCoding/transactionCode'),
                    'shares': find_text(trans_elem, 'transactionAmounts/transactionShares/value'),
                    'underlying_security_title': find_text(trans_elem, 'underlyingSecurity/underlyingSecurityTitle/value'),
                    'underlying_shares': find_text(trans_elem, 'underlyingSecurity/underlyingSecurityShares/value')
                }
                transactions.append(transaction)
            except Exception as e:
                print(f"Warning: Failed to parse derivative transaction: {e}")
                continue
        
        # Compile complete result
        result = {
            'document_type': 'SEC_FORM_4',
            'schema_version': schemaVersion,
            'parsed_at': datetime.utcnow().isoformat(),
            'issuer': issuer,
            'reporting_owners': reporting_owners,
            'transactions': transactions,
            'transaction_count': len(transactions)
        }
        
        return result
    
    def fetch_and_parse(self, url: str) -> Dict[str, Any]:
        """Fetch SEC document from URL and parse it"""
        
        import time
        time.sleep(self.RATE_LIMIT_DELAY)  # Respect rate limits
        
        response = requests.get(url, headers=self.HEADERS, timeout=30)
        response.raise_for_status()
        
        content = response.content
        format_type = self.detect_format(url, content)
        
        if format_type == 'XML':
            return self.parse_form4_xml(content)
        else:
            raise ValueError(f"Unsupported SEC document format: {format_type}")


# Quick test function
if __name__ == "__main__":
    parser = SECForm4Parser()
    
    # Test with sample XML
    test_xml = b'''<?xml version="1.0"?>
    <ownershipDocument>
        <issuer>
            <issuerCik>0001318605</issuerCik>
            <issuerName>TESLA INC</issuerName>
            <issuerTradingSymbol>TSLA</issuerTradingSymbol>
        </issuer>
        <reportingOwner>
            <reportingOwnerId>
                <rptOwnerCik>0001494730</rptOwnerCik>
                <rptOwnerName>MUSK ELON</rptOwnerName>
            </reportingOwnerId>
        </reportingOwner>
    </ownershipDocument>'''
    
    result = parser.parse_form4_xml(test_xml)
    print(f"Parsed issuer: {result['issuer']['name']}")
    print("✓ SEC Form 4 parser working")