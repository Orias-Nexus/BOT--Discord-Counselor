/**
 * Registry: Discord event → script và cách build context.
 * Thuật toán "nhận dạng hành động" (event nào gọi script nào) nằm ở đây, không hardcode trong index hay script.
 */

/** Discord event name (Events.GuildMemberAdd) → { scriptName, buildContext(payload) } */
export const EVENT_HANDLERS = [
  {
    discordEvent: 'GuildMemberAdd',
    scriptName: 'MemberGreeting',
    buildContext: (member) => ({ guild: member.guild, member }),
  },
  {
    discordEvent: 'GuildMemberRemove',
    scriptName: 'MemberLeaving',
    buildContext: (member) => ({ guild: member.guild, member }),
  },
];
