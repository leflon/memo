import { Database } from 'bun:sqlite';

const db = new Database('memo.db');

export default db;
