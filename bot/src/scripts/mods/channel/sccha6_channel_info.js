// src/scripts/mods/channel/sccha6_channel_info.js

const { buildChannelEmbed, buildChannelComponents } = require('../../../utils/channelInfoEmbed.js');

module.exports = async function showChannelInfo(interaction, client) {
    const guild = interaction.guild;
    const channel = interaction.options.getChannel('target');
    if (!channel) {
        return interaction.reply({
            content: 'Vui lòng chọn một kênh.',
            ephemeral: true,
        });
    }
    const embed = buildChannelEmbed(channel, guild);
    const { row } = buildChannelComponents(channel.id, guild, channel);
    await interaction.reply({ embeds: [embed], components: [row] });
};
