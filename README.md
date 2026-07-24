SonClo_Playlisting - Discord SoundCloud Playlist Bot

## 何ができるか

このアプリは、Discordのチャンネルに貼られたSoundCloudリンクを自動で集め、チャンネルごとのプレイリストとして整理します。

できることは主に3つです。

1. Discord上のSoundCloudリンクを自動で見つける
2. チャンネルごとに曲を内部ファイルへ保存する
3. 管理画面でチャンネル別プレイリストを見る

SoundCloudの認証情報を設定すると、保存した曲をSoundCloud側のプレイリストへ反映することもできます。


### 設定を変える場所

同じフォルダにある `.env` ファイルを書き替えます。主に次の項目を変更します。

- `DISCORD_TOKEN`: Discord Botの秘密トークン
- `DISCORD_CLIENT_ID`: Discord BotのClient ID
- `SOUNDCLOUD_CLIENT_ID`: SoundCloud APIのClient ID
- `SOUNDCLOUD_OAUTH_TOKEN`: SoundCloudへプレイリストを反映するためのトークン
- `DASHBOARD_PORT`: 管理画面を開くポート番号
- `DATA_FILE`: 曲一覧を保存するファイルの場所

## 実装手順

### 1. 必要なものを入れる（GitBashなどコマンドで）

```bash
npm install
```

### 2. `.env` を書き替える

`.env` をテキストエディタで開き、`replace_with_...` と書かれた部分を自分の値に置き換えます。

### 3. Discord Botを起動する

```bash
npm run bot
```

### 4. 管理画面を起動する

別のターミナルで次を実行します。

```bash
npm start
```

ブラウザで `http://localhost:3000` を開くと、プレイリストを確認できます。

## 注意

- `.env` には秘密情報が入るため、他人に見せないでください。
- 曲データは初期設定では `data/playlists.json` に保存されます。
- SoundCloud側の仕様や権限によって、外部プレイリストへの反映には追加のAPI設定が必要になる場合があります。
