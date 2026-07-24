import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSoundCloudLinks } from '../src/soundcloud.js';

test('extracts unique SoundCloud links from Discord text', () => {
const links = extractSoundCloudLinks('良い曲 https://soundcloud.com/user/track と https://on.soundcloud.com/abc! https://soundcloud.com/user/track');
assert.deepEqual(links, ['https://soundcloud.com/user/track', 'https://on.soundcloud.com/abc']);
});
