#!/usr/bin/env tsx
/**
 * Database Restoration Script
 * Usage: npm run restore-backup -- <timestamp>
 * Example: npm run restore-backup -- 2024-01-20-10-00-00
 */

import { restoreBackup, listBackups } from "./backup";

async function main() {
  const timestamp = process.argv[2];

  if (!timestamp) {
    console.log("❌ Usage: npm run restore-backup -- <timestamp>\n");

    console.log("📋 Available backups:\n");
    const backups = listBackups();

    if (backups.length === 0) {
      console.log("No backups found");
      process.exit(1);
    }

    backups.forEach((backup, index) => {
      console.log(`${index + 1}. Timestamp: ${backup.timestamp}`);
      console.log(`   📦 Size: ${backup.sizeMB} MB`);
      console.log(`   📅 Created: ${backup.created.toLocaleString()}\n`);
    });

    console.log("Example: npm run restore-backup -- " + backups[0].timestamp);
    process.exit(1);
  }

  try {
    console.log(`⏳ Restoring from backup: ${timestamp}`);
    console.log("⚠️  This will overwrite your current database!");
    console.log("");

    // In production, add confirmation here
    const result = restoreBackup(timestamp);

    console.log("");
    console.log("✅ Restoration complete!");
    console.log(`   📝 Restored from: ${result.restoredFrom}`);
    console.log(`   🛡️  Pre-restore backup: ${result.safetyBackup}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Restoration failed:", error);
    process.exit(1);
  }
}

main();
