// src/scripts/logs/sclog2_bot_info.js

const { EmbedBuilder, version: djsVersion } = require('discord.js');
const config = require('../../.config');
const mainImageURL = config.resource.mainImageURL;

module.exports = async (interaction, client) => {
    const sent = await interaction.reply({ content: 'Đang lấy dữ liệu...', fetchReply: true });
    
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const wsPing = client.ws.ping;
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalGuilds = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

    const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('✦ Orias\'s Pet ✦')
        .addFields(
            { name: 'Network', value: `**Ping:** ${roundtrip}ms\n**API:** ${wsPing}ms`, inline: true },
            { name: 'System', value: `**RAM:** ${memoryUsage} MB\n**Node.js:** ${process.version}`, inline: true },
            { name: 'Stats', value: `**Servers:** ${totalGuilds}\n**Users:** ${totalUsers}`, inline: true },
            { name: 'Library', value: `**Discord.js:** v${djsVersion}`, inline: true },
            { name: 'Uptime', value: `<t:${Math.floor(Date.now() / 1000 - client.uptime / 1000)}:R>`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true }
        ).setImage(mainImageURL).setTimestamp();

    await interaction.editReply({ content: null, embeds: [embed] });
};