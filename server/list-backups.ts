#!/usr/bin/env tsx
/**
 * List Available Backups Script
 * Usage: npm run backup
 */

import { listBackups, getBackupStats } from "./backup";

async function main() {
  console.log("📋 Available Database Backups\n");

  const backups = listBackups();

  if (backups.length === 0) {
    console.log("❌ No backups found yet");
    console.log("   Backups will be created automatically every 6 hours");
    console.log("   or when the server starts\n");
    process.exit(0);
  }

  // Print each backup
  backups.forEach((backup, index) => {
    console.log(`${index + 1}. ${backup.filename}`);
    console.log(`   📦 Size: ${backup.sizeMB} MB`);
    console.log(`   📅 Created: ${new Date(backup.created).toLocaleString()}`);
    console.log("");
  });

  // Print statistics
  const stats = getBackupStats();
  if (stats) {
    console.log("📊 Backup Statistics:");
    console.log(`   Total backups: ${stats.totalBackups}`);
    console.log(`   Total size: ${stats.totalSizeMB} MB`);
    console.log(
      `   Oldest backup: ${new Date(stats.oldestBackup.created).toLocaleString()}`,
    );
    console.log(
      `   Newest backup: ${new Date(stats.newestBackup.created).toLocaleString()}`,
    );
  }

  console.log("\n💡 To restore a backup, use:");
  console.log(`   npm run restore-backup -- ${backups[0].timestamp}`);
  console.log("");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
