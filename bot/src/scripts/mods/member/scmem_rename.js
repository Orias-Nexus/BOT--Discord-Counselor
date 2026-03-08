module.exports = async function memberRename(interaction, client) {
    const targetUser = interaction.options.getUser('target');
    const name = interaction.options.getString('name').trim().slice(0, 32);
    const guild = interaction.guild;
    const member = await guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
        return interaction.reply({ content: 'Không tìm thấy thành viên trong server.', ephemeral: true });
    }
    await member.setNickname(name || null).catch((err) => {
        return interaction.reply({ content: `Không đổi được tên: ${err.message}`, ephemeral: true });
    });
    await interaction.reply({ content: `Đã đổi tên **${member.user.tag}** thành **${name || '(xóa nickname)'}**.` });
};
