// src/commands/mods/server/coser1_server_info.js

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server_info')
        .setDescription('Xem thông tin server')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction, client) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                content: 'Bạn không có quyền quản trị server.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const script = client.scripts.get('scser1_server_info');
        if (!script) return interaction.reply({ content: '❌ Script not found', flags: MessageFlags.Ephemeral });
        await script(interaction, client);
    },
};
