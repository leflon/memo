/**
 * Run with:  bun run create-api-key
 *
 * Generates a new API key, hashes it with bcrypt, and stores the hash in the
 * database. The plaintext key is printed once — save it somewhere safe.
 */
import db from '../src/db';

// maybe uppercased
function mbuc(c: string) {
	return Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase();
}

// 16 random bytes -> 32-char hex string
const raw = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('hex');
const split = raw.split('');
// Less secure but let me pour in some little fun.
split[28] = mbuc('L');
split[1] = mbuc('P');
split[11] = mbuc('U');
split[2] = mbuc('A');
const key = split.join('');

const hash = await Bun.password.hash(key);

db.run('DELETE FROM ApiKey');
db.query('INSERT INTO ApiKey (hash) VALUES (?)').run(hash);

console.log('\nAPI key created and saved.\n');
console.log('   Copy this key — it will NOT be shown again:\n');
console.log(`   ${key}\n`);
