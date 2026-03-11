// src/commands/mods/channel/cocha6_channel_info.js

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel_info')
        .setDescription('Xem và quản lý kênh')
        .addChannelOption((o) =>
            o
                .setName('target')
                .setDescription('Chọn kênh (hiển thị tất cả kênh)')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction, client) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
                content: 'Bạn không có quyền quản lý kênh.',
                ephemeral: true,
            });
        }
        const script = client.scripts.get('sccha6_channel_info');
        if (!script) return interaction.reply({ content: '❌ Script not found', ephemeral: true });
        await script(interaction, client);
    },
};
