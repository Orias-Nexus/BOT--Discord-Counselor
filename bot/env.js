// env.js
require("dotenv").config();

const ENV = {
    APPLICATION_ID: process.env.APPLICATION_ID || "",
    DISCORD_TOKEN: process.env.DISCORD_TOKEN || "",
    PUBLIC_KEY: process.env.PUBLIC_KEY || "",
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

module.exports = ENV;
