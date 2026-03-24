import { setMessageEmbedByName } from '../utils/messageEmbedConfig.js';

export async function run(interaction, client) {
  await setMessageEmbedByName(interaction, 'Leveling');
}
