// src/scripts/mods/channel/sccha7_category_info.js

const { buildCategoryEmbed, buildCategoryComponents } = require('../../../utils/categoryInfoEmbed.js');

module.exports = async function showCategoryInfo(interaction, client) {
    const guild = interaction.guild;
    const category = interaction.options.getChannel('target');
    if (!category) {
        return interaction.reply({
            content: 'Vui lòng chọn một danh mục.',
            ephemeral: true,
        });
    }
    const embed = buildCategoryEmbed(category, guild);
    const { row } = buildCategoryComponents(category.id, guild, category);
    await interaction.reply({ embeds: [embed], components: [row] });
};
