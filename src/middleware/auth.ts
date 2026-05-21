import Elysia from 'elysia';
import db from '../db';

interface ApiKeyRow {
	hash: string;
}

export const auth = new Elysia({ name: 'auth' }).onBeforeHandle(
	{ as: 'global' },
	async ({ headers, set }) => {
		let row: ApiKeyRow | null;
		try {
			row = db.query<ApiKeyRow, []>('SELECT hash FROM ApiKey LIMIT 1').get();
		} catch {
			set.status = 500;
			return { error: 'Database unavailable' };
		}

		if (!row) {
			set.status = 500;
			return { error: 'No API key configured' };
		}

		const authHeader = headers['authorization'];
		const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

		if (!token || !(await Bun.password.verify(token, row.hash))) {
			set.status = 401;
			return { error: 'Unauthorized' };
		}
	},
);
