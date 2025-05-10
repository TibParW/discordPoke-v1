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

  // คำสั่ง !poke @user [ข้อความ]
  if (message.content.startsWith('!poke')) {
    const args = message.content.split(' ');
    const member = message.mentions.members.first();
    if (!member) return message.reply('กรุณา mention ผู้ใช้ เช่น `!poke @user [ข้อความ]`');
    
    const pokeMessage = args.slice(2).join(' ') || 'โป๊ก!!!'; // ข้อความที่ส่งไป

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) return message.reply('ผู้ใช้นี้ไม่ได้อยู่ใน Voice Channel');
    
    const afkChannel = message.guild.afkChannel;
    if (!afkChannel) return message.reply('ไม่พบ AFK channel ในเซิร์ฟเวอร์นี้');

    try {
      // ส่งข้อความไปยัง DM
      await member.send(`${pokeMessage}`);
      
      // ส่งข้อความในช่องแชท
      message.channel.send(`${member}, ${pokeMessage}`);

      // สลับช่องผู้ใช้ไป AFK
      await member.voice.setChannel(afkChannel);

      // ส่งเสียงเตือน (Ping)
      member.send('🔔 Poke Alert! 🔔');
      
      // ถ้ามี GIF เพิ่มเติม
      message.channel.send({ 
        content: `${member} โดน poke!`, 
        files: ['https://media.giphy.com/media/l41Yq4Tnlg1B0uMnO/giphy.gif'] // ใส่ GIF ที่ต้องการ
      });

      // รอ 2 วินาทีแล้วกลับไปช่องเดิม
      setTimeout(async () => {
        await member.voice.setChannel(voiceChannel);
        message.reply(`✅ Poke เสร็จเรียบร้อย! ${member.user.username} กลับไปที่ช่องเดิม`);
      }, 2000);

    } catch (err) {
      console.error(err);
      message.reply('❌ ไม่สามารถย้ายผู้ใช้นี้ได้ อาจไม่มีสิทธิ์หรือเกิดข้อผิดพลาด');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
