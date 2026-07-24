import { loadLibrary } from './storage.js';

const sessions = new Map();

export function isPlaybackCommand(content, prefix = '!sc') {
  return content.trim().startsWith(prefix);
}

export async function handlePlaybackCommand(message, { dataFile, token, prefix = '!sc', fetchImpl = fetch }) {
  const args = message.content.trim().slice(prefix.length).trim().split(/\s+/).filter(Boolean);
  const command = args[0] ?? 'help';
  const library = await loadLibrary(dataFile);
  const playlist = library.channels[message.channel_id];

  if (command === 'help') {
    return sendDiscordMessage(token, message.channel_id, buildHelp(prefix), fetchImpl);
  }

  if (!playlist || playlist.tracks.length === 0) {
    return sendDiscordMessage(token, message.channel_id, 'このチャンネルにはまだ再生できるSoundCloud曲がありません。SoundCloudリンクを貼ってからもう一度試してください。', fetchImpl);
  }

  if (command === 'playlist') {
    return sendDiscordMessage(token, message.channel_id, formatPlaylist(playlist), fetchImpl);
  }

  if (command === 'play') {
    sessions.set(message.channel_id, { index: 0, playlist });
    return sendDiscordMessage(token, message.channel_id, formatNowPlaying(playlist, 0), fetchImpl);
  }

  if (command === 'next') {
    const session = sessions.get(message.channel_id) ?? { index: -1, playlist };
    const nextIndex = (session.index + 1) % playlist.tracks.length;
    sessions.set(message.channel_id, { index: nextIndex, playlist });
    return sendDiscordMessage(token, message.channel_id, formatNowPlaying(playlist, nextIndex), fetchImpl);
  }

  if (command === 'stop') {
    sessions.delete(message.channel_id);
    return sendDiscordMessage(token, message.channel_id, 'プレイリスト再生を停止しました。', fetchImpl);
  }

  return sendDiscordMessage(token, message.channel_id, `不明な操作です。\`${prefix} help\` を確認してください。`, fetchImpl);
}

export function buildHelp(prefix = '!sc') {
  return [
    'SoundCloudプレイリスト操作:',
    `\`${prefix} playlist\` - このチャンネルのプレイリストを表示`,
    `\`${prefix} play\` - 先頭の曲を再生案内として表示`,
    `\`${prefix} next\` - 次の曲へ進む`,
    `\`${prefix} stop\` - 再生案内を停止`,
  ].join('\n');
}

function formatPlaylist(playlist) {
  const tracks = playlist.tracks.slice(0, 10).map((track, index) => `${index + 1}. ${track.title} - ${track.url}`).join('\n');
  const more = playlist.tracks.length > 10 ? `\n他 ${playlist.tracks.length - 10} 曲` : '';
  const soundCloudUrl = playlist.soundCloudPlaylistUrl ? `\nSoundCloudプレイリスト: ${playlist.soundCloudPlaylistUrl}` : '';
  return `#${playlist.channelName} のプレイリスト\n${tracks}${more}${soundCloudUrl}`;
}

function formatNowPlaying(playlist, index) {
  const track = playlist.tracks[index];
  return `再生中: ${track.title}\n${track.url}\n(${index + 1}/${playlist.tracks.length})`;
}

async function sendDiscordMessage(token, channelId, content, fetchImpl = fetch) {
  if (!token || token.startsWith('replace_with')) return { skipped: true, content };
  const response = await fetchImpl(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error(`Discord message send failed: ${response.status}`);
  return response.json();
}
