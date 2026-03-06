// src/scripts/utilities/scuti1_help.js
const { EmbedBuilder } = require('discord.js');

/**
 * Logic xử lý cho lệnh Help - Hiển thị danh sách lệnh động
 * @param {import('discord.js').CommandInteraction} interaction 
 * @param {import('discord.js').Client} client 
 */
module.exports = async (interaction, client) => {
    // Lấy tất cả commands đang có trong bot
    const commands = client.commands;

    // Tạo Embed
    const helpEmbed = new EmbedBuilder()
        .setTitle(`🤖 Danh sách lệnh của ${client.user.username}`)
        .setColor('Random')
        .setDescription('Dưới đây là danh sách các lệnh bạn có thể sử dụng:')
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: 'Orias\'s Pet', iconURL: client.user.displayAvatarURL() });

    // Duyệt qua từng command để thêm vào nội dung
    // Chúng ta sẽ gom nhóm đơn giản hoặc liệt kê hết
    
    if (commands.size === 0) {
        helpEmbed.setDescription('Hiện chưa có lệnh nào được nạp.');
    } else {
        const commandList = commands.map(cmd => {
            return `**/${cmd.data.name}**: ${cmd.data.description}`;
        }).join('\n');
        
        // Discord giới hạn description 4096 ký tự, nhưng demo này chắc chưa tới mức đó
        helpEmbed.addFields({ name: 'Commands', value: commandList });
    }

    await interaction.reply({ embeds: [helpEmbed] });
};