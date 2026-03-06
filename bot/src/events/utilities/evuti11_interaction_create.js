const memberInfoComponents = require('../../utils/memberInfoComponents.js');
const serverInfoComponents = require('../../utils/serverInfoComponents.js');
const channelInfoComponents = require('../../utils/channelInfoComponents.js');
const categoryInfoComponents = require('../../utils/categoryInfoComponents.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
            if (interaction.customId && interaction.customId.startsWith('member_info_')) {
                const handled = await memberInfoComponents.handle(interaction, client);
                if (handled) return;
            }
            if (interaction.customId && interaction.customId.startsWith('server_info_')) {
                const handled = await serverInfoComponents.handle(interaction, client);
                if (handled) return;
            }
            if (interaction.customId && interaction.customId.startsWith('channel_info_')) {
                const handled = await channelInfoComponents.handle(interaction, client);
                if (handled) return;
            }
            if (interaction.customId && interaction.customId.startsWith('category_info_')) {
                const handled = await categoryInfoComponents.handle(interaction, client);
                if (handled) return;
            }
        }

        if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                const payload = { content: 'There was an error while executing this command!', ephemeral: true };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(payload).catch(() => {});
                } else {
                    await interaction.reply(payload).catch(() => {});
                }
            }
        }
    },
};
