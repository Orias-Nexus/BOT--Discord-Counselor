import * as api from '../api.js';
import { buildServerInfoEmbed } from '../utils/embedBuilders.js';
import { buildServerInfoComponents } from '../utils/components.js';

export async function run(interaction, client, _actionContext) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  await guild.fetch().catch(() => {});

  try {
    await api.ensureServer(guild.id);
  } catch (err) {
    console.error('[ServerInfo] ensureServer', err);
    await interaction.editReply({
      content: api.formatEphemeralContent('Không lấy được thông tin server. Vui lòng thử lại sau.'),
    });
    return;
  }
  const embed = buildServerInfoEmbed(guild);
  const { row } = buildServerInfoComponents();
  await interaction.editReply({ embeds: [embed], components: row ? [row] : [] });
}
