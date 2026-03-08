// src/commands/mods/channel/cocha7_category_info.js

const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('category_info')
        .setDescription('Xem và quản lý danh mục')
        .addChannelOption((o) =>
            o
                .setName('target')
                .setDescription('Chọn danh mục')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildCategory)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction, client) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
                content: 'Bạn không có quyền quản lý kênh.',
                ephemeral: true,
            });
        }
        const script = client.scripts.get('sccha7_category_info');
        if (!script) return interaction.reply({ content: '❌ Script not found', ephemeral: true });
        await script(interaction, client);
    },
};
