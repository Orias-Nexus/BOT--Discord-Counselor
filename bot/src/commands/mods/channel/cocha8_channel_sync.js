// src/commands/mods/channel/cocha8_channel_sync.js

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel_sync')
        .setDescription('Đồng bộ quyền của kênh với danh mục')
        .addChannelOption((o) =>
            o
                .setName('target')
                .setDescription('Chọn kênh cần đồng bộ quyền với danh mục')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction, client) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
                content: 'Bạn không có quyền quản lý kênh.',
                flags: MessageFlags.Ephemeral,
            });
        }
        const script = client.scripts.get('sccha8_channel_sync');
        if (!script) return interaction.reply({ content: '❌ Script not found', flags: MessageFlags.Ephemeral });
        await script(interaction, client);
    },
};
