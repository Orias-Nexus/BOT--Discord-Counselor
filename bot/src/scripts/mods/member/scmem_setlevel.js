const { getProfile, updateLevel } = require('../../../utils/memberProfilesDb.js');

module.exports = async function memberSetlevel(interaction, client) {
    const targetUser = interaction.options.getUser('target');
    const level = Math.max(0, interaction.options.getInteger('level') ?? 0);
    const guild = interaction.guild;
    const member = await guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
        return interaction.reply({ content: 'Không tìm thấy thành viên trong server.', ephemeral: true });
    }
    await getProfile(targetUser.id, guild.id);
    await updateLevel(targetUser.id, guild.id, level);
    await interaction.reply({ content: `Đã đặt level **${member.user.tag}** thành **${level}**.` });
};
