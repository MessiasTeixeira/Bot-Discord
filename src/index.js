require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Bot logado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  const args = message.content.split(' ');
  const command = args[0].toLowerCase();
  if (message.author.bot) return;

  const match = message.content.match(/^!(\d*)d(\d+)$/i);

  if (match) {
      const amount = match[1] ? Number(match[1]) : 1;
      const sides = Number(match[2]);

      if (!isNaN(amount) && !isNaN(sides)) {
          const results = [];
          for (let i = 0; i < amount; i++) {
              results.push(Math.floor(Math.random() * sides) + 1);
          }
      const mensagem = results
          .map((valor) => `d${sides} -> ${valor}`)
          .join('\n');

      message.channel.send(`Resultado da rolagem de ${amount}d${sides} feito por ${message.author}:\n${mensagem}`);
      }
  }

  switch(command) {
      case '!ping':
          message.channel.send('Pong!');
          break;

        case '!userinfo':
            message.channel.send(`Seu ID: ${message.author.id}`);
            break;

        case '!help':
            message.channel.send('Comandos: !ping, !userinfo, !help, !clear <número>, !<quantidade>d<lados> para rolar dados (ex: !2d6)');
            break;

        case '!clear':
            const args = message.content.split(' ');
            const amount = parseInt(args[1]);
            if (!amount || isNaN(amount) || amount < 1 || amount > 100) {
                message.channel.send('Você precisa especificar um número entre 1 e 100, anta do caralho.');
                break;
            }
            message.channel.bulkDelete(amount + 1, true);
        break;

    

        default:
            break;
    }
});

client.login(process.env.DISCORD_TOKEN);
