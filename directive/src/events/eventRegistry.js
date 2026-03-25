/**
 * Registry: Discord event → script và cách build context.
 * Thuật toán "nhận dạng hành động" (event nào gọi script nào) nằm ở đây, không hardcode trong index hay script.
 */

/** Discord event name (Events.*) → { scriptName, buildContext(payload) } */
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
  {
    discordEvent: 'GuildMemberUpdate',
    scriptName: 'MemberBoosting',
    buildContext: (oldMember, newMember) => {
      const hadBoost = !!oldMember?.premiumSince;
      const hasBoost = !!newMember?.premiumSince;
      if (!hasBoost || hadBoost) return null;
      return { guild: newMember.guild, member: newMember };
    },
  },
  {
    discordEvent: 'VoiceStateUpdate',
    scriptName: 'ChannelCreate',
    buildContext: (oldState, newState) => ({ oldState, newState }),
  },
];
