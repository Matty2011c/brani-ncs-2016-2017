const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.once('ready', () => {
  console.log(`Connesso come ${client.user.tag}`);
  const channel = client.channels.cache.get(process.env.CHANNEL_ID);
  if (!channel) return console.error('Canale vocale non trovato!');

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
  connection.subscribe(player);

  const musicDir = path.join(__dirname, 'music');
  const playNext = () => {
    const files = fs.readdirSync(musicDir).filter(f => f.endsWith('.mp3') || f.endsWith('.ogg'));
    if (files.length === 0) return console.error('Nessun brano trovato in /music');
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const resource = createAudioResource(path.join(musicDir, randomFile));
    player.play(resource);
  };

  player.on(AudioPlayerStatus.Idle, playNext);
  playNext();
});

client.login(process.env.TOKEN);
