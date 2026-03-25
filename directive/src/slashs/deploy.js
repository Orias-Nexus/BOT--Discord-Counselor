import 'dotenv/config';
import { REST, Routes } from '../discord.js';
import { getSlashCommands } from './commands.js';

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.APPLICATION_ID;
if (!token || !applicationId) {
  console.error('DISCORD_TOKEN and APPLICATION_ID required in .env');
  process.exit(1);
}

const commands = getSlashCommands();
const rest = new REST({ version: '10' }).setToken(token);

try {
  console.log(`Registering ${commands.length} slash commands...`);
  await rest.put(Routes.applicationCommands(applicationId), { body: commands });
  console.log('Slash commands registered.');
} catch (err) {
  console.error(err);
  process.exit(1);
}
