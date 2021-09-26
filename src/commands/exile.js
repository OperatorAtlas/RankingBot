const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');

const config = {
  description: 'Exiles a user from the group.',
  aliases: ['e', 'ex'],
  usage: '<username>',  rolesRequired: ['exile'],
  category: 'Ranking'
}

module.exports = {
  config,
  run: async (client, message, args) => {
    let embed = new Discord.MessageEmbed();

    let username = args[0];
    if (!username) {
      embed.setDescription(`Missing arguments.\n\nUsage: \`${client.config.prefix}${path.basename(__filename).split('.')[0]}${' ' + config.usage || ''}\``);
      embed.setColor(client.config.colors.error);
      embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
      return message.channel.send(embed);
    }

    let id;
    try {
      id = await roblox.getIdFromUsername(username);
    } catch (err) {
      embed.setDescription(`${username} is not a Roblox user.`);
      embed.setColor(client.config.colors.error);
      embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
      return message.channel.send(embed);
    }

    let rankInGroup = await roblox.getRankInGroup(client.config.groupId, id);
    let linkedUser = await client.utils.getLinkedUser(message.author.id, message.guild.id);
    if (client.config.verificationChecks === true) {
      if (!linkedUser) {
        embed.setDescription('You must be verified to use this command.\n\nhttps://blox.link');
        embed.setColor(client.config.colors.error);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        return message.channel.send(embed);
      }

      if (linkedUser == id) {
        embed.setDescription('You can\'t exile yourself!');
        embed.setColor(client.config.colors.error);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        return message.channel.send(embed);
      }

      let linkedUserRankInGroup = await roblox.getRankInGroup(client.config.groupId, linkedUser);
      if (rankInGroup >= linkedUserRankInGroup) {
        embed.setDescription('You can only exile people with a rank lower than yours.');
        embed.setColor(client.config.colors.error);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        return message.channel.send(embed);
      }
    }

    let rankNameInGroup = await roblox.getRankNameInGroup(client.config.groupId, id);
    let rankingInfo;
    try {
      rankingInfo = await roblox.exile(client.config.groupId, id);
    } catch (err) {
      console.log(`Error: ${err}`);
      embed.setDescription('An unexpected error has occured. Please ping Atlas to get this error logged and fixed.');
      embed.setColor(client.config.colors.error);
      embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
      return message.channel.send(embed);
    }

    embed.setDescription(`Exiled ${username}`);
    embed.setColor(client.config.colors.success);
    embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
    message.channel.send(embed);

    if (linkedUser) {
      let linkedUserName = await roblox.getUsernameFromId(linkedUser);
      await client.recordRankEvent({
        userId: linkedUser,
        username: linkedUserName,
        rank: "exiled"
      });
    }

    if (client.config.logChannelId !== 'false') {
      let logEmbed = new Discord.MessageEmbed();
      let logChannel = await client.channels.fetch(client.config.logChannelId);
      logEmbed.setDescription(`**Moderator:** <@${message.author.id}> (\`${message.author.id}\`)\n**Action:** Exile\n**User:** ${username} (\`${id}\`)\n**Rank Change:** ${rankNameInGroup} (${rankInGroup}) -> Exiled`);
      logEmbed.setColor(client.config.colors.info);
      logEmbed.setAuthor(message.author.tag, message.author.displayAvatarURL());
      logEmbed.setTimestamp();
      logEmbed.setThumbnail(`https://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${username}`);
      return logChannel.send(logEmbed);
    } else {
      return;
    }
  }
}