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
  { name: 'serverinfo', script: 'ServerInfo', defaultMemberPermissions: PermissionFlagsBits.ManageGuild },
  {
    name: 'setvoicecreator',
    script: 'SetVoiceCreator',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
  },
  {
    name: 'setserverstats',
    script: 'SetServerStats',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
  },
  {
    name: 'statustimeout',
    script: 'StatusTimeout',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addStringOption((o) => o.setName('warn').setDescription('Thời gian time_warn (dd:hh:mm)'))
        .addStringOption((o) => o.setName('mute').setDescription('Thời gian time_mute (dd:hh:mm)'))
        .addStringOption((o) => o.setName('lock').setDescription('Thời gian time_lock (dd:hh:mm)'))
        .addStringOption((o) => o.setName('new').setDescription('Thời gian time_new (dd:hh:mm)'))
        .addStringOption((o) => o.setName('all').setDescription('Một thời gian cho cả 4 trường')),
  },
  {
    name: 'statusrole',
    script: 'StatusRole',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addStringOption((o) => o.setName('warn').setDescription('Tên role gắn khi Warn'))
        .addStringOption((o) => o.setName('mute').setDescription('Tên role gắn khi Mute'))
        .addStringOption((o) => o.setName('lock').setDescription('Tên role gắn khi Lock'))
        .addStringOption((o) => o.setName('new').setDescription('Tên role gắn khi Newbie')),
  },
  {
    name: 'statusunrole',
    script: 'StatusUnrole',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addStringOption((o) => o.setName('mute').setDescription('Role ID gỡ khi Mute (chỉ số, VD: 1234567890123456789)'))
        .addStringOption((o) => o.setName('lock').setDescription('Role ID gỡ khi Lock (chỉ số, VD: 1234567890123456789)')),
  },
  {
    name: 'categoryinfo',
    script: 'CategoryInfo',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('target').setDescription('Danh mục (mặc định: danh mục chứa kênh hiện tại)').addChannelTypes(ChannelType.GuildCategory)
      ),
  },
  {
    name: 'categoryclone',
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
    name: 'categoryprivate',
    script: 'CategoryPrivate',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('target').setDescription('Danh mục').addChannelTypes(ChannelType.GuildCategory)
      ),
  },
  {
    name: 'categorypublic',
    script: 'CategoryPublic',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('target').setDescription('Danh mục').addChannelTypes(ChannelType.GuildCategory)
      ),
  },
  {
    name: 'channelinfo',
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
    name: 'channelclone',
    script: 'ChannelClone',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b
        .addChannelOption((o) => o.setName('target').setDescription('Kênh cần clone'))
        .addIntegerOption((o) => o.setName('number').setDescription('Số bản sao (mặc định 1)').setMinValue(1).setMaxValue(10)),
  },
  {
    name: 'channelsync',
    script: 'ChannelSync',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Kênh')),
  },
  {
    name: 'channelprivate',
    script: 'ChannelPrivate',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Kênh')),
  },
  {
    name: 'channelpublic',
    script: 'ChannelPublic',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Kênh')),
  },
  {
    name: 'channelsfw',
    script: 'ChannelSFW',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Kênh')),
  },
  {
    name: 'channelnsfw',
    script: 'ChannelNSFW',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Kênh')),
  },
  {
    name: 'memberinfo',
    script: 'MemberInfo',
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Thành viên (mặc định: bản thân)')),
  },
  {
    name: 'memberrename',
    script: 'MemberRename',
    defaultMemberPermissions: PermissionFlagsBits.ManageNicknames,
    options: (b) =>
      b
        .addStringOption((o) => o.setName('setname').setDescription('Tên mới').setRequired(true))
        .addUserOption((o) => o.setName('target').setDescription('Thành viên (mặc định: bản thân)')),
  },
  {
    name: 'memberlevel',
    script: 'MemberSetlevel',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addIntegerOption((o) => o.setName('setlevel').setDescription('Level mới (min-max từ bảng Levels)').setRequired(true))
        .addUserOption((o) => o.setName('target').setDescription('Thành viên (mặc định: bản thân)')),
  },
  {
    name: 'membermove',
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
    name: 'memberreset',
    script: 'MemberReset',
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Thành viên').setRequired(true)),
  },
  {
    name: 'memberwarn',
    script: 'MemberWarn',
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Thành viên').setRequired(true)),
  },
  {
    name: 'membermute',
    script: 'MemberMute',
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Thành viên').setRequired(true)),
  },
  {
    name: 'memberlock',
    script: 'MemberLock',
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Thành viên').setRequired(true)),
  },
  {
    name: 'memberkick',
    script: 'MemberKick',
    defaultMemberPermissions: PermissionFlagsBits.KickMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Thành viên').setRequired(true)),
  },
  {
    name: 'greetingchannel',
    script: 'GreetingChannel',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('channel').setDescription('Kênh gửi tin chào mừng').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true)
      ),
  },
  {
    name: 'leavingchannel',
    script: 'LeavingChannel',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('channel').setDescription('Kênh gửi tin tạm biệt').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true)
      ),
  },
  {
    name: 'boostingchannel',
    script: 'BoostingChannel',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('channel').setDescription('Kênh gửi tin boost').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true)
      ),
  },
  {
    name: 'greetingmessage',
    script: 'GreetingMessage',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addStringOption((o) =>
        o.setName('embed').setDescription('Tên embed (đã tạo trong server)').setRequired(true).setAutocomplete(true)
      ),
  },
  {
    name: 'leavingmessage',
    script: 'LeavingMessage',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addStringOption((o) =>
        o.setName('embed').setDescription('Tên embed (đã tạo trong server)').setRequired(true).setAutocomplete(true)
      ),
  },
  {
    name: 'boostingmessage',
    script: 'BoostingMessage',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addStringOption((o) =>
        o.setName('embed').setDescription('Tên embed (đã tạo trong server)').setRequired(true).setAutocomplete(true)
      ),
  },
  {
    name: 'embedcreate',
    script: 'EmbedCreate',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) => b.addStringOption((o) => o.setName('name').setDescription('Tên embed').setRequired(true)),
  },
  {
    name: 'embededit',
    script: 'EmbedEdit',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addStringOption((o) =>
        o.setName('target').setDescription('Chọn embed cần sửa').setRequired(true).setAutocomplete(true)
      ),
  },
  {
    name: 'embedrename',
    script: 'EmbedRename',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addStringOption((o) =>
          o.setName('target').setDescription('Chọn embed cần đổi tên').setRequired(true).setAutocomplete(true)
        )
        .addStringOption((o) => o.setName('newname').setDescription('Tên mới').setRequired(true)),
  },
  {
    name: 'embeddelete',
    script: 'EmbedDelete',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addStringOption((o) =>
          o.setName('target').setDescription('Chọn embed cần xóa').setRequired(true).setAutocomplete(true)
        )
        .addStringOption((o) =>
          o.setName('confirm').setDescription('Gõ chính xác tên embed để xác nhận xóa').setRequired(true)
        ),
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
