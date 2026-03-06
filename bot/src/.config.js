// src/.config.js
const fs = require('fs');
const path = require('path');

// Đọc file config.json đồng bộ
const configPath = path.join(__dirname, '.config.json');
const configData = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configData);
module.exports = config;