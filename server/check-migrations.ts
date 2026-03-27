#!/usr/bin/env tsx
/**
 * Migration History Checker
 * Usage: npm run check-migrations
 */

import { printHistory, verifyMigrationCompatibility } from "./migrations";

async function main() {
  console.log("🔍 Checking migration history...\n");

  // Print migration history
  printHistory();

  // Verify compatibility
  const { compatible, warnings } = verifyMigrationCompatibility();

  if (warnings.length > 0) {
    console.log("⚠️  WARNINGS:\n");
    warnings.forEach((warning) => {
      console.log(`  • ${warning}`);
    });
    console.log("");
  }

  if (compatible) {
    console.log("✅ All migrations are compatible and in correct order");
  } else {
    console.log("   Migration compatibility issues detected");
    console.log("   Please review your migration history");
    process.exit(1);
  }
}

main();
