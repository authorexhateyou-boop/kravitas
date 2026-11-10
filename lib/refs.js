// Reference files for Ideas: images are shown to the model, documents are read as text.
import { saveDataUrl } from './media.js';

const DOC = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt', 'text/markdown': 'txt', 'text/csv': 'txt', 'application/json': 'txt',
};
const IMG = new Set(['image/png', 'image/jpeg', 'image/webp']);
export const MAX_REF_TEXT = 12000; // characters of document text sent to the model per brainstorm
const MAX_FILE = 10 * 1024 * 1024;

/** Parse an uploaded data URL into { kind:'image', url } or { kind:'doc', text, chars }. */
export async function readReference(dataUrl, name = '') {
  const m = /^data:([\w/+.-]+)(?:;[^,]*)?;base64,(.+)$/s.exec(dataUrl || '');
  if (!m) throw new Error('That file could not be read');
  let type = m[1];
  if (type === 'application/octet-stream' || type === '') type = guess(name);
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > MAX_FILE) throw new Error(`${name || 'That file'} is too large (max 10 MB)`);
  if (IMG.has(type)) return { kind: 'image', url: await saveDataUrl(dataUrl), name };
  const ext = DOC[type] || guessExt(name);
  if (!ext) throw new Error(`${name || 'That file'}: use an image, PDF, Word (.docx) or text file`);
  let text = '';
  if (ext === 'pdf') {
    const pdf = (await import('pdf-parse/lib/pdf-parse.js')).default;
    text = (await pdf(buf, { max: 40 })).text || '';
  } else if (ext === 'docx') {
    const mammoth = (await import('mammoth')).default;
    text = (await mammoth.extractRawText({ buffer: buf })).value || '';
  } else text = buf.toString('utf8');
  text = text.replace(/\u0000/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!text) throw new Error(`${name || 'That file'} has no readable text (a scanned PDF needs OCR first)`);
  return { kind: 'doc', name, chars: text.length, text: text.slice(0, MAX_REF_TEXT * 2) };
}
const guessExt = (n) => (/\.pdf$/i.test(n) ? 'pdf' : /\.docx$/i.test(n) ? 'docx' : /\.(txt|md|csv|json)$/i.test(n) ? 'txt' : '');
const guess = (n) => ({ pdf: 'application/pdf', docx: DOC_DOCX, txt: 'text/plain' }[guessExt(n)] || (/\.(jpe?g)$/i.test(n) ? 'image/jpeg' : /\.png$/i.test(n) ? 'image/png' : /\.webp$/i.test(n) ? 'image/webp' : ''));
const DOC_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
