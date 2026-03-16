import { ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } from 'discord.js';
import * as api from '../api.js';
<<<<<<< HEAD
import { EMBED_APPLY_SELECT_PREFIX } from '../embeds/embedEdit.js';

const MESSAGE_TYPES = ['Greeting', 'Leaving', 'Boosting', 'Leveling', 'Logging'];
=======
import { EMBED_APPLY_SELECT_PREFIX } from '../embeds/embedEditUtils.js';

const MESSAGE_TYPES = ['Greeting', 'Leaving', 'Boosting'];
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)

export async function run(interaction, client, actionContext = null) {
  const guild = interaction?.guild;
  if (!guild) {
<<<<<<< HEAD
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
    return;
  }
  const embedId = actionContext?.targetId;
  if (!embedId) {
<<<<<<< HEAD
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Embed missing.'));
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Thiếu embed.'));
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
    return;
  }

  await api.ensureServer(guild.id).catch(() => {});

  let list = [];
  try {
    list = await api.listMessages(guild.id);
  } catch (err) {
    console.error('[EmbedApply] listMessages', err);
<<<<<<< HEAD
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Could not load messages list.'));
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Không tải được danh sách messages.'));
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
    return;
  }

  const forTypes = list.filter((m) => MESSAGE_TYPES.includes(m.messages_type));
  const defaultValues = forTypes
    .filter((m) => m.embed_id && String(m.embed_id) === String(embedId))
    .map((m) => m.messages_type);

  const select = new StringSelectMenuBuilder()
    .setCustomId(`${EMBED_APPLY_SELECT_PREFIX}${embedId}`)
<<<<<<< HEAD
    .setPlaceholder('Select message(s) to attach this embed')
=======
    .setPlaceholder('Chọn message để gắn embed này')
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
    .setMinValues(0)
    .setMaxValues(MESSAGE_TYPES.length)
    .addOptions(
      MESSAGE_TYPES.map((type) => ({
        label: type,
        value: type,
<<<<<<< HEAD
        description: forTypes.some((m) => m.messages_type === type && m.embed_id) ? 'Using embed' : 'Not set',
        default: defaultValues.includes(type),
      }))
    );

  const row = new ActionRowBuilder().addComponents(select);
  const payload = {
    content: api.formatEphemeralContent('Select message(s) to attach. Deselect to detach. Submit to apply.'),
=======
        description: forTypes.some((m) => m.messages_type === type && m.embed_id) ? 'Đang dùng embed' : 'Chưa gắn',
      }))
    )
    .setDefaultValues(defaultValues);

  const row = new ActionRowBuilder().addComponents(select);
  const payload = {
    content: api.formatEphemeralContent('Chọn message muốn gắn embed này (có thể chọn nhiều). Bỏ chọn = gỡ embed. Gửi để áp dụng.'),
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
    components: [row],
    flags: MessageFlags.Ephemeral,
  };

  if (interaction.deferred) {
    await interaction.editReply(payload).catch(() => {});
  } else {
    await interaction.reply(payload).catch(() => {});
  }
}
