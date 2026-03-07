import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { getSlashCommands } from './commands.js';

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.APPLICATION_ID;
if (!token || !applicationId) {
  console.error('Cần DISCORD_TOKEN và APPLICATION_ID trong .env');
  process.exit(1);
}

const commands = getSlashCommands();
const rest = new REST({ version: '10' }).setToken(token);

try {
  console.log(`Đang đăng ký ${commands.length} lệnh slash...`);
  await rest.put(Routes.applicationCommands(applicationId), { body: commands });
  console.log('Đăng ký slash commands xong.');
} catch (err) {
  console.error(err);
  process.exit(1);
}
