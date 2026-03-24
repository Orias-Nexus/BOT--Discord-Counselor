import { setEventChannel } from '../utils/eventChannelConfig.js';

export async function run(interaction, client, actionContext) {
  await setEventChannel(interaction, client, actionContext, 'Leaving');
}
