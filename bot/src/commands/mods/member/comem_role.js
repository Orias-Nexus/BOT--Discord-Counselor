const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function hasManagePermission(member) {
    return (
        member.permissions.has(PermissionFlagsBits.ManageGuild) ||
        member.permissions.has(PermissionFlagsBits.ModerateMembers)
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('member_role')
        .setDescription('Gán vai trò cho thành viên')
        .addUserOption((o) => o.setName('target').setDescription('Thành viên').setRequired(true))
        .addRoleOption((o) => o.setName('role').setDescription('Vai trò').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction, client) {
        if (!hasManagePermission(interaction.member)) {
            return interaction.reply({ content: 'Bạn không có quyền.', ephemeral: true });
        }
        const script = client.scripts.get('scmem_role');
        if (!script) return interaction.reply({ content: '❌ Script not found', ephemeral: true });
        await script(interaction, client);
    },
};
