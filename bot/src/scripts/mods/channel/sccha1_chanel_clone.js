// src/scripts/mods/channel/sccha1_chanel_clone.js
const { PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = async (interaction, client) => {
    // 1. Kiểm tra quyền của Bot trong Server
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: '❌ Bot thiếu quyền `Manage Channels` (Quản lý kênh).', ephemeral: true });
    }

    // 2. Lấy các tham số từ người dùng
    const targetChannel = interaction.options.getChannel('target_channel');
    const targetCategory = interaction.options.getChannel('target_category');
    const newName = interaction.options.getString('new_name');

    // Thông báo đang xử lý
    await interaction.deferReply({ ephemeral: true });

    try {
        // 3. Chuẩn bị options cho việc Clone
        // Nếu người dùng không nhập tên mới, dùng tên cũ
        // Nếu người dùng không nhập category, dùng category cũ (giữ nguyên parent)
        const cloneOptions = {
            name: newName || targetChannel.name,
            parent: targetCategory ? targetCategory.id : targetChannel.parentId,
            reason: `Clone requested by ${interaction.user.tag}`
        };

        // 4. Thực hiện Clone
        // Lưu ý: clone() sẽ sao chép cả Permissions, Topic, RateLimit, v.v.
        const clonedChannel = await targetChannel.clone(cloneOptions);

        // Nếu có category mới, đôi khi cần set lại vị trí để đồng bộ quyền (tùy chọn)
        if (targetCategory) {
            await clonedChannel.setParent(targetCategory.id, { lockPermissions: false });
        }

        // 5. Phản hồi kết quả
        let response = `✅ Đã nhân bản kênh thành công!\n🆕 Kênh mới: ${clonedChannel}`; // Tag kênh mới
        if (newName) response += `\n🏷️ Tên mới: **${newName}**`;
        if (targetCategory) response += `\nsap📂 Đã chuyển vào danh mục: **${targetCategory.name}**`;

        await interaction.editReply({ content: response });

    } catch (error) {
        console.error("Lỗi khi clone channel:", error);
        await interaction.editReply({ content: '❌ Có lỗi xảy ra khi nhân bản kênh. Có thể do Bot thiếu quyền hoặc kênh quá đặc biệt (ví dụ: Community rules channel).' });
    }
};