require('dotenv').config(); // ใช้ dotenv เพื่อโหลด .env ที่เก็บข้อมูลลับ
const { Client, GatewayIntentBits } = require('discord.js');

// สร้าง Client ที่จะเชื่อมต่อกับ Discord API
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// เมื่อบอทเชื่อมต่อกับ Discord สำเร็จ
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ตรวจจับข้อความที่ถูกส่งเข้ามา
client.on('messageCreate', message => {
  if (message.content === '!ping') {
    message.reply('🏓 Pong!');
  }
});

// ใช้ Token เพื่อให้บอทล็อกอินเข้าสู่ Discord
client.login(process.env.DISCORD_TOKEN);
