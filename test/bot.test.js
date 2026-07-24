import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDiscordMessageUrl } from '../src/bot.js';

test('builds Discord message URL', () => {
assert.equal(
buildDiscordMessageUrl({ guild_id: '1', channel_id: '2', id: '3' }),
'https://discord.com/channels/1/2/3',
);
});
