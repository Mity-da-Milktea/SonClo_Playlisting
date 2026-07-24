SonClo_Playlisting - Discord SoundCloud Playlist Bot


## 注意

- 設定ファイルの `.env` には秘密情報が入るため、他人に見せないでください。
- Discord Bot TokenをGitHubへ公開しないでください。
- 曲データは初期設定では `data/playlists.json` に保存されます。
- Botを動かすには、Discord側でBotをサーバーに招待し、メッセージ内容を読む権限を有効にする必要があります。
- SoundCloud側の仕様や権限によって、外部プレイリストへの反映には追加のAPI設定が必要になる場合があります。
- Discord上の再生操作は、テキストチャンネルへ曲URLを順番に表示する簡易再生です。ボイスチャンネルで音声を流すには追加の音声再生実装が必要です。端的に言えば技術不足のため再生機能は未実装。誰かに託します。
- （代替案として、Jockie Music Botなど有名どころの音楽Botを導入し、SoundCloud上に自動で作成したプレイリストを再生することを提言します。）


## 何ができるか

このアプリは、Discordのチャンネルに貼られたSoundCloudリンクを自動で集め、チャンネルごとのプレイリストとして整理します。

できることは主に5つです。

1. Discord上のSoundCloudリンクを自動で見つける
2. チャンネルごとに曲のリンクを内部ファイルへ保存する
3. 管理画面でチャンネル別プレイリストを見る
4. Discord上でプレイリストを操作（後述のBot）
5. `SOUNDCLOUD_OAUTH_TOKEN` が設定済みなら、SoundCloud側に `Discord #チャンネル名` という公開プレイリストを自動で作ります。

SoundCloudの認証情報を設定すると、保存した曲をSoundCloud側のプレイリストへ反映することもできます。


### Discord上でプレイリストを操作する方法

Botは `!sc` から始まるメッセージを操作コマンドとして扱います。

```text
!sc help
```

使える操作は次の通りです。

| 操作 | 内容 |
|---|---|
| `!sc help` | 操作一覧を表示 |
| `!sc playlist` | 今いるチャンネルのプレイリストをDiscord上に表示 |
| `!sc play` | プレイリスト先頭の曲からDiscord上で表示 |
| `!sc next` | 次の曲へ進む |
| `!sc stop` | 案内を停止 |


Discordのボイスチャンネルへ音声そのものを流す本格的な音声再生Botにする場合は、Discord Voice接続、音声エンコード、FFmpegなどの追加実装が必要で、技術力が足りず未実装。

### 管理画面で見る方法

Botを起動したまま、別のターミナルで管理画面を起動します。

```bash
npm start
```

その後、ブラウザで次を開きます。

```text
http://localhost:3000
```

画面にはチャンネルごとのカードが表示され、各カードの中に曲名、投稿者、追加日時などが並びます。

### Botを止める方法

Botを起動しているGit Bash画面で、次のキーを押します。

```text
Ctrl + C
```

管理画面を止める場合も、管理画面を起動しているGit Bash画面で `Ctrl + C` を押します。


### 設定を変える場所

同じフォルダにある `.env` ファイルを書き替えます。主に次の項目を変更します。

- `DISCORD_TOKEN`: Discord Botの秘密トークン
- `DISCORD_CLIENT_ID`: Discord BotのClient ID
- `SOUNDCLOUD_CLIENT_ID`: SoundCloud APIのClient ID
- `SOUNDCLOUD_OAUTH_TOKEN`: SoundCloudへプレイリストを反映するためのトークン
- `DASHBOARD_PORT`: 管理画面を開くポート番号
- `DATA_FILE`: 曲一覧を保存するファイルの場所
- `DISCORD_COMMAND_PREFIX`: Discord上でBotを操作するときの接頭辞。初期値は `!sc`


## 実装手順
（Git Bashの基本操作ができることが前提です）


### 1. Node.jsを用意する

このアプリはNode.jsで動きます。Node.jsのバージョンは22以上を使ってください。

Git Bashで次を実行し、バージョンを確認します。

```bash
node -v
```

`v22.x.x` や `v24.x.x` のように表示されれば大丈夫です。


### 2. プロジェクトフォルダへ移動する

Git Bashで、ダウンロードしたプロジェクトフォルダの場所へ移動します。

```bash
cd /c/中略/SonClo_Playlisting
```

### 3. 必要な準備をする

次を実行します。

```bash
npm install
```

このプロジェクトは外部パッケージを使わない構成ですが、`package-lock.json` を整え、npmで扱える状態にするために実行します。

### 4. Discord Developer PortalでBotを作る

1. ブラウザでDiscord Developer Portalを開きます。
2. `New Application` を押します。
3. アプリ名を入力して作成します。
4. 左側メニューの `Bot` を開きます。
5. `Reset Token` または `View Token` からBot Tokenを取得します。
6. 取得したTokenを `.env` の `DISCORD_TOKEN` に貼り付けます。

### 5. Botにメッセージ内容を読む権限を付ける

SoundCloudリンクを自動で見つけるには、Botがメッセージ本文を読める必要があります。

Discord Developer PortalのBot設定で、次を有効にしてください。

- `MESSAGE CONTENT INTENT`

これを有効にしないと、Botはメッセージの中身を読めず、SoundCloudリンクを検出できません。

### 6. DiscordサーバーへBotを招待する

Discord Developer Portalで、左側メニューの `OAuth2` から招待URLを作ります。

おすすめの設定は次の通りです。

- Scopes: `bot`
- Bot Permissions:
  - `View Channels`
  - `Read Message History`
  - `Send Messages`（将来、Botから通知したい場合）

作成されたURLをブラウザで開き、Botを入れたいDiscordサーバーを選びます。

### 7. `.env` を書き替える

`.env` をテキストエディタで開き、`replace_with_...` と書かれた部分を自分の値に置き換えます。

最低限必要なのは `DISCORD_TOKEN` です。

SoundCloudの情報取得やSoundCloud側への反映を使わない場合、SoundCloud関連の値は最初は `replace_with_...` のままでも動きます。その場合、貼られたURL自体を曲名として保存します。


### SoundCloudの特定アカウントにプレイリストを作る設定

`SOUNDCLOUD_OAUTH_TOKEN` に、そのSoundCloudアカウントで発行したOAuthトークンを入れると、Botはそのアカウント上にチャンネル別プレイリストを作成・更新します。

動き方は次の通りです。

1. DiscordにSoundCloudリンクが貼られます。
2. Botがリンクを検出し、内部の `data/playlists.json` に保存します。
3. `SOUNDCLOUD_OAUTH_TOKEN` が設定済みなら、SoundCloud側に `Discord #チャンネル名` という公開プレイリストを作ります。
4. すでにSoundCloudプレイリストが作成済みのチャンネルでは、新規作成ではなく既存プレイリストを更新します。

注意点として、SoundCloud側へ追加できるのはSoundCloud APIで数値IDを取得できた曲です。`SOUNDCLOUD_CLIENT_ID` が未設定の場合はURLの保存だけになり、SoundCloud上のプレイリスト同期はスキップまたは不完全になります。

### 8. Botを起動する

Git Bashで次を実行します。

```bash
npm run bot
```

エラーが出ずに待機状態になれば、BotはDiscordのメッセージを監視しています。

### 9. 管理画面を起動する

Bot用とは別に、もう1つGit Bashを開きます。プロジェクトフォルダへ移動します。

```bash
cd /c/中略/SonClo_Playlisting
```

次を実行します。

```bash
npm start
```

ブラウザで `http://localhost:3000` を開くと、プレイリストを確認できます。

### 10. 動作確認をする

DiscordでBotを招待したサーバーを開き、任意のテキストチャンネルにSoundCloudリンクを投稿してください。

```text
https://soundcloud.com/example/track
```

その後、管理画面を再読み込みします。チャンネル名のカードと曲が表示されれば成功です。

### 11. Discord上でBot操作を試す

Discordのテキストチャンネルで次を送ります。

```text
!sc help
```

プレイリストを表示する場合は次を送ります。

```text
!sc playlist
```

プレイリストの先頭から再生案内を始める場合は次を送ります。

```text
!sc play
```

次の曲へ進む場合は次を送ります。

```text
!sc next
```

止める場合は次を送ります。

```text
!sc stop
```

### 12. テストを実行する

開発者向けの確認として、次を実行できます。

```bash
npm test
```

リンク抽出やDiscordメッセージURL生成が正しく動くかを確認します。
