// src/scripts/mods/channel/sccha8_channel_sync.js

const { MessageFlags } = require('discord.js');

module.exports = async function channelSync(interaction, client) {
    const channel = interaction.options.getChannel('target');
    if (!channel) {
        return interaction.reply({
            content: 'Vui lòng chọn một kênh.',
            flags: MessageFlags.Ephemeral,
        });
    }
    if (!channel.parent) {
        return interaction.reply({
            content: 'Kênh không thuộc danh mục nào.',
            flags: MessageFlags.Ephemeral,
        });
    }
    try {
        await channel.lockPermissions();
        return interaction.reply({
            content: `Đã đồng bộ quyền của **${channel.name}** với danh mục **${channel.parent.name}**.`,
            flags: MessageFlags.Ephemeral,
        });
    } catch (err) {
        return interaction.reply({
            content: `Không đồng bộ được: ${err.message}`,
            flags: MessageFlags.Ephemeral,
        });
    }
};
