const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');

const config = {
  description: 'Shows group info or user info.',
  aliases: ['i', 'information'],
  usage: '[username/user id] [--id]',
  rolesRequired: ['perm'],
  category: 'Other'
}

module.exports = {
  config,
  run: async (client, message, args) => {
    let embed = new Discord.MessageEmbed();
    let userQuery = args[0];
    if (!userQuery) {
      let group = await client.utils.getGroup(client.config.groupId);
      embed.setDescription(`**${group.name} - Group Info**\n\nID: \`${group.id}\`\nOwner: ${group.owner.username} (\`${group.owner.userId}\`)\nMember Count: ${group.memberCount}\nShout:\n> ${group.shout.body || '*There is no shout.*'}\n\n${group.publicEntryAllowed ? `[Join Group](https://roblox.com/groups/${group.id})` : `[Request to Join Group](https://roblox.com/groups/${group.id})`}`);
      embed.setColor(client.config.colors.info);
      embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
      return message.channel.send(embed);
    }

    let id;
    if (args[1] === '--id' || args[1] === '-id') {
      id = args[0];
    } else {
      try {
        id = await roblox.getIdFromUsername(userQuery);
      } catch (err) {
        embed.setDescription(`${userQuery} is not a Roblox user.`);
        embed.setColor(client.config.colors.error);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        return message.channel.send(embed);
      }
    }

    let user;
    try {
      user = await client.utils.getUser(id);
    } catch (err) {
      embed.setDescription(`${userQuery} is not a Roblox user.`);
      embed.setColor(client.config.colors.error);
      embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
      return message.channel.send(embed);
    }
    if (user.errors) {
      embed.setDescription(`${userQuery} is not a Roblox user.`);
      embed.setColor(client.config.colors.error);
      embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
      return message.channel.send(embed);
    }

    let rankInGroup = await roblox.getRankInGroup(client.config.groupId, id);
    let rankNameInGroup = await roblox.getRankNameInGroup(client.config.groupId, id);
    let rankInGroupM = await roblox.getRankInGroup(client.config.mainId, id);
    let rankNameInGroupM = await roblox.getRankNameInGroup(client.config.mainId, id);
    let rankInGroupC = await roblox.getRankInGroup(client.config.cssId, id);
    let rankNameInGroupC = await roblox.getRankNameInGroup(client.config.cssId, id);
    let rankInGroupV = await roblox.getRankInGroup(client.config.vipId, id);
    let rankNameInGroupV = await roblox.getRankNameInGroup(client.config.vipId, id);
    let rankInGroupR = await roblox.getRankInGroup(client.config.rgId, id);
    let rankNameInGroupR = await roblox.getRankNameInGroup(client.config.rgId, id);
    let rankInGroupMTM = await roblox.getRankInGroup(client.config.mtmId, id);
    let rankNameInGroupMTM = await roblox.getRankNameInGroup(client.config.mtmId, id);
    let rankInGroupHOST = await roblox.getRankInGroup(client.config.hostId, id);
    let rankNameInGroupHOST = await roblox.getRankNameInGroup(client.config.hostId, id);
    let rankInGroupSL = await roblox.getRankInGroup(client.config.slId, id);
    let rankNameInGroupSL = await roblox.getRankNameInGroup(client.config.slId, id);
    embed.setDescription(`**${user.Username} - User Info**\n\nUser ID: \`${user.Id}\`\n\n**Group Ranks**\n\nSpetsnaz:\n${rankNameInGroup} (\`${rankInGroup}\`)\n\nBlox Channel:\n${rankNameInGroupM} (\`${rankInGroupM}\`)\n\nCommittee for State Security:\n${rankNameInGroupC} (\`${rankInGroupC}\`)\n\nVIP:\n${rankNameInGroupV} (\`${rankInGroupV}\`)\n\nRedguard:\n${rankNameInGroupR} (\`${rankInGroupR}\`)\n\nMidtown Tsarists:\n${rankNameInGroupMTM} (\`${rankInGroupMTM}\`)\n\nHostiles:\n${rankNameInGroupHOST} (\`${rankInGroupHOST}\`)\n\nSmithlands:\n${rankNameInGroupSL} (\`${rankInGroupSL}\`)\n\n\n[Roblox Profile](https://roblox.com/users/${user.Id}/profile)`);
    embed.setColor(client.config.colors.info);
    embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
    return message.channel.send(embed);
  }
}