const { PermissionFlagsBits } = require('discord.js');
const {
    buildCategoryEmbed,
    buildCategoryComponents,
    isCategoryPublic,
    PREFIX_BTN,
} = require('./categoryInfoEmbed.js');

function hasManageChannel(interaction) {
    return interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels);
}

async function refreshCategoryInfoMessage(message, guild, categoryId) {
    const category = await guild.channels.fetch(categoryId).catch(() => null);
    if (!category) return;
    const embed = buildCategoryEmbed(category, guild);
    const { row } = buildCategoryComponents(categoryId, guild, category);
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
    const categoryId = parts[1];
    if (!categoryId) return false;

    const category = await guild.channels.fetch(categoryId).catch(() => null);
    if (!category) {
        await interaction.reply({ content: 'Không tìm thấy danh mục.', ephemeral: true }).catch(() => {});
        return true;
    }

    if (action === 'toggle') {
        const currentlyPublic = isCategoryPublic(category, guild);
        try {
            await category.permissionOverwrites.edit(guild.id, {
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
        if (interaction.message) await refreshCategoryInfoMessage(interaction.message, guild, categoryId);
        return true;
    }

    if (action === 'clone') {
        await interaction.deferReply({ ephemeral: true }).catch(() => {});
        try {
            const clonedCat = await category.clone();
            const children = guild.channels.cache
                .filter((c) => c.parentId === category.id)
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            for (const ch of children.values()) {
                await ch.clone({ parent: clonedCat.id }).catch(() => {});
            }
            await interaction.editReply({
                content: `Đã sao chép danh mục **${clonedCat.name}** và **${children.size}** kênh con.`,
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

module.exports = { handle, refreshCategoryInfoMessage };
