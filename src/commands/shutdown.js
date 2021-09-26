const { Client, Intents } = require('discord.js');
const Discord = require('discord.js');
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

const config = {
  description: 'Shuts the bot down.',
  aliases: ['sd', 'shutd', 'sdown', 'shut', 'fuckyou'],
  usage: '',
  rolesRequired: ['shut'],
  category: 'Other'
}

module.exports = {
  config,
  run: async (client, message, args) => {
    client.destroy();
  }
}