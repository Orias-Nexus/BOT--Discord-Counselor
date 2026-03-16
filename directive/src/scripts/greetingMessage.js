import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
import { resolveString } from '../embeds/embedContext.js';

const MESSAGE_TYPE = 'Greeting';

export async function run(interaction, client) {
  const guild = interaction?.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
    return;
  }
  const embedName = interaction.options?.getString('embed')?.trim();
  if (!embedName) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Hãy nhập tên embed.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    await api.ensureServer(guild.id);
    const list = await api.listEmbeds(guild.id);
    const embedRow = Array.isArray(list) ? list.find((e) => e.embed_name === embedName) : null;
    if (!embedRow) {
      await interaction.editReply({
        content: api.formatEphemeralContent(`Không tìm thấy embed "${embedName}". Tạo trước bằng /embedcreate.`),
        flags: MessageFlags.Ephemeral,
      }).catch(() => {});
      return;
    }
    await api.setMessageEmbed(guild.id, MESSAGE_TYPE, embedRow.embed_id);
    const text = await resolveString('Completed Set {embed_name} as Greeting Message', {
      placeholderCache: { embed_name: embedRow.embed_name },
    });
    await interaction.editReply({ content: text, flags: MessageFlags.Ephemeral }).catch(() => {});
  } catch (err) {
    console.error('[GreetingMessage]', err);
    await interaction.editReply({ content: api.formatEphemeralContent('Không thể cập nhật.'), flags: MessageFlags.Ephemeral }).catch(() => {});
  }
}
