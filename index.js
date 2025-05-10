require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!pokemove')) return;

  const member = message.mentions.members.first();
  if (!member) return message.reply('กรุณา mention ผู้ใช้ เช่น `!pokemove @user`');

  const voiceChannel = member.voice.channel;
  if (!voiceChannel) return message.reply('ผู้ใช้นี้ไม่ได้อยู่ใน Voice Channel');

  const afkChannel = message.guild.afkChannel;
  if (!afkChannel) return message.reply('ไม่พบ AFK channel ในเซิร์ฟเวอร์นี้');

  try {
    // ย้ายไป AFK
    await member.voice.setChannel(afkChannel);
    // รอ 2 วินาที
    setTimeout(async () => {
      await member.voice.setChannel(voiceChannel);
      message.reply(`✅ poke แล้วโยกย้าย ${member.user.username} เสร็จเรียบร้อย!`);
    }, 2000);
  } catch (err) {
    console.error(err);
    message.reply('❌ ไม่สามารถย้ายผู้ใช้นี้ได้ อาจไม่มีสิทธิ์หรือเกิดข้อผิดพลาด');
  }
});

client.login(process.env.DISCORD_TOKEN);
