#!/usr/bin/env python3
"""
Package Lock Audit Tool
Analyzes package-lock.json for dependency bloat, duplicates, and optimization opportunities
"""

import json
import sys
from collections import defaultdict, Counter
from pathlib import Path

def load_package_lock():
    """Load and parse package-lock.json"""
    try:
        with open('package-lock.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading package-lock.json: {e}")
        return None

def analyze_dependencies(package_lock):
    """Analyze dependency structure for bloat and issues"""
    if not package_lock:
        return None
    
    packages = package_lock.get('packages', {})
    
    # Remove root package entry for analysis
    root_key = ""
    if root_key in packages:
        root_package = packages[root_key]
        packages = {k: v for k, v in packages.items() if k != root_key}
    
    total_packages = len(packages)
    
    # Analyze package names and versions
    package_names = defaultdict(list)
    dev_packages = []
    prod_packages = []
    large_packages = []
    
    for path, pkg_info in packages.items():
        # Extract package name from path
        pkg_name = path.split('/')[-1] if '/' in path else path.replace('node_modules/', '')
        
        version = pkg_info.get('version', 'unknown')
        package_names[pkg_name].append({
            'path': path,
            'version': version,
            'dev': pkg_info.get('dev', False),
            'size_indicator': len(str(pkg_info))  # Rough size indicator
        })
        
        if pkg_info.get('dev', False):
            dev_packages.append(pkg_name)
        else:
            prod_packages.append(pkg_name)
            
        # Flag potentially large packages based on JSON size
        if len(str(pkg_info)) > 500:
            large_packages.append({
                'name': pkg_name,
                'path': path,
                'size_indicator': len(str(pkg_info))
            })
    
    return {
        'total_packages': total_packages,
        'package_names': package_names,
        'dev_count': len(dev_packages),
        'prod_count': len(prod_packages),
        'large_packages': sorted(large_packages, key=lambda x: x['size_indicator'], reverse=True),
        'root_package': root_package if 'root_package' in locals() else None
    }

def find_duplicates(package_names):
    """Find packages with multiple versions"""
    duplicates = {}
    
    for name, versions in package_names.items():
        if len(versions) > 1:
            unique_versions = set(v['version'] for v in versions)
            if len(unique_versions) > 1:
                duplicates[name] = {
                    'versions': list(unique_versions),
                    'count': len(versions),
                    'paths': [v['path'] for v in versions]
                }
    
    return duplicates

def check_suspicious_packages(package_names):
    """Check for suspicious or potentially problematic packages"""
    suspicious = []
    
    for name, versions in package_names.items():
        for version_info in versions:
            version = version_info['version']
            
            # Check for unusually high version numbers
            if version != 'unknown':
                try:
                    major = int(version.split('.')[0])
                    if major > 20:  # Suspiciously high major version
                        suspicious.append({
                            'name': name,
                            'version': version,
                            'issue': 'Unusually high major version',
                            'path': version_info['path']
                        })
                except:
                    pass
            
            # Check for common bloat packages
            bloat_indicators = ['babel', 'webpack', 'eslint', 'postcss']
            if any(indicator in name.lower() for indicator in bloat_indicators):
                if not version_info['dev']:
                    suspicious.append({
                        'name': name,
                        'version': version,
                        'issue': 'Dev tool in production dependencies',
                        'path': version_info['path']
                    })
    
    return suspicious

def generate_report(analysis):
    """Generate comprehensive audit report"""
    print("=" * 60)
    print("PACKAGE LOCK AUDIT REPORT")
    print("=" * 60)
    
    if not analysis:
        print("ERROR: Could not analyze package-lock.json")
        return
    
    print(f"Total packages in lock file: {analysis['total_packages']}")
    print(f"Production packages: {analysis['prod_count']}")
    print(f"Development packages: {analysis['dev_count']}")
    
    # Show declared vs actual
    root = analysis.get('root_package', {})
    declared_deps = len(root.get('dependencies', {}))
    declared_dev_deps = len(root.get('devDependencies', {}))
    
    print(f"\nDECLARED vs ACTUAL:")
    print(f"Declared dependencies: {declared_deps}")
    print(f"Declared dev dependencies: {declared_dev_deps}")
    print(f"Total declared: {declared_deps + declared_dev_deps}")
    print(f"Actual packages in lock file: {analysis['total_packages']}")
    print(f"Bloat factor: {analysis['total_packages'] / max(declared_deps + declared_dev_deps, 1):.1f}x")
    
    # Find duplicates
    duplicates = find_duplicates(analysis['package_names'])
    if duplicates:
        print(f"\nDUPLICATE PACKAGES ({len(duplicates)} packages with multiple versions):")
        for name, info in sorted(duplicates.items())[:10]:  # Show top 10
            print(f"  {name}: {info['versions']} ({info['count']} instances)")
    
    # Show large packages
    if analysis['large_packages']:
        print(f"\nLARGE PACKAGES (top 10 by metadata size):")
        for pkg in analysis['large_packages'][:10]:
            print(f"  {pkg['name']} - Size indicator: {pkg['size_indicator']}")
    
    # Check suspicious packages
    suspicious = check_suspicious_packages(analysis['package_names'])
    if suspicious:
        print(f"\nSUSPICIOUS PACKAGES ({len(suspicious)} issues found):")
        for issue in suspicious[:10]:  # Show top 10
            print(f"  {issue['name']} v{issue['version']}: {issue['issue']}")
    
    # Recommendations
    print(f"\nRECOMMENDations:")
    print("1. Consider running 'npm audit' to check for security vulnerabilities")
    print("2. Review duplicate packages for version conflicts")
    print("3. Consider using 'npm ls --depth=0' to see direct dependencies")
    print("4. Use 'npm prune' to remove extraneous packages")
    
    if duplicates:
        print("5. Consider using 'npm dedupe' to reduce duplicate packages")
    
    if analysis['total_packages'] > (declared_deps + declared_dev_deps) * 10:
        print("6. CRITICAL: Lock file is unusually large - consider regenerating")
        print("   - Delete node_modules and package-lock.json")
        print("   - Run 'npm install' to regenerate clean lock file")

if __name__ == "__main__":
    print("Starting package lock audit...")
    package_lock = load_package_lock()
    analysis = analyze_dependencies(package_lock)
    generate_report(analysis)