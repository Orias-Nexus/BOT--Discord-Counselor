// src/commands/mods/channel/cocha1_chanel_clone.js
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel_clone')
        .setDescription('Nhân bản một kênh (Sao chép quyền hạn, cấu hình...)')
        // Tùy chọn 1: Kênh cần clone (Bắt buộc)
        .addChannelOption(option =>
            option.setName('target_channel')
                .setDescription('Chọn kênh bạn muốn nhân bản')
                .setRequired(true)
                // Hạn chế các loại kênh có thể clone để tránh lỗi (Text, Voice, News, Forum)
                .addChannelTypes(
                    ChannelType.GuildText, 
                    ChannelType.GuildVoice, 
                    ChannelType.GuildAnnouncement,
                    ChannelType.GuildForum,
                    ChannelType.GuildStageVoice
                ))
        // Tùy chọn 2: Danh mục đích (Tùy chọn)
        .addChannelOption(option =>
            option.setName('target_category')
                .setDescription('Chọn danh mục (Category) để chứa kênh mới')
                .setRequired(false)
                // Bắt buộc phải là Category
                .addChannelTypes(ChannelType.GuildCategory))
        // Tùy chọn 3: Tên mới (Tùy chọn)
        .addStringOption(option =>
            option.setName('new_name')
                .setDescription('Đặt tên cho kênh mới (Nếu để trống sẽ dùng tên cũ)')
                .setRequired(false))
        // Yêu cầu quyền Manage Channels đối với người dùng
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction, client) {
        const scriptName = 'sccha1_chanel_clone';
        const script = client.scripts.get(scriptName);

        if (!script) return interaction.reply({ content: `❌ Lỗi script: ${scriptName}`, ephemeral: true });

        await script(interaction, client);
    },
};