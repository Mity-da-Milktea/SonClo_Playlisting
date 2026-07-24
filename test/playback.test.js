import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHelp, isPlaybackCommand } from '../src/playback.js';

test('detects playback commands by prefix', () => {
  assert.equal(isPlaybackCommand('!sc play'), true);
  assert.equal(isPlaybackCommand('普通の会話 https://soundcloud.com/user/track'), false);
});

test('builds help text with configured prefix', () => {
  const help = buildHelp('/sc');
  assert.match(help, /\/sc playlist/);
  assert.match(help, /\/sc next/);
});
