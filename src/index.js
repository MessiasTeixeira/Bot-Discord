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
    const match = message.content.match(/^!(\d*)d(\d+)((?:\+(?:\d+d\d+|\d+|d\d+))*)\s*(.*)?$/i);

    if (match) {
        const amount = match[1] ? Number(match[1]) : 1;
        const sides = Number(match[2]);

        let results = [];       // valores dos dados
        let dicesMeta = [];     // lados dos dados na mesma ordem
        let simplesSum = [];    // +x

        // ======== 1) ROLAGEM PRINCIPAL ========
        for (let i = 0; i < amount; i++) {
            results.push(Math.floor(Math.random() * sides) + 1);
            dicesMeta.push(sides);
        }

        // ======== 2) MODIFICADORES EXTRAS ========
        if (match[3]) {
            let variant = [];  // +dx
            let variantQ = []; // +ydx

            const split = match[3].split("+").filter(s => s !== "");

            for (const dices of split) {
                if (/^\d+d\d+$/i.test(dices)) {
                    variantQ.push(dices); // ydx
                } else if (/^\d+$/i.test(dices)) {
                    simplesSum.push(parseInt(dices)); // +x
                } else if (/^d\d+$/i.test(dices)) {
                    variant.push(dices); // dx
                }
            }

            // ======== +dx ========
            for (let i = 0; i < variant.length; i++) {
                const faces = parseInt(variant[i].slice(1));
                results.push(Math.floor(Math.random() * faces) + 1);
                dicesMeta.push(faces);
            }

            // ======== +ydx ========
            for (let i = 0; i < variantQ.length; i++) {
                const parts = variantQ[i].split("d");
                const qtd = parseInt(parts[0]);
                const faces = parseInt(parts[1]);

                for (let j = 0; j < qtd; j++) {
                    results.push(Math.floor(Math.random() * faces) + 1);
                    dicesMeta.push(faces);
                }
            }
        }

        // ======== 3) MENSAGEM BONITA ========
        let mensagem = results
            .map((value, i) => `\`\`\`d${dicesMeta[i]} ➜ ${value}\`\`\``)
            .join("\n");

        // ======== 4) SOMATÓRIO FINAL ========
        const trueResult = results.concat(simplesSum);
        const total = trueResult.reduce((a, b) => a + b, 0);
        const operation = trueResult.join(" + ");

        message.channel.send(`
        Resultado da rolagem de ${amount}d${sides}${match[3] ?? ""}, feito por ${message.author}:
        ${match[4] ? `# ${match[4].trim()}\n` : ""}
        ${mensagem}
        \`\`\`${operation}\`\`\`
        Total: \`${total}\`
        `);
        return;
    }


    const args = message.content.trim().split(/ +/g);
    const command = args[0].toLowerCase();

    switch (command) {
        case '!ping':
            message.channel.send('Pong!');
            break;

        case '!userinfo':
            message.channel.send(`Seu ID: ${message.author.id}`);
            break;

        case '!help':
            message.channel.send('`Comandos: !ping, !userinfo, !help, !clear <número>, !<quantidade>d<lados> para rolar dados (ex: !2d6)`');
            break;

        case '!clear': {
            const deleteAmount = parseInt(args[1]);
            if (!deleteAmount || isNaN(deleteAmount) || deleteAmount < 1 || deleteAmount > 100) {
                message.channel.send('Você precisa especificar um número entre 1 e 100.');
                break;
            }
            message.channel.bulkDelete(deleteAmount + 1, true);
            break;
        }

        default:
            break;
    }
});

client.login(process.env.DISCORD_TOKEN);
