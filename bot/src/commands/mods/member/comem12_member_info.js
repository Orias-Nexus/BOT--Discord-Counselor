const {
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    PermissionFlagsBits,
} = require('discord.js');
const showMemberInfo = require('../../../scripts/mods/member/scmem12_member_info.js');

function hasManagePermission(member) {
    return (
        member.permissions.has(PermissionFlagsBits.ManageGuild) ||
        member.permissions.has(PermissionFlagsBits.ModerateMembers)
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('member_info')
        .setDescription('Xem và chỉnh sửa thông tin thành viên (Level, Status, Nickname, Roles)')
        .addUserOption((opt) =>
            opt.setName('target').setDescription('Thành viên cần quản lý').setRequired(true)
        ),

    contextMenuData: new ContextMenuCommandBuilder()
        .setName('Quản lý Thành viên')
        .setType(ApplicationCommandType.User),

    async execute(interaction, client) {
        if (!hasManagePermission(interaction.member)) {
            return interaction.reply({
                content: 'Bạn không có quyền thực hiện thao tác này.',
                ephemeral: true,
            });
        }

        let targetUser;
        if (interaction.isUserContextMenuCommand()) {
            targetUser = interaction.targetUser;
        } else {
            targetUser = interaction.options.getUser('target');
        }

        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        if (!targetMember) {
            return interaction.reply({
                content: 'Không tìm thấy thành viên trong server.',
                ephemeral: true,
            });
        }

        await showMemberInfo(interaction, client, targetMember);
    },
};
