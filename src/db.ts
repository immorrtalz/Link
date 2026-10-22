import Database from 'better-sqlite3';
import { existsSync, copyFileSync, mkdirSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';

const ENABLE_BACKUPS = process.env.ENABLE_BACKUPS === 'true';
const ENABLE_LOGGING = process.env.ENABLE_LOGGING === 'true';
const DB_PATH = process.env.DB_PATH ?? './links.db';
const DB_BACKUP_DIR_PATH = process.env.DB_BACKUP_DIR_PATH ?? './db/backups';
const MAX_BACKUPS = parseInt(process.env.DB_MAX_BACKUPS ?? '4');
const BACKUP_INTERVAL_MS = 12 * 60 * 60 * 1000; // Every 12 hours

type DBHandle =
{
	database: Database.Database;
	query: (text: string, params?: any[]) => any[];
	queryWithoutParams: (text: string) => Database.Database;
	run: (text: string, params?: any[]) => Database.RunResult;
};

type Backup = { file: string; timestamp: number };

const createBackup = () =>
{
	if (!existsSync(DB_PATH)) return;
	mkdirSync(DB_BACKUP_DIR_PATH, { recursive: true });

	const backupPath = join(DB_BACKUP_DIR_PATH, `db_backup.${new Date().toISOString().replaceAll(':', '_')}.bak`);
	copyFileSync(DB_PATH, backupPath);

	if (ENABLE_LOGGING) console.log(`Created database backup: ${backupPath}`);
};

const deleteOldBackups = () =>
{
	const backups = getExistingBackups();
	const toRemove = backups.slice(0, Math.max(0, backups.length - MAX_BACKUPS));

	for (const backup of toRemove)
	{
		rmSync(join(DB_BACKUP_DIR_PATH, backup.file));
		if (ENABLE_LOGGING) console.log(`Deleted old database backup: ${backup.file}`);
	}
};

const getExistingBackups = (): Backup[] =>
{
	if (!existsSync(DB_BACKUP_DIR_PATH)) return [];
	const prefix = `db_backup.`;

	return readdirSync(DB_BACKUP_DIR_PATH)
		.filter(file => file.startsWith(prefix) && file.endsWith('.bak'))
		.map(file => ({ file, timestamp: Date.parse(file.replaceAll('_', ':').slice(prefix.length, -'.bak'.length)) }))
		.filter((backup): backup is Backup => !isNaN(backup.timestamp))
		.sort((a, b) => a.timestamp - b.timestamp);
};

const runBackupCycle = () =>
{
	createBackup();
	deleteOldBackups();
};

const db = (): DBHandle =>
{
	if (ENABLE_BACKUPS)
	{
		runBackupCycle();
		setInterval(() => runBackupCycle(), BACKUP_INTERVAL_MS);
	}

	const database = new Database(DB_PATH);
	database.pragma('journal_mode = WAL');

	const query = (text: string, params: any[] = []) => database.prepare(text).all(...params);
	const queryWithoutParams = (text: string) => database.exec(text);
	const run = (text: string, params: any[] = []) => database.prepare(text).run(...params);

	return { database, query, queryWithoutParams, run };
};

export default db;