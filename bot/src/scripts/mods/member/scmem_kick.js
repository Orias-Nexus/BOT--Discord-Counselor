module.exports = async function memberKick(interaction, client) {
    const targetUser = interaction.options.getUser('target');
    const guild = interaction.guild;
    const member = await guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
        return interaction.reply({ content: 'Không tìm thấy thành viên trong server.', ephemeral: true });
    }
    await member.kick().catch((err) => {
        return interaction.reply({ content: `Không kick được: ${err.message}`, ephemeral: true });
    });
    await interaction.reply({ content: `Đã kick **${member.user.tag}** khỏi server.` });
};
