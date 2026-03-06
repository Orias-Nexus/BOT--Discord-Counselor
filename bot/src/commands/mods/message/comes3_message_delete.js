// src/commands/mods/message/comes3_message_delete.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('message_delete')
        .setDescription('Xóa tin nhắn hàng loạt với bộ lọc nâng cao')
        // Tùy chọn 1: Số lượng quét (Bắt buộc)
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Số lượng tin nhắn cần quét (Tối đa 100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true))
        // Tùy chọn 2: Lọc theo người dùng
        .addUserOption(option =>
            option.setName('target_user')
                .setDescription('Chỉ xóa tin nhắn của người này')
                .setRequired(false))
        // Tùy chọn 3: Lọc theo vai trò
        .addRoleOption(option =>
            option.setName('target_role')
                .setDescription('Chỉ xóa tin nhắn của người có vai trò này')
                .setRequired(false))
        // Tùy chọn 4: Kiểu mốc thời gian (Trước hay Sau)
        .addStringOption(option =>
            option.setName('time_type')
                .setDescription('Chọn kiểu lọc thời gian')
                .addChoices(
                    { name: 'Mới hơn (Trong khoảng X trở lại đây)', value: 'newer' },
                    { name: 'Cũ hơn (Cách đây hơn X)', value: 'older' }
                )
                .setRequired(false))
        // Tùy chọn 5: Giá trị thời gian
        .addStringOption(option =>
            option.setName('time_value')
                .setDescription('Nhập thời gian (vd: 30m, 1h, 2h). s=giây, m=phút, h=giờ')
                .setRequired(false))
        // Yêu cầu quyền Manage Messages
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction, client) {
        const scriptName = 'scmes3_message_delete';
        const script = client.scripts.get(scriptName);

        if (!script) return interaction.reply({ content: `❌ Lỗi script: ${scriptName}`, ephemeral: true });

        await script(interaction, client);
    },
};