#!/bin/bash
# Comprehensive NITS System Validation Script
# Based on DEPLOYMENT_COMPLETE.txt requirements

echo "════════════════════════════════════════════════════════════"
echo "║        NITS COMPREHENSIVE SYSTEM VALIDATION              ║"
echo "║        Version 4.0 - Complete Integration Testing       ║"
echo "════════════════════════════════════════════════════════════"
echo ""

# Initialize counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo "🧪 Testing: $test_name"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command" > /tmp/test_output_$$.txt 2>&1; then
        echo "   ✅ PASSED"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo "   ❌ FAILED"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "   Error details:"
        tail -5 /tmp/test_output_$$.txt | sed 's/^/      /'
        return 1
    fi
    rm -f /tmp/test_output_$$.txt
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 1: Python System Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

run_test "Python Diagnostics" "python3 diagnostics.py"
run_test "Python Deployment Fixes" "python3 test_deployment_fixes.py"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 2: TypeScript Core Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

run_test "PDF Binary Fix" "npx tsx test_pdf_binary_fix.ts"
run_test "PDF Current Implementation" "npx tsx test_pdf_current.ts"
run_test "PDF Fallback Implementation" "npx tsx test_pdf_fallback.ts"
run_test "Integration Verification" "npx tsx test_integration_verification.ts"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 3: Enhanced Feature Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

run_test "Precision Patch" "npx tsx deploy/test_precision_patch.ts"
run_test "AI Investigator" "npx tsx test_ai_investigator.ts"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 4: Integration Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

run_test "Complete Integration Patch" "npx tsx deploy/complete_integration_patch.ts"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 5: File Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🧪 Checking critical files..."
TOTAL_TESTS=$((TOTAL_TESTS + 1))

REQUIRED_FILES=(
    "critical_fixes.py"
    "diagnostics.py"
    "test_deployment_fixes.py"
    "core/ingestion/FixedDocumentIngestion.ts"
    "core/analysis/AIInvestigator.ts"
    "core/analysis/TerminatorAnalysisEngine.ts"
    "core/analysis/Violation.ts"
    "deploy/complete_integration_patch.ts"
    "deploy/enhancement_precision_patch.ts"
    "deploy/ultimate_nits_integration.ts"
)

ALL_FILES_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "   ❌ Missing: $file"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = true ]; then
    echo "   ✅ PASSED - All required files present"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "   ❌ FAILED - Some files missing"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 6: Output Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🧪 Checking output directory..."
TOTAL_TESTS=$((TOTAL_TESTS + 1))

if [ -d "output" ] && [ -f "output/analysis_report.md" ]; then
    echo "   ✅ PASSED - Output directory and reports exist"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "   ❌ FAILED - Output directory or reports missing"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "║                   VALIDATION SUMMARY                     ║"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Total Tests:   $TOTAL_TESTS"
echo "✅ Passed:     $PASSED_TESTS"
echo "❌ Failed:     $FAILED_TESTS"
echo ""

# Calculate percentage
PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo "Success Rate: $PERCENTAGE%"
echo ""

if [ $PERCENTAGE -ge 90 ]; then
    echo "🎉 Status: ✅ EXCELLENT (90%+) - Production Ready"
    exit 0
elif [ $PERCENTAGE -ge 75 ]; then
    echo "⚠️  Status: GOOD (75-89%) - Deploy with monitoring"
    exit 0
else
    echo "❌ Status: CRITICAL (<75%) - Fix failing tests first"
    exit 1
fi
