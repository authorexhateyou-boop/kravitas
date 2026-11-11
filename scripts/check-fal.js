// Checks your fal.ai key with one tiny, cheap request (about half a US cent). Never prints the key.
import { falKey, run, falError } from '../lib/fal.js';
import { MODELS } from '../lib/models.js';

const k = falKey();
if (!k) { console.log('\nNo fal.ai key found. Put it after FAL_KEY= in the .env file, save, and run this again.\n'); process.exit(1); }
console.log(`\nKey found: starts with "${k.slice(0, 4)}", ${k.length} characters, ${k.includes(':') ? 'contains a colon' : 'no colon'}${/\s/.test(k) ? ', HAS A SPACE OR LINE BREAK (remove it)' : ''}.`);
console.log('Asking fal.ai for one small test picture…');
try {
  await run(MODELS.imageLite, { prompt: 'a red apple on a white table', num_images: 1, image_size: 'square' });
  console.log('\nRESULT: OK. fal.ai accepted your key and made a picture. Kravitas can use it.\n');
} catch (e) {
  console.log(`\nRESULT: FAILED. fal.ai said: ${falError(e)} (status ${e?.status ?? 'none'})`);
  console.log('If this says the key is invalid or rejected: make a new key at fal.ai/dashboard/keys (API scope) and paste the whole thing.');
  console.log('If it mentions balance or credit: add funds under Billing in the fal.ai dashboard.\n');
  process.exit(1);
}
