import { ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } from '../discord.js';
import * as api from '../api.js';
import { EMBED_APPLY_SELECT_PREFIX } from '../embeds/embedEdit.js';

const MESSAGE_TYPES = ['Greeting', 'Leaving', 'Boosting', 'Leveling', 'Logging'];

export async function run(interaction, client, actionContext = null) {
  const guild = interaction?.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  const embedId = actionContext?.targetId;
  if (!embedId) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Embed missing.'));
    return;
  }

  await api.ensureServer(guild.id).catch(() => {});

  let list = [];
  try {
    list = await api.listMessages(guild.id);
  } catch (err) {
    console.error('[EmbedApply] listMessages', err);
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Could not load messages list.'));
    return;
  }

  const forTypes = list.filter((m) => MESSAGE_TYPES.includes(m.messages_type));
  const defaultValues = forTypes
    .filter((m) => m.embed_id && String(m.embed_id) === String(embedId))
    .map((m) => m.messages_type);

  const select = new StringSelectMenuBuilder()
    .setCustomId(`${EMBED_APPLY_SELECT_PREFIX}${embedId}`)
    .setPlaceholder('Select message(s) to attach this embed')
    .setMinValues(0)
    .setMaxValues(MESSAGE_TYPES.length)
    .addOptions(
      MESSAGE_TYPES.map((type) => ({
        label: type,
        value: type,
        description: forTypes.some((m) => m.messages_type === type && m.embed_id) ? 'Using embed' : 'Not set',
        default: defaultValues.includes(type),
      }))
    );

  const row = new ActionRowBuilder().addComponents(select);
  const payload = {
    content: api.formatEphemeralContent('Select message(s) to attach. Deselect to detach. Submit to apply.'),
    components: [row],
    flags: MessageFlags.Ephemeral,
  };

  if (interaction.deferred) {
    await interaction.editReply(payload).catch(() => {});
  } else {
    await interaction.reply(payload).catch(() => {});
  }
}
