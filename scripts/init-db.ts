/**
 * Run with:  bun run create-api-key
 *
 * Generates a new API key, hashes it with bcrypt, and stores the hash in the
 * database. The plaintext key is printed once — save it somewhere safe.
 */
import db from '../src/db';

const args = Bun.argv;

if (args.length < 3 || args[2] !== '--i-am-sure') {
	console.log(
		"This will wipe all data from the database, if present. Please re-run the command with '--i-am-sure' to proceed.",
	);
	process.exit(0);
}

const script = await Bun.file('tables.sql').text();
db.run(script);

console.log('Database created!');
