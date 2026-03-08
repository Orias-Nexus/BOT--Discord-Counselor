// src/utils/handlers.js
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const ENV = require('../../env');

/**
 * Hàm đệ quy để lấy tất cả các file .js trong một thư mục và thư mục con của nó
 */
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.js')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

/**
 * Load Scripts: Nạp các hàm logic vào client.scripts
 */
function loadScripts(client) {
    client.scripts = new Map();
    const scriptsPath = path.join(__dirname, '../scripts');
    
    if (!fs.existsSync(scriptsPath)) return;

    const scriptFiles = getAllFiles(scriptsPath);
    let count = 0;

    for (const file of scriptFiles) {
        try {
            // Xóa cache để hot-reload nếu cần (với nodemon thì không cần thiết lắm nhưng vẫn tốt)
            delete require.cache[require.resolve(file)];
            const script = require(file);
            
            // Giả định mỗi file script export một function hoặc object
            // Chúng ta dùng tên file (bỏ path và extension) làm key, hoặc cấu trúc object
            const fileName = path.basename(file, '.js');
            client.scripts.set(fileName, script);
            count++;
        } catch (error) {
            console.error(`[ERROR] Failed to load script ${file}:`, error);
        }
    }
    console.log(`[SCRIPTS] Loaded ${count} scripts.`);
}

/**
 * Load Commands: Nạp commands vào client.commands để xử lý tương tác
 */
function loadCommands(client) {
    const commandsPath = path.join(__dirname, '../commands');
    
    if (!fs.existsSync(commandsPath)) return;

    const commandFiles = getAllFiles(commandsPath);
    let count = 0;

    for (const file of commandFiles) {
        try {
            delete require.cache[require.resolve(file)];
            const command = require(file);

            // Chỉ load command có đủ data và execute (bỏ qua file stub/placeholder)
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                if (command.contextMenuData) {
                    client.commands.set(command.contextMenuData.name, command);
                }
                count++;
            }
        } catch (error) {
            console.error(`[ERROR] Failed to load command ${file}:`, error);
        }
    }
    console.log(`[COMMANDS] Loaded ${count} commands.`);
}

/**
 * Load Events: Đăng ký các sự kiện với Discord Client
 */
function loadEvents(client) {
    const eventsPath = path.join(__dirname, '../events');
    
    if (!fs.existsSync(eventsPath)) return;

    const eventFiles = getAllFiles(eventsPath);
    let count = 0;

    for (const file of eventFiles) {
        try {
            delete require.cache[require.resolve(file)];
            const event = require(file);

            if (event.name) {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }
                count++;
            }
        } catch (error) {
            console.error(`[ERROR] Failed to load event ${file}:`, error);
        }
    }
    console.log(`[EVENTS] Loaded ${count} events.`);
}

/**
 * Deploy Commands: Đăng ký slash commands lên Discord API (dùng cho npm run deploy)
 */
async function deployCommands() {
    const commands = [];
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = getAllFiles(commandsPath);

    for (const file of commandFiles) {
        const command = require(file);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
        }
    }

    const rest = new REST().setToken(ENV.DISCORD_TOKEN);

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Đăng ký command (Global hoặc Guild tùy chỉnh)
        // Hiện tại đang set Global, có thể đổi thành Routes.applicationGuildCommands(clientId, guildId) để test nhanh hơn
        const data = await rest.put(
            Routes.applicationCommands(ENV.APPLICATION_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
}

module.exports = { loadScripts, loadCommands, loadEvents, deployCommands };