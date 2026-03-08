const { getProfile } = require('../../../utils/memberProfilesDb.js');
const { getTimes } = require('../../../utils/serverProfileDb.js');
const { buildEmbed, buildComponents } = require('../../../utils/memberInfoEmbed.js');

/**
 * Hiển thị embed member_info và components. Được gọi từ command (slash hoặc context menu).
 * @param { import('discord.js').ChatInputCommandInteraction | import('discord.js').UserContextMenuCommandInteraction } interaction
 * @param { import('discord.js').Client } client
 * @param { import('discord.js').GuildMember } targetMember - Thành viên cần xem/sửa
 */
module.exports = async function showMemberInfo(interaction, client, targetMember) {
    const guild = interaction.guild;
    const targetUserId = targetMember.id;
    const guildId = guild.id;

    const profile = await getProfile(targetUserId, guildId);
    if (!profile) {
        return interaction.reply({
            content: 'Không thể tải dữ liệu từ database. Kiểm tra Supabase.',
            ephemeral: true,
        });
    }

    const times = await getTimes(guildId);
    const embed = await buildEmbed(targetMember, profile);
    const { row1, row2 } = buildComponents(targetUserId, profile?.status, times);

    await interaction.reply({
        embeds: [embed],
        components: [row1, row2],
    });
};
