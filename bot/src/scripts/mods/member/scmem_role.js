module.exports = async function memberRole(interaction, client) {
    const targetUser = interaction.options.getUser('target');
    const role = interaction.options.getRole('role');
    const guild = interaction.guild;
    const member = await guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
        return interaction.reply({ content: 'Không tìm thấy thành viên trong server.', ephemeral: true });
    }
    if (role.name === '@everyone') {
        return interaction.reply({ content: 'Không thể gán vai trò @everyone.', ephemeral: true });
    }
    await member.roles.add(role).catch((err) => {
        return interaction.reply({ content: `Không gán được vai trò: ${err.message}`, ephemeral: true });
    });
    await interaction.reply({ content: `Đã gán vai trò **${role.name}** cho **${member.user.tag}**.` });
};
