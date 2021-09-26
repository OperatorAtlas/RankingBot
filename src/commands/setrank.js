const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');

const config = {
  description: 'Ranks a user in the Roblox group.',
  aliases: ['sr', 'rank', 'set', 'setr', 'srank'],
  usage: '<username> <role name/rank>',
  rolesRequired: ['perm'],
  category: 'Ranking'
}

let getRankFromName = async (func_rankname, func_group) => {
  let roles = await roblox.getRoles(func_group);
  let role = await roles.find(rank => rank.name.toLowerCase() === func_rankname.toLowerCase());
  if (!role) {
    return null;
  } else {
    return role.rank;
  }
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

    let rank = args[1];
    if (!rank) {
      embed.setDescription(`Missing arguments.\n\nUsage: \`${client.config.prefix}${path.basename(__filename).split('.')[0]}${' ' + config.usage || ''}\``);
      embed.setColor(client.config.colors.error);
      embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
      return message.channel.send(embed);
    }

    if (/[^0-9]+/gm.test(rank)) {
      let rankArgs = args.slice(1).join(' ');
      if (!rankArgs) {
        embed.setDescription(`Missing (or invalid) arguments.\n\nUsage: \`${client.config.prefix}${path.basename(__filename).split('.')[0]}${' ' + config.usage || ''}\``);
        embed.setColor(client.config.colors.error);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        return message.channel.send(embed);
      }
      let rankSearch = await getRankFromName(rankArgs, client.config.groupId);
      if (!rankSearch) {
        embed.setDescription('The specified rank does not exist.');
        embed.setColor(client.config.colors.error);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        return message.channel.send(embed);
      }
      rank = rankSearch;
    }

    let id;
    try {
      id = await roblox.getIdFromUsername(username);
      groupid = await roblox.groupId
    } catch (err) {
      embed.setDescription(`${username} is not a Roblox user.`);
      embed.setColor(client.config.colors.error);
      embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
      return message.channel.send(embed);
    }

    let rankInGroup = await roblox.getRankInGroup(client.config.groupId, id);
    let rankingTo = rankInGroup - 1;
    if (client.config.maximumRank <= rankInGroup || client.config.maximumRank <= rank) {
      embed.setDescription('This bot cannot rank this user due to the maximum rank configured.');
      embed.setColor(client.config.colors.error);
      embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
      return message.channel.send(embed);
    }

    if (rankInGroup === 0) {
      embed.setDescription('That user is not in the group.');
      embed.setColor(client.config.colors.error);
      embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
      return message.channel.send(embed);
    }

    let linkedUser = await client.utils.getLinkedUser(message.author.id, message.guild.id);
    if (client.config.verificationChecks === true) {
      if (!linkedUser) {
        embed.setDescription('You must be verified to use this command.\n\nhttps://blox.link');
        embed.setColor(client.config.colors.error);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        return message.channel.send(embed);
      }

      if (linkedUser == id) {
        embed.setDescription('You can\'t rank yourself!');
        embed.setColor(client.config.colors.error);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        return message.channel.send(embed);
      }

      let linkedUserRankInGroup = await roblox.getRankInGroup(client.config.groupId, linkedUser);
      if (rankInGroup >= linkedUserRankInGroup || rank >= linkedUserRankInGroup) {
        embed.setDescription('You can only rank people with a rank lower than yours, to a rank that is also lower than yours.');
        embed.setColor(client.config.colors.error);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        return message.channel.send(embed);
      }
    }

    let rankNameInGroup = await roblox.getRankNameInGroup(client.config.groupId, id);
    let rankingInfo;
    try {
      rankingInfo = await roblox.setRank(client.config.groupId, id, Number(rank));
    } catch (err) {
      console.log(`Error: ${err}`);
      embed.setDescription('An unexpected error has occured. Please ping Atlas to get this error logged and fixed.');
      embed.setColor(client.config.colors.error);
      embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
      return message.channel.send(embed);
    }

    embed.setDescription(`Ranked ${username} to ${rankingInfo.name} (${rankingInfo.rank}).`);
    embed.setColor(client.config.colors.success);
    embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
    message.channel.send(embed);

    if (linkedUser) {
      let linkedUserName = await roblox.getUsernameFromId(linkedUser);
      await client.recordRankEvent({
        userId: linkedUser,
        username: linkedUserName,
        rank: rankingTo
      });
    }

    if (client.config.logChannelId !== 'false') {
      let logEmbed = new Discord.MessageEmbed();
      let logChannel = await client.channels.fetch(client.config.logChannelId);
      logEmbed.setDescription(`**Moderator:** <@${message.author.id}> (\`${message.author.id}\`)\n**Action:** Set Rank\n**User:** ${username} (\`${id}\`)\n**Rank Change:** ${rankNameInGroup} (${rankInGroup}) -> ${rankingInfo.name} (${rankingInfo.rank})`);
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