import { createPublicKey, verify } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function verifyModule(envelopeBytes, publicKeyBase64, expectedRevision) {
  if (envelopeBytes.length > 131072) throw new Error('Module exceeds 128 KiB');
  const envelope = JSON.parse(envelopeBytes.toString('utf8'));
  if (Object.keys(envelope).sort().join() !== 'payload,signature') throw new Error('Invalid envelope');
  for (const field of ['payload', 'signature']) {
    if (typeof envelope[field] !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(envelope[field])) throw new Error('Invalid base64');
  }
  const payload = Buffer.from(envelope.payload, 'base64');
  const key = createPublicKey({ key: Buffer.from(publicKeyBase64.trim(), 'base64'), format: 'der', type: 'spki' });
  if (key.asymmetricKeyType !== 'rsa' || !verify('RSA-SHA256', payload, key, Buffer.from(envelope.signature, 'base64'))) throw new Error('Invalid signature');
  const data = JSON.parse(payload.toString('utf8'));
  const raw = payload.toString('utf8');
  if (raw.match(/"schema"\s*:\s*([^,}\s]+)/)?.[1] !== '1' ||
      raw.match(/"revision"\s*:\s*([^,}\s]+)/)?.[1] !== String(data.revision)) throw new Error('Non-canonical numeric metadata');
  if (Object.keys(data).sort().join() !== 'module,pairs,revision,schema' || data.module !== 'creator-matching-rules' || data.schema !== 1) throw new Error('Incompatible module');
  if (!Number.isInteger(data.revision) || data.revision < 1 || data.revision > 999999999) throw new Error('Invalid revision');
  if (expectedRevision !== undefined && String(data.revision) !== String(expectedRevision)) throw new Error('Unexpected revision');
  if (!Array.isArray(data.pairs) || data.pairs.length > 500) throw new Error('Invalid pair count');
  const ids = /^(?:YOUTUBE:UC[A-Za-z0-9_-]{22}|TWITCH:[0-9]{1,20})$/;
  const seen = new Set();
  for (const pair of data.pairs) {
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some(id => typeof id !== 'string' || !ids.test(id)) || pair[0] === pair[1]) throw new Error('Invalid account pair');
    const identity = [...pair].sort().join('|');
    if (seen.has(identity)) throw new Error('Duplicate pair');
    seen.add(identity);
  }
  return data;
}

export async function prepareSite(input, keyPath, output, revision) {
  const bytes = await readFile(input);
  const data = verifyModule(bytes, await readFile(keyPath, 'utf8'), revision);
  await mkdir(output, { recursive: true });
  // A single exact file is staged; the repository, keys and APK are never copied.
  await writeFile(resolve(output, 'creator-rules.signed.json'), bytes);
  console.log(`Verified creator rules revision ${data.revision}; ${data.pairs.length} pairs.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [input, output, revision] = process.argv.slice(2);
  if (!input || !output || !/^[1-9][0-9]{0,8}$/.test(revision ?? '')) {
    console.error('Usage: node scripts/verify-creator-module.mjs INPUT OUTPUT_DIRECTORY EXPECTED_REVISION');
    process.exitCode = 1;
  } else {
    try { await prepareSite(input, 'creator-rules-public-key.txt', output, revision); }
    catch (error) { console.error(`Module rejected: ${error.message}`); process.exitCode = 1; }
  }
}
