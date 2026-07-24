const container = document.querySelector('#playlists');
const library = await fetch('/api/playlists').then((response) => response.json());
const playlists = Object.values(library.channels ?? {});

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

container.innerHTML = playlists.length
  ? playlists.map((playlist) => `
      <article class="card">
        <h2>#${escapeHtml(playlist.channelName)}</h2>
        <p class="meta">${playlist.tracks.length}曲</p>
        ${playlist.tracks.map((track) => `
          <div class="track">
            <a href="${escapeHtml(track.url)}" target="_blank" rel="noreferrer">${escapeHtml(track.title)}</a>
            <div class="meta">${escapeHtml(track.artist)} · ${new Date(track.addedAt).toLocaleString('ja-JP')}</div>
          </div>
        `).join('')}
      </article>
    `).join('')
  : '<article class="card"><h2>まだ曲がありません</h2><p class="meta">DiscordにSoundCloudリンクを貼ると、ここに表示されます。</p></article>';
