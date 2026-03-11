import { testEventMessage } from '../utils/messageTest.js';

export async function run(interaction) {
  await testEventMessage(interaction, 'Boosting');
}
