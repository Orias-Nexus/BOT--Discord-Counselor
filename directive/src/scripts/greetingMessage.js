import { setMessageEmbedByName } from '../utils/messageEmbedConfig.js';

const MESSAGE_TYPE = 'Greeting';

export async function run(interaction, client) {
  await setMessageEmbedByName(interaction, MESSAGE_TYPE);
}
