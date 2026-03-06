// src/index.js
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const ENV = require('../env.js');
const config = require('./.config.js');
const { loadScripts, loadCommands, loadEvents } = require('./utils/handlers.js');

// Khởi tạo Client với các quyền (Intents) cần thiết
// Bạn có thể thêm các Intent khác tùy vào tính năng bot (ví dụ: GuildMembers, GuildPresences)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildVoiceStates // Cần cho Music bot
    ]
});

// Gán cấu hình vào client để dùng ở mọi nơi
client.config = config;

// Collection chứa các commands
client.commands = new Collection();
// Scripts (Map) để chứa các logic xử lý
client.scripts = new Map();

// --- GIAI ĐOẠN KHỞI TẠO (HANDLERS) ---

// 1. Load Scripts (Bộ não xử lý logic)
loadScripts(client);

// 2. Load Commands (Giao diện lệnh)
loadCommands(client);

// 3. Load Events (Lắng nghe sự kiện)
loadEvents(client);

// interactionCreate: xử lý trong events/utilities/evuti11_interaction_create.js (slash, context menu, member_info components)

// Sự kiện Ready cơ bản (Fallback nếu chưa có file events/ready.js)
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Login
client.login(ENV.DISCORD_TOKEN);