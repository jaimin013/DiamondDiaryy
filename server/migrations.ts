import fs from "fs";
import path from "path";

interface Migration {
  version: string;
  timestamp: number;
  description: string;
  appliedAt: string;
  changedFields?: string[];
}

const MIGRATIONS_LOG = path.join(process.cwd(), "database", "migrations.json");

// Track a new migration
export function trackMigration(
  version: string,
  description: string,
  changedFields?: string[],
) {
  try {
    let migrations: Migration[] = [];

    // Ensure database directory exists
    const dbDir = path.join(process.cwd(), "database");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Read existing migrations
    if (fs.existsSync(MIGRATIONS_LOG)) {
      migrations = JSON.parse(fs.readFileSync(MIGRATIONS_LOG, "utf-8"));
    }

    // Add new migration
    const migration: Migration = {
      version,
      timestamp: Date.now(),
      description,
      appliedAt: new Date().toISOString(),
      changedFields,
    };

    migrations.push(migration);

    // Write back to file
    fs.writeFileSync(MIGRATIONS_LOG, JSON.stringify(migrations, null, 2));

    console.log(`[Migration] ✅ Tracked: v${version}`);
    console.log(`           📝 ${description}`);
    if (changedFields) {
      console.log(`           🔧 Fields: ${changedFields.join(", ")}`);
    }

    return migration;
  } catch (error) {
    console.error("[Migration] ❌ Tracking failed:", error);
    throw error;
  }
}

// Get full migration history
export function getMigrationHistory(): Migration[] {
  try {
    if (fs.existsSync(MIGRATIONS_LOG)) {
      return JSON.parse(fs.readFileSync(MIGRATIONS_LOG, "utf-8"));
    }
    return [];
  } catch (error) {
    console.error("[Migration] Error reading history:", error);
    return [];
  }
}

// Get latest migration
export function getLatestMigration(): Migration | null {
  const history = getMigrationHistory();
  return history.length > 0 ? history[history.length - 1] : null;
}

// Print migration history
export function printHistory() {
  const migrations = getMigrationHistory();

  if (migrations.length === 0) {
    console.log("[Migration] No migrations tracked yet");
    return;
  }

  console.log("\n📋 MIGRATION HISTORY\n");
  console.log("=".repeat(70));

  migrations.forEach((migration, index) => {
    const date = new Date(migration.timestamp);
    console.log(`${index + 1}. Version ${migration.version}`);
    console.log(`   📅 Applied: ${date.toLocaleString()}`);
    console.log(`   📝 Description: ${migration.description}`);
    if (migration.changedFields) {
      console.log(`   🔧 Changes: ${migration.changedFields.join(", ")}`);
    }
    console.log("-".repeat(70));
  });

  console.log(`\n✅ Total migrations: ${migrations.length}\n`);
}

// Verify migration compatibility
export function verifyMigrationCompatibility(): {
  compatible: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const migrations = getMigrationHistory();

  // Check if migrations exist
  if (migrations.length === 0) {
    warnings.push("No migrations tracked - start tracking from now");
  }

  // Check for version conflicts
  const versions = new Set(migrations.map((m) => m.version));
  if (versions.size !== migrations.length) {
    warnings.push("⚠️  Duplicate version numbers detected");
  }

  // Check timeline
  let lastTime = 0;
  for (const migration of migrations) {
    if (migration.timestamp < lastTime) {
      warnings.push("⚠️  Migrations out of chronological order");
      break;
    }
    lastTime = migration.timestamp;
  }

  return {
    compatible: warnings.length === 0,
    warnings,
  };
}
