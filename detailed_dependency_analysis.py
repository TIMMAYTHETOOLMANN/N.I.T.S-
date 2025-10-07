#!/usr/bin/env python3
"""
Detailed Dependency Analysis and Optimization Recommendations
Provides specific recommendations for reducing package-lock.json bloat
"""

import json
from collections import defaultdict, Counter

def analyze_jest_ecosystem(packages):
    """Analyze Jest-related packages and their contribution to bloat"""
    jest_packages = []
    jest_keywords = ['jest', 'babel', '@babel', 'test', 'coverage', 'transform', 'runner']
    
    for path, pkg_info in packages.items():
        pkg_name = path.split('/')[-1] if '/' in path else path.replace('node_modules/', '')
        
        if any(keyword in pkg_name.lower() for keyword in jest_keywords):
            jest_packages.append({
                'name': pkg_name,
                'path': path,
                'version': pkg_info.get('version', 'unknown'),
                'dev': pkg_info.get('dev', False),
                'size_indicator': len(str(pkg_info))
            })
    
    return sorted(jest_packages, key=lambda x: x['size_indicator'], reverse=True)

def identify_heavy_dependencies(packages):
    """Identify dependencies that contribute most to bloat"""
    heavy_deps = []
    
    # Group by top-level dependency
    dependency_groups = defaultdict(list)
    
    for path, pkg_info in packages.items():
        if path == "":  # Skip root
            continue
            
        # Extract top-level dependency
        path_parts = path.replace('node_modules/', '').split('/node_modules/')
        top_level = path_parts[0]
        
        dependency_groups[top_level].append({
            'path': path,
            'size_indicator': len(str(pkg_info))
        })
    
    # Calculate total size per top-level dependency
    for dep, packages_list in dependency_groups.items():
        total_size = sum(p['size_indicator'] for p in packages_list)
        package_count = len(packages_list)
        
        heavy_deps.append({
            'dependency': dep,
            'package_count': package_count,
            'total_size_indicator': total_size,
            'avg_size': total_size / package_count if package_count > 0 else 0
        })
    
    return sorted(heavy_deps, key=lambda x: x['total_size_indicator'], reverse=True)

def suggest_alternatives():
    """Suggest lighter alternatives for heavy dependencies"""
    alternatives = {
        'xlsx': {
            'issue': 'High-security vulnerability, very heavy',
            'alternatives': ['csv-parser', 'papaparse', 'node-xlsx (lighter)', 'exceljs'],
            'recommendation': 'Consider csv-parser for CSV files or exceljs for xlsx with better security'
        },
        'jest': {
            'issue': 'Very heavy testing framework',
            'alternatives': ['vitest', 'uvu', 'ava', 'mocha + chai'],
            'recommendation': 'Consider vitest for faster, lighter testing'
        },
        'd3': {
            'issue': 'Large visualization library',
            'alternatives': ['chart.js', 'plotly.js', 'recharts', 'd3-selection (modular)'],
            'recommendation': 'Use modular d3 packages or lighter charting library'
        },
        'cheerio': {
            'issue': 'Heavy HTML parser',
            'alternatives': ['jsdom', 'parse5', 'node-html-parser'],
            'recommendation': 'node-html-parser is much lighter for basic parsing'
        }
    }
    return alternatives

def generate_optimized_package_json(original_deps, original_dev_deps):
    """Generate optimized package.json recommendations"""
    optimized = {
        'dependencies': {},
        'devDependencies': {}
    }
    
    # Optimize main dependencies
    dep_optimizations = {
        'dotenv': '^16.4.5',  # Use stable 16.x instead of 17.x
        'xlsx': '^0.18.5',    # Keep but flag for replacement
        'cheerio': '^1.0.0',  # Use 1.x stable
        'd3': '^7.8.5',       # Use stable 7.x
        'jest': '^29.7.0',    # Use stable 29.x instead of 30.x
        'axios': '^1.6.8',    # Recent stable
        'express': '^4.18.2', # Keep current
        'openai': '^4.52.7',  # Use stable 4.x instead of 6.x
        'neo4j-driver': '^5.17.0', # Use stable 5.x
        'ejs': '^3.1.9',
        'form-data': '^4.0.0',
        'limiter': '^2.1.0',
        'multer': '^1.4.5-lts.1',
        'pdf-parse': '^1.1.1'
    }
    
    dev_dep_optimizations = {
        '@types/express': '^4.17.21',
        '@types/multer': '^1.4.11',
        'typescript': '^5.3.3',  # Stable 5.x
        'ts-node': '^10.9.2',
        'tsx': '^4.7.1',
        'jest': '^29.7.0'  # Move to stable
    }
    
    return dep_optimizations, dev_dep_optimizations

def main():
    # Load package-lock.json
    try:
        with open('package-lock.json', 'r', encoding='utf-8') as f:
            package_lock = json.load(f)
    except Exception as e:
        print(f"Error loading package-lock.json: {e}")
        return
    
    packages = package_lock.get('packages', {})
    root_package = packages.get('', {})
    
    print("=" * 70)
    print("DETAILED DEPENDENCY ANALYSIS & OPTIMIZATION RECOMMENDATIONS")
    print("=" * 70)
    
    # Analyze Jest ecosystem
    jest_packages = analyze_jest_ecosystem(packages)
    print(f"\nJEST ECOSYSTEM ANALYSIS:")
    print(f"Jest-related packages: {len(jest_packages)}")
    print("Top 10 heaviest Jest/Test packages:")
    for pkg in jest_packages[:10]:
        status = "DEV" if pkg['dev'] else "PROD"
        print(f"  {pkg['name']} v{pkg['version']} ({status}) - Size: {pkg['size_indicator']}")
    
    # Heavy dependency analysis
    heavy_deps = identify_heavy_dependencies(packages)
    print(f"\nHEAVIEST DEPENDENCY TREES:")
    print("Top 10 dependencies by total size:")
    for dep in heavy_deps[:10]:
        print(f"  {dep['dependency']}: {dep['package_count']} packages, "
              f"total size: {dep['total_size_indicator']}")
    
    # Alternative suggestions
    alternatives = suggest_alternatives()
    print(f"\nRECOMMENDED ALTERNATIVES:")
    for pkg, info in alternatives.items():
        print(f"\n{pkg.upper()}:")
        print(f"  Issue: {info['issue']}")
        print(f"  Alternatives: {', '.join(info['alternatives'])}")
        print(f"  Recommendation: {info['recommendation']}")
    
    # Generate optimized package.json
    original_deps = root_package.get('dependencies', {})
    original_dev_deps = root_package.get('devDependencies', {})
    
    opt_deps, opt_dev_deps = generate_optimized_package_json(original_deps, original_dev_deps)
    
    print(f"\nOPTIMIZED PACKAGE.JSON RECOMMENDATIONS:")
    print("Dependencies to update:")
    for pkg, version in opt_deps.items():
        if pkg in original_deps:
            old_version = original_deps[pkg]
            if old_version != version:
                print(f"  {pkg}: {old_version} -> {version}")
    
    print("\nDevDependencies to update:")
    for pkg, version in opt_dev_deps.items():
        if pkg in original_dev_deps:
            old_version = original_dev_deps[pkg]
            if old_version != version:
                print(f"  {pkg}: {old_version} -> {version}")
    
    # Cleanup recommendations
    print(f"\nCLEANUP RECOMMENDATIONS:")
    print("1. IMMEDIATE ACTIONS:")
    print("   - Replace wildcard versions (*) with specific ranges")
    print("   - Downgrade jest from v30.x to stable v29.x")
    print("   - Consider replacing xlsx due to security vulnerability")
    print("   - Use stable versions instead of latest/beta")
    
    print("\n2. EXPECTED IMPACT:")
    current_packages = len(packages) - 1  # Exclude root
    estimated_reduction = current_packages * 0.6  # Estimate 60% reduction
    print(f"   - Current packages: {current_packages}")
    print(f"   - Estimated after cleanup: {int(estimated_reduction)}")
    print(f"   - Potential reduction: ~{int(current_packages - estimated_reduction)} packages")
    
    print("\n3. CLEANUP STEPS:")
    print("   a) Backup current state: cp package.json package.json.backup")
    print("   b) Update package.json with specific versions")
    print("   c) Delete node_modules and package-lock.json")
    print("   d) Run: npm install")
    print("   e) Verify functionality with: npm test")
    print("   f) Check new lock file size")

if __name__ == "__main__":
    main()