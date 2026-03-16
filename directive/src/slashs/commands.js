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
        .addStringOption((o) => o.setName('warn').setDescription('time_warn (dd:hh:mm)'))
        .addStringOption((o) => o.setName('mute').setDescription('time_mute (dd:hh:mm)'))
        .addStringOption((o) => o.setName('lock').setDescription('time_lock (dd:hh:mm)'))
        .addStringOption((o) => o.setName('new').setDescription('time_new (dd:hh:mm)'))
        .addStringOption((o) => o.setName('all').setDescription('Same duration for all four')),
  },
  {
    name: 'statusrole',
    script: 'StatusRole',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addStringOption((o) => o.setName('warn').setDescription('Role name for Warn'))
        .addStringOption((o) => o.setName('mute').setDescription('Role name for Mute'))
        .addStringOption((o) => o.setName('lock').setDescription('Role name for Lock'))
        .addStringOption((o) => o.setName('new').setDescription('Role name for Newbie')),
  },
  {
    name: 'statusunrole',
    script: 'StatusUnrole',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
<<<<<<< HEAD
        .addRoleOption((o) => o.setName('mute').setDescription('Role to remove on Mute'))
        .addRoleOption((o) => o.setName('lock').setDescription('Role to remove on Lock')),
=======
        .addStringOption((o) => o.setName('mute').setDescription('Role ID to remove on Mute (numeric)'))
        .addStringOption((o) => o.setName('lock').setDescription('Role ID to remove on Lock (numeric)')),
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
  },
  {
    name: 'categoryinfo',
    script: 'CategoryInfo',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('target').setDescription('Category (default: current channel category)').addChannelTypes(ChannelType.GuildCategory)
      ),
  },
  {
    name: 'categoryclone',
    script: 'CategoryClone',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b
        .addChannelOption((o) =>
          o.setName('target').setDescription('Category to clone').addChannelTypes(ChannelType.GuildCategory)
        )
        .addIntegerOption((o) => o.setName('number').setDescription('Number of copies (default 1)').setMinValue(1).setMaxValue(10)),
  },
  {
    name: 'categoryprivate',
    script: 'CategoryPrivate',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('target').setDescription('Category').addChannelTypes(ChannelType.GuildCategory)
      ),
  },
  {
    name: 'categorypublic',
    script: 'CategoryPublic',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('target').setDescription('Category').addChannelTypes(ChannelType.GuildCategory)
      ),
  },
  {
    name: 'channelinfo',
    script: 'ChannelInfo',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('target').setDescription('Channel (default: current)').addChannelTypes(
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
        .addChannelOption((o) => o.setName('target').setDescription('Channel to clone'))
        .addIntegerOption((o) => o.setName('number').setDescription('Number of copies (default 1)').setMinValue(1).setMaxValue(10)),
  },
  {
    name: 'channelsync',
    script: 'ChannelSync',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Channel')),
  },
  {
    name: 'channelprivate',
    script: 'ChannelPrivate',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Channel')),
  },
  {
    name: 'channelpublic',
    script: 'ChannelPublic',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Channel')),
  },
  {
    name: 'channelsfw',
    script: 'ChannelSFW',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Channel')),
  },
  {
    name: 'channelnsfw',
    script: 'ChannelNSFW',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Channel')),
<<<<<<< HEAD
  },
  {
    name: 'channelslow',
    script: 'ChannelSlow',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b
        .addIntegerOption((o) =>
          o.setName('seconds').setDescription('Slowmode seconds (0-21600)').setMinValue(0).setMaxValue(21600).setRequired(true)
        )
        .addChannelOption((o) => o.setName('target').setDescription('Channel')),
  },
  {
    name: 'channelunslow',
    script: 'ChannelUnslow',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addChannelOption((o) => o.setName('target').setDescription('Channel')),
  },
  {
    name: 'channelbitrate',
    script: 'ChannelBitrate',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b
        .addChannelOption((o) =>
          o.setName('target').setDescription('Voice channel').addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice).setRequired(true)
        )
        .addIntegerOption((o) =>
          o.setName('bitrate').setDescription('Bitrate in kbps (0 = max)').setMinValue(0).setRequired(true)
        ),
  },
  {
    name: 'channellimit',
    script: 'ChannelLimit',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    options: (b) =>
      b
        .addChannelOption((o) =>
          o.setName('target').setDescription('Voice channel').addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice).setRequired(true)
        )
        .addIntegerOption((o) =>
          o.setName('limit').setDescription('User limit (0 = unlimited)').setMinValue(0).setMaxValue(99)
        ),
=======
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
  },
  {
    name: 'memberinfo',
    script: 'MemberInfo',
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Member (default: self)')),
  },
  {
    name: 'memberrename',
    script: 'MemberRename',
    defaultMemberPermissions: PermissionFlagsBits.ManageNicknames,
    options: (b) =>
      b
        .addStringOption((o) => o.setName('setname').setDescription('New display name').setRequired(true))
        .addUserOption((o) => o.setName('target').setDescription('Member (default: self)')),
  },
  {
    name: 'memberlevel',
    script: 'MemberSetlevel',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addIntegerOption((o) => o.setName('setlevel').setDescription('New level (within Levels range)').setRequired(true))
        .addUserOption((o) => o.setName('target').setDescription('Member (default: self)')),
  },
  {
    name: 'membermove',
    script: 'MemberMove',
    defaultMemberPermissions: PermissionFlagsBits.MoveMembers,
    options: (b) =>
      b
        .addChannelOption((o) =>
          o.setName('channel').setDescription('Destination voice channel').addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice).setRequired(true)
        )
        .addUserOption((o) => o.setName('target').setDescription('Member (empty = all in voice)')),
  },
  {
    name: 'memberreset',
    script: 'MemberReset',
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Member').setRequired(true)),
  },
  {
    name: 'memberwarn',
    script: 'MemberWarn',
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Member').setRequired(true)),
  },
  {
    name: 'membermute',
    script: 'MemberMute',
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Member').setRequired(true)),
  },
  {
    name: 'memberlock',
    script: 'MemberLock',
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Member').setRequired(true)),
  },
  {
    name: 'memberkick',
    script: 'MemberKick',
    defaultMemberPermissions: PermissionFlagsBits.KickMembers,
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Member').setRequired(true)),
  },
  {
    name: 'greetingchannel',
    script: 'GreetingChannel',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('channel').setDescription('Greeting message channel').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true)
      ),
  },
  {
    name: 'leavingchannel',
    script: 'LeavingChannel',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('channel').setDescription('Leaving message channel').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true)
      ),
  },
  {
    name: 'boostingchannel',
    script: 'BoostingChannel',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('channel').setDescription('Boost message channel').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true)
      ),
  },
  {
    name: 'greetingmessage',
    script: 'GreetingMessage',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addStringOption((o) =>
        o.setName('embed').setDescription('Embed name (created in server)').setRequired(true).setAutocomplete(true)
      ),
  },
  {
    name: 'leavingmessage',
    script: 'LeavingMessage',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addStringOption((o) =>
        o.setName('embed').setDescription('Embed name (created in server)').setRequired(true).setAutocomplete(true)
      ),
  },
  {
    name: 'boostingmessage',
    script: 'BoostingMessage',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addStringOption((o) =>
        o.setName('embed').setDescription('Embed name (created in server)').setRequired(true).setAutocomplete(true)
      ),
  },
  {
    name: 'greetingtest',
    script: 'GreetingTest',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
  },
  {
    name: 'leavingtest',
    script: 'LeavingTest',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
  },
  {
    name: 'boostingtest',
    script: 'BoostingTest',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
  },
  {
    name: 'levelingchannel',
    script: 'LevelingChannel',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('channel').setDescription('Leveling message channel').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true)
      ),
  },
  {
    name: 'loggingchannel',
    script: 'LoggingChannel',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addChannelOption((o) =>
        o.setName('channel').setDescription('Logging message channel').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true)
      ),
  },
  {
    name: 'levelingmessage',
    script: 'LevelingMessage',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addStringOption((o) =>
        o.setName('embed').setDescription('Embed name (created in server)').setRequired(true).setAutocomplete(true)
      ),
  },
  {
    name: 'loggingmessage',
    script: 'LoggingMessage',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addStringOption((o) =>
        o.setName('embed').setDescription('Embed name (created in server)').setRequired(true).setAutocomplete(true)
      ),
  },
  {
    name: 'levelingtest',
    script: 'LevelingTest',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
  },
  {
    name: 'loggingtest',
    script: 'LoggingTest',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
  },
  {
    name: 'embedcreate',
    script: 'EmbedCreate',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) => b.addStringOption((o) => o.setName('name').setDescription('Embed name').setRequired(true)),
  },
  {
    name: 'embededit',
    script: 'EmbedEdit',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b.addStringOption((o) =>
        o.setName('target').setDescription('Embed to edit').setRequired(true).setAutocomplete(true)
      ),
  },
  {
    name: 'embedrename',
    script: 'EmbedRename',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addStringOption((o) =>
          o.setName('target').setDescription('Embed to rename').setRequired(true).setAutocomplete(true)
        )
        .addStringOption((o) => o.setName('newname').setDescription('New name').setRequired(true)),
  },
  {
    name: 'embeddelete',
    script: 'EmbedDelete',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addStringOption((o) =>
          o.setName('target').setDescription('Embed to delete').setRequired(true).setAutocomplete(true)
        )
        .addStringOption((o) =>
          o.setName('confirm').setDescription('Type embed name to confirm delete').setRequired(true)
        ),
  },
  {
    name: 'levellocal',
    script: 'LevelLocal',
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('Member (default: self)')),
  },
  {
    name: 'levelglobal',
    script: 'LevelGlobal',
    options: (b) => b.addUserOption((o) => o.setName('target').setDescription('User (default: self)')),
  },
  {
    name: 'toplocal',
    script: 'TopLocal',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
  },
  {
    name: 'topglobal',
    script: 'TopGlobal',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
  },
  {
    name: 'messagesend',
    script: 'MessageSend',
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    options: (b) =>
      b
        .addChannelOption((o) =>
          o
            .setName('channel')
            .setDescription('Target channel (default: current)')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        )
        .addStringOption((o) =>
          o
            .setName('embed')
            .setDescription('Embed (from saved embeds list)')
            .setAutocomplete(true)
        )
        .addStringOption((o) =>
          o
            .setName('input')
            .setDescription('Raw embed JSON')
        ),
  },
  {
    name: 'messagedele',
    script: 'MessageDele',
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    options: (b) =>
      b
        .addIntegerOption((o) =>
          o
            .setName('number')
            .setDescription('How many messages to delete (optional; empty = delete all possible)')
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(false)
        )
        .addRoleOption((o) =>
          o
            .setName('role')
            .setDescription('Only delete messages from members with this role')
        )
        .addUserOption((o) =>
          o
            .setName('member')
            .setDescription('Only delete messages from this member')
        )
        .addChannelOption((o) =>
          o
            .setName('channel')
            .setDescription('Target channel (default: current)')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        ),
  },
  {
    name: 'levelcheck',
    script: 'LevelCheck',
    options: (b) =>
      b.addUserOption((o) =>
        o.setName('target').setDescription('Target member (default: you)')
      ),
  },
  { name: 'dashboard', script: 'Dashboard' },
  { name: 'variables', script: 'Variables' },
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
