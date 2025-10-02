// File: deploy/pipeline.ts
import { GovInfoTerminator } from '../core/govinfo/GovInfoTerminator';
import { TerminatorAnalysisEngine } from '../core/analysis/TerminatorAnalysisEngine';
import { ProsecutionPackage } from '../core/evidence/ProsecutionPackage';

async function main() {
  console.log('🔴 NITS-CORE: Launching Legal Engine');
  console.log('════════════════════════════════════════════');
  console.log('║   NITS TERMINATOR SYSTEM v3.0 - CORE    ║');
  console.log('║   OBJECTIVE: TOTAL VIOLATION EXPOSURE   ║');
  console.log('║   MODE: ZERO TOLERANCE                  ║');
  console.log('════════════════════════════════════════════');
  console.log('');

  // Initialize the legal system harvester
  const terminator = new GovInfoTerminator();
  await terminator.harvestEntireLegalSystem();

  // Initialize the analysis engine
  const engine = new TerminatorAnalysisEngine();
  await engine.initialize();
  (global as any).nitsEngine = engine;

  console.log('');
  console.log('✅ Legal engine initialized');
  console.log(`⚖️ CFR Titles harvested: ${terminator.legalProvisions.size} provisions indexed`);
  console.log('🧠 Violations cross-referenced: Multi-level analysis ready');
  console.log('');

  // Demonstrate with sample analysis
  console.log('🧪 Running demonstration analysis...');
  const sampleDocument = `
    This financial report shows revenue of $50,000,000 with profit of $30,000,000.
    The company engaged in transactions that may constitute fraud and misleading statements.
    Material disclosure regarding insider trading activities was omitted from the filing.
    Non-compliance with SEC regulations was noted during the review period.
  `;

  const violations = await engine.terminateDocument(sampleDocument);
  const prosecutionPkg = ProsecutionPackage.generate(violations);
  const penalties = ProsecutionPackage.calculateMaximumPenalties(violations);
  const recommendation = ProsecutionPackage.generateRecommendation(violations);

  console.log('');
  console.log('💣 Termination report generated');
  console.log('═══════════════════════════════════════');
  console.log(`📊 Total violations detected: ${violations.length}`);
  console.log(`🔴 Criminal violations: ${prosecutionPkg.secFormTCR.criminalCount}`);
  console.log(`⚠️  Civil violations: ${prosecutionPkg.secFormTCR.civilCount}`);
  console.log(`💰 Total penalties: $${penalties.monetary.toLocaleString()}`);
  console.log(`⛓️  Prison time: ${penalties.imprisonment} years`);
  console.log(`⚖️  Strategy: ${prosecutionPkg.prosecutionStrategy}`);
  console.log(`📋 Recommendation: ${recommendation}`);
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('🚀 Core Legal Engine ready. Accepting document input.');
}

main().catch(err => {
  console.error('Fatal startup failure:', err);
  process.exit(1);
});
