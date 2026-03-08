const { PermissionFlagsBits } = require('discord.js');
const {
    buildChannelEmbed,
    buildChannelComponents,
    getChannelStatus,
    isChannelPublic,
    PREFIX_BTN,
} = require('./channelInfoEmbed.js');

function hasManageChannel(interaction) {
    return interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels);
}

async function refreshChannelInfoMessage(message, guild, channelId) {
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return;
    const embed = buildChannelEmbed(channel, guild);
    const { row } = buildChannelComponents(channelId, guild, channel);
    await message.edit({ embeds: [embed], components: [row] }).catch(() => {});
}

async function handleButton(interaction, client) {
    const customId = interaction.customId;
    if (!customId.startsWith(PREFIX_BTN)) return false;

    if (!hasManageChannel(interaction)) {
        await interaction.reply({
            content: 'Bạn không có quyền quản lý kênh.',
            ephemeral: true,
        }).catch(() => {});
        return true;
    }

    const guild = interaction.guild;
    const parts = customId.slice(PREFIX_BTN.length).split('_');
    const action = parts[0];
    const channelId = parts[1];
    if (!channelId) return false;

    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) {
        await interaction.reply({ content: 'Không tìm thấy kênh.', ephemeral: true }).catch(() => {});
        return true;
    }

    if (action === 'toggle') {
        const currentlyPublic = isChannelPublic(channel, guild);
        try {
            await channel.permissionOverwrites.edit(guild.id, {
                ViewChannel: currentlyPublic ? false : true,
            });
        } catch (err) {
            await interaction.reply({
                content: `Không đổi được: ${err.message}`,
                ephemeral: true,
            }).catch(() => {});
            return true;
        }
        await interaction.deferUpdate().catch(() => {});
        if (interaction.message) await refreshChannelInfoMessage(interaction.message, guild, channelId);
        return true;
    }

    if (action === 'clone') {
        await interaction.deferReply({ ephemeral: true }).catch(() => {});
        try {
            const cloned = await channel.clone();
            await interaction.editReply({
                content: `Đã sao chép kênh thành **${cloned.name}**.`,
            }).catch(() => {});
        } catch (err) {
            await interaction.editReply({
                content: `Không clone được: ${err.message}`,
            }).catch(() => {});
        }
        return true;
    }

    return false;
}

async function handle(interaction, client) {
    if (!hasManageChannel(interaction)) {
        await interaction.reply({
            content: 'Bạn không có quyền quản lý kênh.',
            ephemeral: true,
        }).catch(() => {});
        return true;
    }
    if (interaction.isButton()) return await handleButton(interaction, client);
    return false;
}

module.exports = { handle, refreshChannelInfoMessage };
