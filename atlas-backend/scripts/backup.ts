import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('[ERROR] DATABASE_URL is not defined in .env');
  process.exit(1);
}

const backupsDir = path.resolve(__dirname, '../backups');

if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const date = new Date();
// Format: YYYY-MM-DDTHH-MM-SS
const timestamp = date.toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupsDir, `atlas-db-backup-${timestamp}.sql`);

console.log(`[INFO] Starting database backup...`);
console.log(`[INFO] Destination: ${backupFile}`);

// Ensure pg_dump is in the system PATH
const command = `pg_dump "${dbUrl}" -f "${backupFile}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`[ERROR] Backup failed: ${error.message}`);
    console.error(`[ERROR] Make sure PostgreSQL tools (pg_dump) are installed and added to your system PATH.`);
    process.exit(1);
  }
  
  // pg_dump sometimes writes warnings to stderr
  if (stderr && stderr.toLowerCase().includes('error')) {
    console.error(`[ERROR] ${stderr}`);
    process.exit(1);
  } else if (stderr) {
    console.warn(`[WARN] ${stderr}`);
  }
  
  console.log(`[SUCCESS] Database backup completed successfully!`);
});
