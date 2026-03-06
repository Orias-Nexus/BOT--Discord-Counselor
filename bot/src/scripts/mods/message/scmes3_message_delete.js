// src/scripts/mods/message/scmes3_message_delete.js

const { PermissionFlagsBits } = require('discord.js');

/**
 * Hàm phụ trợ để chuyển đổi chuỗi thời gian (vd: 10m, 1h) sang mili-giây
 */
function parseTime(timeStr) {
    if (!timeStr) return null;
    const unit = timeStr.slice(-1);
    const value = parseInt(timeStr.slice(0, -1));

    if (isNaN(value)) return null;

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60000;
        case 'h': return value * 3600000;
        case 'd': return value * 86400000;
        default: return null;
    }
}

module.exports = async (interaction, client) => {
    // 1. Kiểm tra quyền của Bot
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return interaction.reply({ content: '❌ Bot thiếu quyền `Manage Messages` (Quản lý tin nhắn).', ephemeral: true });
    }

    // 2. Lấy các tham số từ người dùng
    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('target_user');
    const targetRole = interaction.options.getRole('target_role');
    const timeType = interaction.options.getString('time_type'); // 'older' hoặc 'newer'
    const timeValue = interaction.options.getString('time_value'); // vd: '1h'

    await interaction.deferReply({ ephemeral: true }); // Xử lý ngầm để tránh báo lỗi timeout

    try {
        // 3. Lấy danh sách tin nhắn (tối đa 100 tin gần nhất)
        const messages = await interaction.channel.messages.fetch({ limit: amount });

        // 4. Lọc tin nhắn dựa trên tiêu chí
        const filtered = messages.filter(msg => {
            // Lọc theo User
            if (targetUser && msg.author.id !== targetUser.id) return false;

            // Lọc theo Role (Chỉ hoạt động nếu user còn trong server)
            if (targetRole) {
                if (!msg.member || !msg.member.roles.cache.has(targetRole.id)) return false;
            }

            // Lọc theo Thời gian
            if (timeType && timeValue) {
                const ms = parseTime(timeValue);
                if (ms) {
                    const msgAge = Date.now() - msg.createdTimestamp;
                    // Nếu chọn 'newer': Chỉ xóa tin nhắn MỚI hơn mốc thời gian (Age < mốc)
                    if (timeType === 'newer' && msgAge > ms) return false;
                    // Nếu chọn 'older': Chỉ xóa tin nhắn CŨ hơn mốc thời gian (Age > mốc)
                    if (timeType === 'older' && msgAge < ms) return false;
                }
            }

            // Tin nhắn ghim thường không nên xóa bằng lệnh clear bulk
            if (msg.pinned) return false;

            return true;
        });

        // 5. Thực hiện xóa
        if (filtered.size === 0) {
            return interaction.editReply({ content: '❌ Không tìm thấy tin nhắn nào phù hợp với bộ lọc trong phạm vi quét.' });
        }

        // bulkDelete(collection, true): true là filterOld - tự động bỏ qua tin nhắn quá 14 ngày (giới hạn của Discord API)
        const deleted = await interaction.channel.bulkDelete(filtered, true);

        // 6. Báo cáo kết quả
        let report = `✅ Đã quét **${messages.size}** tin và xóa **${deleted.size}** tin nhắn.`;
        if (targetUser) report += `\n👤 Của người dùng: ${targetUser.username}`;
        if (targetRole) report += `\nasd🎭 Có vai trò: ${targetRole.name}`;
        if (timeType && timeValue) report += `\n⏰ Thời gian: ${timeType === 'newer' ? 'Mới hơn' : 'Cũ hơn'} ${timeValue}`;

        await interaction.editReply({ content: report });

    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: '❌ Có lỗi xảy ra. Lưu ý: Bot không thể xóa tin nhắn cũ hơn 14 ngày.' });
    }
};