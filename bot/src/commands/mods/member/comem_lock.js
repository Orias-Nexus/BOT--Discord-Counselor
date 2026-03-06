const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function hasManagePermission(member) {
    return (
        member.permissions.has(PermissionFlagsBits.ManageGuild) ||
        member.permissions.has(PermissionFlagsBits.ModerateMembers)
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('member_lock')
        .setDescription('Lock thành viên (có thời hạn hoặc vĩnh viễn)')
        .addUserOption((o) => o.setName('target').setDescription('Thành viên').setRequired(true))
        .addBooleanOption((o) =>
            o.setName('forever').setDescription('Vĩnh viễn (bỏ qua day/hour/min)').setRequired(false)
        )
        .addIntegerOption((o) =>
            o.setName('day').setDescription('Số ngày').setRequired(false).setMinValue(0)
        )
        .addIntegerOption((o) =>
            o.setName('hour').setDescription('Số giờ').setRequired(false).setMinValue(0)
        )
        .addIntegerOption((o) =>
            o.setName('min').setDescription('Số phút').setRequired(false).setMinValue(0)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction, client) {
        if (!hasManagePermission(interaction.member)) {
            return interaction.reply({ content: 'Bạn không có quyền.', ephemeral: true });
        }
        const script = client.scripts.get('scmem_lock');
        if (!script) return interaction.reply({ content: '❌ Script not found', ephemeral: true });
        await script(interaction, client);
    },
};
