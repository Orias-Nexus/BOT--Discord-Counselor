// src/scripts/mods/channel/sccha9_channel_sfw.js

const { MessageFlags } = require('discord.js');

module.exports = async function channelSfw(interaction, client) {
    const channel = interaction.options.getChannel('target');
    if (!channel) {
        return interaction.reply({
            content: 'Vui lòng chọn một kênh.',
            flags: MessageFlags.Ephemeral,
        });
    }
    try {
        const newNsfw = !channel.nsfw;
        await channel.setNSFW(newNsfw);
        return interaction.reply({
            content: `Đã đổi **${channel.name}** sang ${newNsfw ? 'NSFW' : 'SFW'}.`,
            flags: MessageFlags.Ephemeral,
        });
    } catch (err) {
        return interaction.reply({
            content: `Không đổi được (kênh có thể không hỗ trợ NSFW): ${err.message}`,
            flags: MessageFlags.Ephemeral,
        });
    }
};
