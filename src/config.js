import { readFileSync } from 'node:fs';

function loadEnvFile(file = '.env') {
  try {
    const content = readFileSync(file, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const [key, ...valueParts] = trimmed.split('=');
      process.env[key] ??= valueParts.join('=').replace(/^['"]|['"]$/g, '');
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

loadEnvFile();

export const config = {
  discordToken: process.env.DISCORD_TOKEN ?? '',
  discordClientId: process.env.DISCORD_CLIENT_ID ?? '',
  soundCloudClientId: process.env.SOUNDCLOUD_CLIENT_ID ?? '',
  soundCloudOAuthToken: process.env.SOUNDCLOUD_OAUTH_TOKEN ?? '',
  dashboardPort: Number(process.env.DASHBOARD_PORT ?? 3000),
  dataFile: process.env.DATA_FILE ?? './data/playlists.json',
  commandPrefix: process.env.DISCORD_COMMAND_PREFIX ?? '!sc',
};
