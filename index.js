require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

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

  if (message.content.startsWith('!poke')) {
    const args = message.content.split(' ');
    const member = message.mentions.members.first();
    if (!member) return message.reply('กรุณา mention ผู้ใช้ เช่น `!poke @user [ข้อความ]`');

    const pokeMessage = args.slice(2).join(' ') || 'โป๊ก!!!';
    const voiceChannel = member.voice.channel;
    const afkChannel = message.guild.afkChannel;

    if (!voiceChannel) return message.reply('ผู้ใช้นี้ไม่ได้อยู่ใน Voice Channel');
    if (!afkChannel) return message.reply('ไม่พบ AFK channel ในเซิร์ฟเวอร์นี้');

    const botMember = message.guild.members.me;
    if (!voiceChannel.permissionsFor(botMember).has(PermissionsBitField.Flags.MoveMembers)) {
      return message.reply('❌ บอทไม่มีสิทธิ์ Move Members ในช่องเสียงนี้');
    }

    if (member.roles.highest.position >= botMember.roles.highest.position) {
      return message.reply('❌ บอทไม่สามารถย้ายผู้ใช้ที่มี Role สูงกว่าหรือเท่ากันได้');
    }

    try {
      await member.send(`${pokeMessage}\n🔔 โป๊ก! คุณกำลังโดนก่อกวน จงออกแล้วเข้าห้องใหม่เพื่อหยุด`);
      await member.send({ files: ['https://media.giphy.com/media/l41Yq4Tnlg1B0uMnO/giphy.gif'] });

      let originalChannel = voiceChannel;

      const loopInterval = setInterval(async () => {
        const currentVoice = member.voice.channel;

        // ถ้าไม่ได้อยู่ใน voice หรือออกเอง ให้หยุด loop
        if (!currentVoice || currentVoice.id !== originalChannel.id) {
          clearInterval(loopInterval);
          await member.send('✅ หยุด poke แล้ว! คุณออกจากห้องเดิมหรือเปลี่ยนห้องเองแล้ว');
          return;
        }

        try {
          await member.voice.setChannel(afkChannel);
          setTimeout(async () => {
            // ตรวจสอบอีกครั้งก่อนจะย้ายกลับ
            if (member.voice.channel && member.voice.channel.id === afkChannel.id) {
              await member.voice.setChannel(originalChannel);
            }
          }, 1000); // กลับมาห้องเดิมใน 1 วิ
        } catch (err) {
          console.error('Error while toggling voice:', err);
          clearInterval(loopInterval);
          await member.send('❌ เกิดข้อผิดพลาดระหว่าง poke');
        }
      }, 2500); // ทุก 2.5 วิ สลับอีกครั้ง

    } catch (err) {
      console.error(err);
      message.reply('❌ ไม่สามารถย้ายผู้ใช้นี้ได้ อาจไม่มีสิทธิ์หรือเกิดข้อผิดพลาด');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
