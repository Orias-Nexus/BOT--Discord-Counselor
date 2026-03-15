import * as api from '../api.js';
import { getServerInfoEmbed } from '../embeds/ServerInfo.js';
import { buildServerInfoComponents } from '../utils/components.js';
import { mainImageURL } from '../config.js';

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
  const embed = getServerInfoEmbed(guild, { imageURL: mainImageURL });
  const { row, row2 } = buildServerInfoComponents();
  const components = [row, row2].filter(Boolean);
  await interaction.editReply({ embeds: [embed], components });
}
