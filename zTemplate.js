/**
 * Template mặc định cho 3 embed Greeting, Leaving, Boosting.
 * Trigger DB (supabase) khi tạo server mới cũng tạo 3 embeds + 3 messages với nội dung tương đương.
 * color = EMBED_COLORS.DEFAULT (5763719) trong directive/src/embeds/schema.js.
 * Placeholder {rule_channel} resolve qua directive (kênh Rules/Guidelines của server).
 */
const EMBED_COLOR_DEFAULT = 5763719;

const GREETING_TEMPLATE = {
  title: '**Greeting! {user_name}!**',
  description: '**Welcome to {server_name}!**',
  color: EMBED_COLOR_DEFAULT,
  timestamp: null,
  author: {
    name: '✦ {server_name}',
    icon_url: '{server_icon}',
  },
  thumbnail: { url: '{user_avatar}' },
  image: { url: '{server_banner}' },
  fields: [
    {name: 'Your Position', value: '{server_membercount}', inline: true },
    {name: 'Rule Channel', value: "{rule_channel}", inline: true },
    {name: 'Small Rule', value: 'Just enjoy your time here!', inline: false},
  ],
  footer: {
    text: 'Thank you for joining us!',
    icon_url: '{server_icon}',
  },
};

const LEAVING_TEMPLATE = {
  title: '**Goodbye! {user_name}!**',
  description: '**Goodbye from {server_name}!**',
  color: EMBED_COLOR_DEFAULT,
  timestamp: null,
  author: {
    name: '✦ {server_name}',
    icon_url: '{server_icon}',
  },
  thumbnail: { url: '{user_avatar}' },
  image: { url: '{server_banner}' },
  fields: [
    {name: 'Your Position', value: '{server_membercount}', inline: true },
    {name: 'Rule Channel', value: "{rule_channel}", inline: true },
    {name: 'Small Note', value: 'We hope to see you again!', inline: false},
  ],
  footer: {
    text: 'See you next time!',
    icon_url: '{server_icon}',
  },
};

const BOOSTING_TEMPLATE = {
  title: '**Thank You! {user_name}!**',
  description: '**You are now boosting {server_name}!**',
  color: EMBED_COLOR_DEFAULT,
  timestamp: null,
  author: {
    name: '✦ {server_name}',
    icon_url: '{server_icon}',
  },
  thumbnail: { url: '{user_avatar}' },
  image: { url: '{server_banner}' },
  fields: [
    {name: 'Your Position', value: '{server_membercount}', inline: true },
    {name: 'Rule Channel', value: "{rule_channel}", inline: true },
    {name: 'Small Note', value: 'We hope you enjoy your time here!', inline: false},
  ],
  footer: {
    text: 'Thank you for boosting us!',
    icon_url: '{server_icon}',
  },
};