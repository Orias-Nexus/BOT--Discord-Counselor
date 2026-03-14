import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from 'discord.js';

/**
 * Slash command definitions from Architecture.json.
 * Each entry: command name (without /), script name, options builder.
 */
const SLASH_LIST = [
  { name: 'server_info', script: 'ServerInfo', defaultMemberPermissions: PermissionFlagsBits.ManageGuild },
  {
    name: 'status_timeout',
    script: 'StatusTimeout',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addStringOption((o) => o.setName('warn').setDescription('Thời gian time_warn (hh:mm:ss)'))
        .addStringOption((o) => o.setName('mute').setDescription('Thời gian time_mute (hh:mm:ss)'))
        .addStringOption((o) => o.setName('lock').setDescription('Thời gian time_lock (hh:mm:ss)'))
        .addStringOption((o) => o.setName('all').setDescription('Một thời gian cho cả 3 trường')),
  },
  {
    name: 'status_role',
    script: 'StatusRole',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addStringOption((o) => o.setName('warn').setDescription('Tên role gắn khi Warn'))
        .addStringOption((o) => o.setName('mute').setDescription('Tên role gắn khi Mute'))
        .addStringOption((o) => o.setName('lock').setDescription('Tên role gắn khi Lock')),
  },
  {
    name: 'status_unrole',
    script: 'StatusUnrole',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addStringOption((o) => o.setName('mute').setDescription('Role ID gỡ khi Mute (chỉ số, VD: 1234567890123456789)'))
        .addStringOption((o) => o.setName('lock').setDescription('Role ID gỡ khi Lock (chỉ số, VD: 1234567890123456789)')),
  },
  {
    name: 'category_info',
    script: 'CategoryInfo',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('target').setDescription('Danh mục (mặc định: danh mục chứa kênh hiện tại)').addChannelTypes(ChannelType.GuildCategory)
      ),
  },
  {
    name: 'category_clone',
    script: 'CategoryClone',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b
        .addChannelOption((o) =>
          o.setName('target').setDescription('Danh mục cần clone').addChannelTypes(ChannelType.GuildCategory)
        )
        .addIntegerOption((o) => o.setName('number').setDescription('Số bản sao (mặc định 1)').setMinValue(1).setMaxValue(10)),
  },
  {
    name: 'category_private',
    script: 'CategoryPrivate',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('target').setDescription('Danh mục').addChannelTypes(ChannelType.GuildCategory)
      ),
  },
  {
    name: 'category_public',
    script: 'CategoryPublic',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('target').setDescription('Danh mục').addChannelTypes(ChannelType.GuildCategory)
      ),
  },
  {
    name: 'channel_info',
    script: 'ChanelInfo',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('target').setDescription('Kênh (mặc định: kênh hiện tại)').addChannelTypes(
          ChannelType.GuildText,
          ChannelType.GuildVoice,
          ChannelType.GuildAnnouncement,
          ChannelType.GuildStageVoice,
          ChannelType.GuildForum
        )
      ),
  },
  {
    name: 'channel_clone',
    script: 'ChannelClone',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b
        .addChannelOption((o) => o.setName('target').setDescription('Kênh cần clone'))
        .addIntegerOption((o) => o.setName('number').setDescription('Số bản sao (mặc định 1)').setMinValue(1).setMaxValue(10)),
  },
  {
    name: 'channel_sync',
    script: 'ChannelSync',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Kênh')),
  },
  {
    name: 'channel_private',
    script: 'ChannelPrivate',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Kênh')),
  },
  {
    name: 'channel_public',
    script: 'ChannelPublic',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Kênh')),
  },
  {
    name: 'channel_sfw',
    script: 'ChannelSFW',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Kênh')),
  },
  {
    name: 'channel_nsfw',
    script: 'ChannelNSFW',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Kênh')),
  },
  {
    name: 'member_info',
    script: 'MemberInfo',
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Thành viên (mặc định: bản thân)')),
  },
  {
    name: 'member_rename',
    script: 'MemberRename',
    defaultMemberPermissions: PermissionFlagsBits.ManageNicknames,
    options: (b) =>
      b
        .addStringOption((o) => o.setName('setname').setDescription('Tên mới').setRequired(true))
        .addUserOption((o) => o.setName('target').setDescription('Thành viên (mặc định: bản thân)')),
  },
  {
    name: 'member_level',
    script: 'MemberSetlevel',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addIntegerOption((o) => o.setName('setlevel').setDescription('Level mới (min-max từ bảng Levels)').setRequired(true))
        .addUserOption((o) => o.setName('target').setDescription('Thành viên (mặc định: bản thân)')),
  },
  {
    name: 'member_move',
    script: 'MemberMove',
    defaultMemberPermissions: PermissionFlagsBits.MoveMembers,
    options: (b) =>
      b
        .addChannelOption((o) =>
          o.setName('channel').setDescription('Kênh thoại đích').addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice).setRequired(true)
        )
        .addUserOption((o) => o.setName('target').setDescription('Thành viên (để trống = tất cả trong voice)')),
  },
  {
    name: 'member_reset',
    script: 'MemberReset',
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Thành viên').setRequired(true)),
  },
  {
    name: 'member_warn',
    script: 'MemberWarn',
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Thành viên').setRequired(true)),
  },
  {
    name: 'member_mute',
    script: 'MemberMute',
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Thành viên').setRequired(true)),
  },
  {
    name: 'member_lock',
    script: 'MemberLock',
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Thành viên').setRequired(true)),
  },
  {
    name: 'member_kick',
    script: 'MemberKick',
    defaultMemberPermissions: PermissionFlagsBits.KickMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Thành viên').setRequired(true)),
  },
];

export function getSlashCommands() {
  return SLASH_LIST.map(({ name, script, defaultMemberPermissions, options }) => {
    const builder = new SlashCommandBuilder().setName(name).setDescription(`Script: ${script}`);
    if (defaultMemberPermissions != null) builder.setDefaultMemberPermissions(defaultMemberPermissions);
    if (typeof options === 'function') options(builder);
    return builder.toJSON();
  });
}

export function getScriptNameByCommand(commandName) {
  const found = SLASH_LIST.find((s) => s.name === commandName);
  return found?.script ?? null;
}
