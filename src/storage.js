import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function loadLibrary(file) {
try {
return JSON.parse(await readFile(file, 'utf8'));
} catch (error) {
if (error.code === 'ENOENT') return { channels: {} };
throw error;
}
}

export async function saveLibrary(file, library) {
await mkdir(dirname(file), { recursive: true });
await writeFile(file, JSON.stringify(library, null, 2));
}

export async function addTrackToChannel(file, channel, track, message) {
const library = await loadLibrary(file);
const key = channel.id;
library.channels[key] ??= { channelId: channel.id, channelName: channel.name, tracks: [] };
const playlist = library.channels[key];
playlist.channelName = channel.name;

if (!playlist.tracks.some((existing) => existing.url === track.url || existing.id === track.id)) {
playlist.tracks.push({
...track,
addedAt: new Date().toISOString(),
addedBy: message.author?.username ?? 'unknown',
messageUrl: message.url ?? null,
});
await saveLibrary(file, library);
return { added: true, playlist };
}
return { added: false, playlist };
}
