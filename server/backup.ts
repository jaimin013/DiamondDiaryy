import fs from "fs";
import path from "path";

const BACKUP_DIR = path.join(process.cwd(), "database", "backups");
const DB_PATH = path.join(process.cwd(), "database.db");

// Setup automatic backups every 6 hours
export function setupAutoBackup() {
  // First backup on startup
  backupDatabase();

  // Then every 6 hours
  setInterval(
    () => {
      backupDatabase();
    },
    6 * 60 * 60 * 1000,
  ); // 6 hours in milliseconds

  console.log("[Backup] Auto-backup system initialized (6-hour interval)");
}

// Manual backup function
export function backupDatabase() {
  try {
    // Ensure backups directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log("[Backup] Created backups directory");
    }

    // Check if database exists
    if (!fs.existsSync(DB_PATH)) {
      console.warn("[Backup] Database file not found, skipping backup");
      return;
    }

    // Generate timestamp for backup filename
    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace(/[T:\\.]/g, "-")
      .slice(0, -5); // Remove milliseconds

    const backupPath = path.join(BACKUP_DIR, `diamonds.backup.${timestamp}.db`);

    // Copy database file
    fs.copyFileSync(DB_PATH, backupPath);

    // Get file size
    const stats = fs.statSync(backupPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`[Backup] ✅ Database backed up successfully`);
    console.log(
      `        📦 File: diamonds.backup.${timestamp}.db (${sizeKB} KB)`,
    );

    // Cleanup old backups (keep only last 30)
    cleanupOldBackups();
  } catch (error) {
    console.error("[Backup] ❌ Backup failed:", error);
  }
}

// Remove old backups, keep only last 30
function cleanupOldBackups() {
  try {
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith("diamonds.backup.") && f.endsWith(".db"))
      .sort()
      .reverse();

    // Keep only last 30 backups
    if (files.length > 30) {
      const filesToDelete = files.slice(30);

      filesToDelete.forEach((file) => {
        const filePath = path.join(BACKUP_DIR, file);
        fs.unlinkSync(filePath);
        console.log(`[Backup] 🗑️  Removed old backup: ${file}`);
      });

      console.log(`[Backup] Cleaned up ${filesToDelete.length} old backups`);
    }

    console.log(
      `[Backup] 📊 Active backups: ${Math.min(files.length, 30)} (max 30)`,
    );
  } catch (error) {
    console.error("[Backup] Cleanup error:", error);
  }
}

// Restore from a specific backup
export function restoreBackup(backupTimestamp: string) {
  try {
    const backupPath = path.join(
      BACKUP_DIR,
      `diamonds.backup.${backupTimestamp}.db`,
    );

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupTimestamp}`);
    }

    // Create safety copy of current database
    const now = new Date();
    const safetyTimestamp = now
      .toISOString()
      .replace(/[T:\\.]/g, "-")
      .slice(0, -5);
    const safetyPath = path.join(
      BACKUP_DIR,
      `diamonds.pre-restore.${safetyTimestamp}.db`,
    );

    if (fs.existsSync(DB_PATH)) {
      fs.copyFileSync(DB_PATH, safetyPath);
      console.log(
        `[Restore] 📦 Safety copy created: pre-restore.${safetyTimestamp}.db`,
      );
    }

    // Restore backup
    fs.copyFileSync(backupPath, DB_PATH);

    console.log(`[Restore] ✅ Database restored successfully`);
    console.log(`         📋 Restored from: ${backupTimestamp}`);
    console.log(`         🛡️  Safety copy at: ${safetyTimestamp}`);

    return {
      success: true,
      restoredFrom: backupTimestamp,
      safetyBackup: safetyTimestamp,
    };
  } catch (error) {
    console.error("[Restore] ❌ Restore failed:", error);
    throw error;
  }
}

// List all available backups
export function listBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return [];
    }

    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith("diamonds.backup.") && f.endsWith(".db"))
      .sort()
      .reverse()
      .map((file) => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        const timestamp = file
          .replace("diamonds.backup.", "")
          .replace(".db", "");

        return {
          filename: file,
          timestamp,
          sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
          created: stats.birthtime,
          modified: stats.mtime,
        };
      });

    return files;
  } catch (error) {
    console.error("[Backup] Error listing backups:", error);
    return [];
  }
}

// Get backup statistics
export function getBackupStats() {
  try {
    const backups = listBackups();
    const totalSize = backups.reduce((sum, b) => sum + parseFloat(b.sizeMB), 0);

    return {
      totalBackups: backups.length,
      totalSizeMB: totalSize.toFixed(2),
      newestBackup: backups[0],
      oldestBackup: backups[backups.length - 1],
      backups,
    };
  } catch (error) {
    console.error("[Backup] Error calculating stats:", error);
    return null;
  }
}
