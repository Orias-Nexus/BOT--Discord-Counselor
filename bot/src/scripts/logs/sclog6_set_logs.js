// src/scripts/logs/sclog6_set_logs.js

const fs = require('fs');
const path = require('path');

module.exports = async (interaction, client) => {
    const channel = interaction.options.getChannel('channel');
    const guildId = interaction.guild.id;

    // Đường dẫn file lưu config (giả lập Database đơn giản)
    const dbPath = path.join(__dirname, '../../../database');
    const dbFile = path.join(dbPath, 'logs.json');

    // Tạo thư mục database nếu chưa có
    if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
    }

    // Đọc dữ liệu cũ
    let data = {};
    if (fs.existsSync(dbFile)) {
        try {
            data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        } catch (e) {
            console.error('Lỗi đọc file logs.json', e);
            data = {};
        }
    }

    // Lưu cấu hình mới
    data[guildId] = channel.id;

    // Ghi file
    try {
        fs.writeFileSync(dbFile, JSON.stringify(data, null, 4), 'utf8');
        
        await interaction.reply({ 
            content: `✅ Đã thiết lập kênh logs thành công!\nCác sự kiện sẽ được gửi vào kênh: ${channel}` 
        });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Có lỗi xảy ra khi lưu cấu hình.', ephemeral: true });
    }
};