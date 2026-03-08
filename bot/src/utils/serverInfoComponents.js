const { buildEmbed, buildComponents } = require('./serverInfoEmbed.js');

async function getInviteLink(guild) {
    try {
        const invites = await guild.invites.fetch();
        const withUrl = invites.filter((i) => i.url);
        if (withUrl.size === 0) return null;
        const oldest = withUrl.reduce((a, b) =>
            (a.createdTimestamp ?? Infinity) <= (b.createdTimestamp ?? Infinity) ? a : b
        );
        return oldest.url;
    } catch (_) {}
    try {
        const channel = guild.channels.cache.find((c) => c.viewable && c.permissionsFor(guild.members.me).has('CreateInstantInvite'));
        if (channel) {
            const invite = await channel.createInvite({ maxAge: 0 });
            return invite?.url ?? null;
        }
    } catch (_) {}
    return null;
}

async function refreshServerInfoMessage(message, guild) {
    const inviteLink = await getInviteLink(guild);
    const embed = buildEmbed(guild, inviteLink);
    const { row } = buildComponents();
    await message.edit({ embeds: [embed], components: row ? [row] : [] }).catch(() => {});
}

/**
 * Gọi từ event interactionCreate: nếu customId bắt đầu bằng server_info_ thì xử lý và return true.
 * Đã bỏ nút Name/Bio nên không còn button/modal cần xử lý.
 */
async function handle(interaction, client) {
    return false;
}

module.exports = { handle, refreshServerInfoMessage, getInviteLink };
