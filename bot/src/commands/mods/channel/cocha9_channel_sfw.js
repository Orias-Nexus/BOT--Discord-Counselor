// src/commands/mods/channel/cocha9_channel_sfw.js

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel_sfw')
        .setDescription('Chuyển đổi trạng thái SFW/NSFW của kênh')
        .addChannelOption((o) =>
            o
                .setName('target')
                .setDescription('Chọn kênh cần đổi SFW/NSFW')
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
        const script = client.scripts.get('sccha9_channel_sfw');
        if (!script) return interaction.reply({ content: '❌ Script not found', flags: MessageFlags.Ephemeral });
        await script(interaction, client);
    },
};
