const fs = require('node:fs/promises');
const path = require('node:path');
const { randomBytes, createHash } = require('node:crypto');
const digest = token => createHash('sha256').update(token).digest('hex');

// Local judge profiles only. No calendar imports, notes or legacy review data.
async function createMcpStore(file, model, clock = Date.now) {
  let state = { version: 1, profiles: {} }, queue = Promise.resolve();
  try {
    const raw = JSON.parse(await fs.readFile(file, 'utf8'));
    if (raw.version !== 1 || !raw.profiles || typeof raw.profiles !== 'object' || Array.isArray(raw.profiles)) throw Error('Invalid MCP store');
    for (const [id, profile] of Object.entries(raw.profiles)) {
      if (!/^[a-f0-9]{64}$/.test(id) || !model.validDate(profile.createdOn)) throw Error('Invalid MCP profile');
      model.validateProgress(profile.progress);
    }
    state = raw;
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  function transaction(update) {
    const operation = queue.then(async () => {
      const next = structuredClone(state), result = update(next);
      await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
      const temporary = `${file}.${randomBytes(8).toString('hex')}.tmp`;
      try {
        await fs.writeFile(temporary, JSON.stringify(next), { mode: 0o600, flag: 'wx' });
        await fs.rename(temporary, file);
      } catch (error) { await fs.unlink(temporary).catch(() => {}); throw error; }
      state = next;
      return result;
    });
    queue = operation.catch(() => {});
    return operation;
  }
  function idFor(token) {
    return typeof token === 'string' && /^[a-f0-9]{64}$/.test(token) ? digest(token) : '';
  }
  return {
    has: token => Object.hasOwn(state.profiles, idFor(token)),
    get(token) {
      const profile = state.profiles[idFor(token)];
      if (!profile) throw Error('Unknown judge profile');
      return structuredClone(profile);
    },
    create: () => transaction(next => {
      if (Object.keys(next.profiles).length >= 200) throw Error('Local profile limit reached');
      const token = randomBytes(32).toString('hex');
      next.profiles[digest(token)] = { createdOn: model.brusselsDate(new Date(clock())), progress: { ...model.freshProgress(), locale: 'en' } };
      return token;
    }),
    save: (token, phraseId) => transaction(next => {
      const profile = next.profiles[idFor(token)];
      if (!profile) throw Error('Unknown judge profile');
      profile.progress = model.saveMemory(profile.progress, phraseId, clock());
      return structuredClone(profile.progress.memories);
    }),
    rate: (token, phraseId, rating, expectedReviews) => transaction(next => {
      const profile = next.profiles[idFor(token)];
      const card = profile?.progress.memories.find(m => m.id === phraseId);
      if (!card || card.reviews !== expectedReviews) throw Error('Card changed. Refresh your memories before reviewing again.');
      profile.progress = model.rateMemory(profile.progress, phraseId, rating, clock());
      return structuredClone(profile.progress.memories);
    })
  };
}
module.exports = { createMcpStore };
