const { ensureServerProfile, getTimeForStatus } = require('../../../utils/serverProfileDb.js');
const { getProfile, updateStatus } = require('../../../utils/memberProfilesDb.js');

module.exports = async function memberMute(interaction, client) {
    const targetUser = interaction.options.getUser('target');
    const forever = interaction.options.getBoolean('forever') ?? false;
    const day = interaction.options.getInteger('day') ?? 0;
    const hour = interaction.options.getInteger('hour') ?? 0;
    const min = interaction.options.getInteger('min') ?? 0;
    const guild = interaction.guild;
    const member = await guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
        return interaction.reply({ content: 'Không tìm thấy thành viên trong server.', ephemeral: true });
    }

    await ensureServerProfile(guild.id);
    await getProfile(targetUser.id, guild.id);
    let minutes = null;
    if (forever) {
        minutes = await getTimeForStatus(guild.id, 'Muted');
    } else if (day > 0 || hour > 0 || min > 0) {
        minutes = day * 24 * 60 + hour * 60 + min;
    } else {
        minutes = await getTimeForStatus(guild.id, 'Muted');
    }
    const expiresAt = minutes != null && minutes > 0 ? new Date(Date.now() + minutes * 60 * 1000) : null;
    const timeoutMs = expiresAt ? expiresAt.getTime() - Date.now() : 28 * 24 * 60 * 60 * 1000;

    await updateStatus(targetUser.id, guild.id, 'Muted', expiresAt);
    await member.timeout(timeoutMs).catch((err) => {
        return interaction.reply({ content: `Không timeout được: ${err.message}`, ephemeral: true });
    });
    const msg = expiresAt
        ? `Đã mute **${member.user.tag}** đến <t:${Math.floor(expiresAt.getTime() / 1000)}:R>.`
        : `Đã mute **${member.user.tag}** vĩnh viễn.`;
    await interaction.reply({ content: msg });
};
