import { Pool } from 'pg';

const db = () =>
{
	//const dbSchema = new 

	const pool = new Pool(
	{
		connectionString: process.env.DB_URL,
		connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT ?? "5000"),
		idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT ?? "10000"),
		max: parseInt(process.env.DB_MAX_POOL ?? "16"),
		maxLifetimeSeconds: parseInt(process.env.DB_MAX_LIFETIME_SEC ?? "60"),
	});

	const query = (text: string, params: any[]) => pool.query(text, params);
	const queryWithoutParams = (text: string) => pool.query(text);

	return { pool, query, queryWithoutParams };
};

export default db;