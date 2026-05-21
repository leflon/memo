import { Elysia } from 'elysia';
import { auth } from './middleware/auth';
import { cardsRoutes } from './routes/cards';

const app = new Elysia()
	.onError(({ error, code, set }) => {
		// Each error response should have a content-length of 25.
		// Pad or shrink response if necessary to meet this standard.
		if (code === 'VALIDATION') return;
		if (code === 'NOT_FOUND') {
			set.status = 404;
			return { error: 'Not Found!!!!' };
		}
		console.error(`[${code}]`, error);
		set.status = 500;
		return { error: 'Server Error!' };
	})
	.use(auth)
	.use(cardsRoutes)
	.listen(Number(process.env.PORT) || 3000);

console.log(`Memo API running at http://${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
