// File: deploy/pipeline.ts
import { GovInfoTerminator } from '../core/govinfo/GovInfoTerminator';
import { TerminatorAnalysisEngine } from '../core/analysis/TerminatorAnalysisEngine';

async function main() {
  console.log('🔴 NITS-CORE: Launching Legal Engine');

  const terminator = new GovInfoTerminator();
  await terminator.harvestEntireLegalSystem();

  const engine = new TerminatorAnalysisEngine();
  (global as any).nitsEngine = engine;

  console.log('🚀 Core Legal Engine ready. Accepting document input.');
}

main().catch(err => {
  console.error('Fatal startup failure:', err);
  process.exit(1);
});
