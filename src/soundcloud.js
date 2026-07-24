const SOUNDCLOUD_URL_PATTERN = /https?://(?:on.)?soundcloud.com/[^\s<>()]+/gi;

export function extractSoundCloudLinks(text) {
return [...new Set((text.match(SOUNDCLOUD_URL_PATTERN) ?? []).map((url) => url.replace(/[.,;!?]+$/, '')))];
}

export async function resolveSoundCloudTrack(url, clientId, fetchImpl = fetch) {
if (!clientId || clientId.startsWith('replace_with')) {
return { url, title: url, artist: 'SoundCloud', id: url };
}

const endpoint = new URL('https://api-v2.soundcloud.com/resolve');
endpoint.searchParams.set('url', url);
endpoint.searchParams.set('client_id', clientId);
const response = await fetchImpl(endpoint);
if (!response.ok) throw new Error(SoundCloud resolve failed: ${response.status});
const data = await response.json();
return {
url: data.permalink_url ?? url,
title: data.title ?? url,
artist: data.user?.username ?? 'SoundCloud',
id: String(data.id ?? url),
};
}

export async function syncPlaylistToSoundCloud(channelPlaylist, token, fetchImpl = fetch) {
if (!token || token.startsWith('replace_with')) {
return { skipped: true, reason: 'SOUNDCLOUD_OAUTH_TOKEN is not configured.' };
}

const response = await fetchImpl('https://api.soundcloud.com/playlists', {
method: 'POST',
headers: { Authorization: OAuth ${token}, 'Content-Type': 'application/json' },
body: JSON.stringify({
playlist: {
title: Discord #${channelPlaylist.channelName},
sharing: 'private',
tracks: channelPlaylist.tracks.map((track) => ({ id: track.id })).filter((track) => /^\d+$/.test(String(track.id))),
},
}),
});

if (!response.ok) throw new Error(SoundCloud playlist sync failed: ${response.status});
return { skipped: false, playlist: await response.json() };
}
