// src/scripts/mods/server/scser1_server_info.js

const { MessageFlags } = require('discord.js');
const { getServerProfile, setLink } = require('../../../utils/serverProfileDb.js');
const { buildEmbed, buildComponents } = require('../../../utils/serverInfoEmbed.js');
const { getInviteLink } = require('../../../utils/serverInfoComponents.js');

/**
 * Hiển thị embed server_info. Link lấy từ getInviteLink hoặc cache trong server_profiles.link.
 */
module.exports = async function showServerInfo(interaction, client) {
    const guild = interaction.guild;
    if (!guild) {
        return interaction.reply({ content: 'Chỉ dùng trong server.', flags: MessageFlags.Ephemeral });
    }

    await guild.fetch().catch(() => {});

    const profile = await getServerProfile(guild.id);
    let inviteLink = await getInviteLink(guild);
    if (inviteLink) await setLink(guild.id, inviteLink);
    const link = inviteLink || profile?.link || null;
    const embed = buildEmbed(guild, link);
    const { row } = buildComponents();

    await interaction.reply({
        embeds: [embed],
        components: row ? [row] : [],
    });
};
