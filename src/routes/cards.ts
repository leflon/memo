import Elysia, { t } from 'elysia';
import db from '../db';

/** Returns the id if the collection exists, null otherwise. */
function resolveCollectionId(id: string | null): string | null {
	if (!id) return null;
	return db.query<{ id: string }, [string]>('SELECT id FROM Collections WHERE id = ?').get(id)
		? id
		: null;
}

interface Card {
	id: string;
	front_text: string;
	back_text: string;
	collection_id: string | null;
	easiness_factor: number;
	repetitions: number;
	interval: number;
}

export const cardsRoutes = new Elysia({ prefix: '/cards' })
  .get('/', () => {
    return db.query<Card, []>('SELECT * FROM Cards').all();
  })

  .get('/collection/:collectionId', ({ params, set }) => {
    const cards = db
      .query<Card, [string]>('SELECT * FROM Cards WHERE collection_id = ?')
      .all(params.collectionId);

    if (!cards.length) {
      return [];
    }

    return cards;
  })

  .get('/:id', ({ params, set }) => {
    const card = db.query<Card, [string]>('SELECT * FROM Cards WHERE id = ?').get(params.id);

    if (!card) {
      set.status = 404;
      return { error: 'Card not found' };
    }

    return card;
  })

  .post(
    '/',
    ({ body, set }) => {
      const id = crypto.randomUUID();
      const collection_id = resolveCollectionId(body.collection_id ?? null);
      db.query(
        'INSERT INTO Cards (id, front_text, back_text, collection_id) VALUES (?, ?, ?, ?)',
      ).run(id, body.front_text, body.back_text, collection_id);
      set.status = 201;
      return db.query<Card, [string]>('SELECT * FROM Cards WHERE id = ?').get(id);
    },
    {
      body: t.Object({
        front_text: t.String({ minLength: 1 }),
        back_text: t.String({ minLength: 1 }),
        collection_id: t.Optional(t.String()),
      }),
    },
  )
	.patch(
		'/:id',
		({ params, body, set }) => {
			const card = db
				.query<Card, [string]>('SELECT * FROM Cards WHERE id = ?')
				.get(params.id);

			if (!card) {
				set.status = 404;
				return { error: 'Card not found' };
			}

			const front_text = body.front_text ?? card.front_text;
			const back_text = body.back_text ?? card.back_text;

			// Three cases for collection_id:
			//   not in body      -> keep current value
			//   null             -> explicitly detach
			//   unknown string   -> silently ignore (treat as null)
			const collection_id = !Object.hasOwn(body, 'collection_id')
				? card.collection_id
				: resolveCollectionId(body.collection_id ?? null);

			db.query(
				`
      UPDATE Cards
      SET front_text = ?, back_text = ?, collection_id = ?
      WHERE id = ?
    `,
			).run(front_text, back_text, collection_id, params.id);

			return { ...card, front_text, back_text, collection_id };
		},
		{
			body: t.Object({
				front_text: t.Optional(t.String({ minLength: 1 })),
				back_text: t.Optional(t.String({ minLength: 1 })),
				collection_id: t.Optional(t.Nullable(t.String())),
			}),
		},
	)

	.delete('/:id', ({ params, set }) => {
		const card = db.query<Card, [string]>('SELECT * FROM Cards WHERE id = ?').get(params.id);

		if (!card) {
			set.status = 404;
			return { error: 'Card not found' };
		}

		db.query('DELETE FROM Cards WHERE id = ?').run(params.id);
		set.status = 204;
	});
