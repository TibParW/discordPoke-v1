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

    const pokeMessage = args.slice(2).join(' ') || 'โป๊ก!!!';
    const voiceChannel = member.voice.channel;
    const afkChannel = message.guild.afkChannel;

    if (!voiceChannel) return message.reply('ผู้ใช้นี้ไม่ได้อยู่ใน Voice Channel');
    if (!afkChannel) return message.reply('ไม่พบ AFK channel ในเซิร์ฟเวอร์นี้');

    try {
      await member.send(pokeMessage);
      await message.channel.send(`${member}, ${pokeMessage}`);

      let active = true;

      // เริ่มการโยกย้ายวนลูป
      const loopPoke = async () => {
        while (active) {
          if (!member.voice.channel) {
            message.channel.send(`❌ ${member.user.username} ออกจาก Voice Channel แล้ว หยุด poke`);
            break;
          }

          try {
            await member.voice.setChannel(afkChannel);
            await member.send('🔔 Poke Alert! 🔔');
            await message.channel.send({
              content: `${member} โดน poke!`,
              files: ['https://media.giphy.com/media/l41Yq4Tnlg1B0uMnO/giphy.gif'],
            });

            await new Promise((res) => setTimeout(res, 2000));

            if (member.voice.channel && member.voice.channel.id === afkChannel.id) {
              await member.voice.setChannel(voiceChannel);
              await member.send(`✅ ย้ายกลับไปห้องเดิมแล้ว`);
            }

            await new Promise((res) => setTimeout(res, 2000));
          } catch (err) {
            console.error('❌ เกิดข้อผิดพลาดระหว่างโยกย้าย:', err);
            message.channel.send(`❌ ไม่สามารถย้ายผู้ใช้นี้ได้: ${err.message}`);
            break;
          }
        }
      };

      loopPoke();

    } catch (err) {
      console.error('❌ ERROR in Poke process:', err);
      message.reply('❌ ไม่สามารถดำเนินการ poke ได้: ' + err.message);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
