const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function hasManagePermission(member) {
    return (
        member.permissions.has(PermissionFlagsBits.ManageGuild) ||
        member.permissions.has(PermissionFlagsBits.ModerateMembers)
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('member_setlevel')
        .setDescription('Đặt level cho thành viên')
        .addUserOption((o) => o.setName('target').setDescription('Thành viên').setRequired(true))
        .addIntegerOption((o) =>
            o.setName('level').setDescription('Level mới').setRequired(true).setMinValue(0)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction, client) {
        if (!hasManagePermission(interaction.member)) {
            return interaction.reply({ content: 'Bạn không có quyền.', ephemeral: true });
        }
        const script = client.scripts.get('scmem_setlevel');
        if (!script) return interaction.reply({ content: '❌ Script not found', ephemeral: true });
        await script(interaction, client);
    },
};
