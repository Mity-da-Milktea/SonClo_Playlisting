import { config } from './config.js';
import { addTrackToChannel, updateChannelSoundCloudPlaylist } from './storage.js';
import { handlePlaybackCommand, isPlaybackCommand } from './playback.js';
import { extractSoundCloudLinks, resolveSoundCloudTrack, syncPlaylistToSoundCloud } from './soundcloud.js';

const DISCORD_GATEWAY = 'wss://gateway.discord.gg/?v=10&encoding=json';
const MESSAGE_CONTENT_INTENT = 1 << 15;
const GUILDS_INTENT = 1 << 0;
const GUILD_MESSAGES_INTENT = 1 << 9;

export function createDiscordBot({ token, dataFile, soundCloudClientId, soundCloudOAuthToken, commandPrefix }) {
  let heartbeatTimer;
  let sequence = null;
  const socket = new WebSocket(DISCORD_GATEWAY);

  socket.addEventListener('message', async (event) => {
    const payload = JSON.parse(event.data);
    if (payload.s) sequence = payload.s;

    if (payload.op === 10) {
      heartbeatTimer = setInterval(() => socket.send(JSON.stringify({ op: 1, d: sequence })), payload.d.heartbeat_interval);
      socket.send(JSON.stringify({
        op: 2,
        d: {
          token,
          intents: GUILDS_INTENT | GUILD_MESSAGES_INTENT | MESSAGE_CONTENT_INTENT,
          properties: { os: process.platform, browser: 'sugoroku-tycoon', device: 'sugoroku-tycoon' },
        },
      }));
      return;
    }

    if (payload.t !== 'MESSAGE_CREATE' || payload.d.author?.bot) return;
    await handleDiscordMessage(payload.d, { dataFile, soundCloudClientId, soundCloudOAuthToken, token, commandPrefix });
  });

  socket.addEventListener('close', () => clearInterval(heartbeatTimer));
  socket.addEventListener('error', (error) => console.error('Discord gateway error:', error));
  return socket;
}

export async function handleDiscordMessage(message, { dataFile, soundCloudClientId, soundCloudOAuthToken, token, commandPrefix }) {
  if (isPlaybackCommand(message.content ?? '', commandPrefix)) {
    await handlePlaybackCommand(message, { dataFile, token, prefix: commandPrefix });
    return;
  }

  const links = extractSoundCloudLinks(message.content ?? '');
  for (const link of links) {
    try {
      const track = await resolveSoundCloudTrack(link, soundCloudClientId);
      const result = await addTrackToChannel(
        dataFile,
        { id: message.channel_id, name: message.channel_name ?? message.channel_id },
        track,
        { author: message.author, url: buildDiscordMessageUrl(message) },
      );
      if (result.added) {
        const syncResult = await syncPlaylistToSoundCloud(result.playlist, soundCloudOAuthToken);
        await updateChannelSoundCloudPlaylist(dataFile, message.channel_id, syncResult);
      }
    } catch (error) {
      console.error(`Failed to store SoundCloud link ${link}:`, error);
    }
  }
}

export function buildDiscordMessageUrl(message) {
  if (!message.guild_id || !message.channel_id || !message.id) return null;
  return `https://discord.com/channels/${message.guild_id}/${message.channel_id}/${message.id}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!config.discordToken || config.discordToken.startsWith('replace_with')) {
    throw new Error('DISCORD_TOKEN is not configured. Please edit .env first.');
  }
  createDiscordBot(config);
}
