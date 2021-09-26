const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');

const config = {
  description: 'Clears the shout in the Roblox group.',
  aliases: ['cshout', 'cs', 'fuckoffshout', 'fuckyoushout', 'fucktheshoutbecauseitlitterlyisntneededherelikewhatthefuckguysremovethisdumbshitassshoutbrofuckyou', 'fuckshout', 'fuckupshout', 'shutthefuckupshout'],
  usage: '',
  rolesRequired: ['perm'],
  category: 'Group Shouts'
}

module.exports = {
  config,
  run: async (client, message, args) => {
    let embed = new Discord.MessageEmbed();

    let shoutInfo;
    try {
      shoutInfo = await roblox.shout(client.config.groupId, '');
    } catch (err) {
      console.log(`Error: ${err}`);
      embed.setDescription('An unexpected error has occured. Please ping Atlas to get this error logged and fixed.');
      embed.setColor(client.config.colors.error);
      embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
      return message.channel.send(embed);
    }

    embed.setDescription(`Cleared the group shout.`);
    embed.setColor(client.config.colors.success);
    embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
    message.channel.send(embed);

    if (client.config.logChannelId !== 'false') {
      let logEmbed = new Discord.MessageEmbed();
      let logChannel = await client.channels.fetch(client.config.logChannelId);
      logEmbed.setDescription(`**Moderator:** <@${message.author.id}> (\`${message.author.id}\`)\n**Action:** Cleared Shout`);
      logEmbed.setColor(client.config.colors.info);
      logEmbed.setAuthor(message.author.tag, message.author.displayAvatarURL());
      logEmbed.setTimestamp();
      return logChannel.send(logEmbed);
    } else {
      return;
    }
  }
}