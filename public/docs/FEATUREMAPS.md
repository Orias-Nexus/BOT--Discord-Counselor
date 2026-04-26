# Discord Counselor — Feature Map

> Comprehensive list of system features mapped by Script → Slash / Event / Action.

---

## Server Management

| Name              | Script            | Slash                | Event | Action           | Description                                                                 | Status |
| ----------------- | ----------------- | -------------------- | ----- | ---------------- | --------------------------------------------------------------------------- | ------ |
| Server Info       | `ServerInfo`      | `/serverinfo`        | null  | `ServerInfo`     | Displays server overview (members, roles, channels, boosts).                | [x]    |
| Status Timeout    | `StatusTimeout`   | `/statustimeout`     | null  | null             | Configures timeout durations for Warn / Mute / Lock / New statuses.         | [x]    |
| Status Role       | `StatusRole`      | `/statusrole`        | null  | null             | Assigns role names for Warn / Mute / Lock / Newbie statuses.                | [x]    |
| Status Unrole     | `StatusUnrole`    | `/statusunrole`      | null  | null             | Assigns Unrole ID (roles restored after Mute / Lock expires).               | [x]    |
| Set Voice Creator | `SetVoiceCreator` | `/setvoicecreator`   | null  | null             | Designates a voice creator channel for automatic private room generation.    | [x]    |
| Set Server Stats  | `SetServerStats`  | `/setserverstats`    | null  | `SetServerStats` | Creates/updates category for server statistics (Members, Bots, Roles, etc). | [x]    |

## Category Management

| Name             | Script            | Slash              | Event | Action            | Description                                   | Status |
| ---------------- | ----------------- | ------------------ | ----- | ----------------- | --------------------------------------------- | ------ |
| Category Info    | `CategoryInfo`    | `/categoryinfo`    | null  | `CategoryInfo`    | Displays detailed category information.        | [x]    |
| Category Clone   | `CategoryClone`   | `/categoryclone`   | null  | `CategoryClone`   | Clones an entire category and its sub-channels. | [x]    |
| Category Private | `CategoryPrivate` | `/categoryprivate` | null  | `CategoryPrivate` | Hides a category from @everyone.              | [x]    |
| Category Public  | `CategoryPublic`  | `/categorypublic`  | null  | `CategoryPublic`  | Makes a category visible to @everyone.        | [x]    |

## Channel Management

| Name            | Script           | Slash             | Event              | Action           | Description                                           | Status |
| --------------- | ---------------- | ----------------- | ------------------ | ---------------- | ----------------------------------------------------- | ------ |
| Channel Info    | `ChannelInfo`    | `/channelinfo`    | null               | `ChannelInfo`    | Displays detailed channel information.                | [x]    |
| Channel Clone   | `ChannelClone`   | `/channelclone`   | null               | `ChannelClone`   | Clones current channel (up to 10 copies).             | [x]    |
| Channel Create  | `ChannelCreate`  | null              | `VoiceStateUpdate` | `ChannelCreate`  | Auto-creates private voice rooms upon joining creator. | [x]    |
| Channel Sync    | `ChannelSync`    | `/channelsync`    | null               | `ChannelSync`    | Syncs channel permissions with parent category.       | [x]    |
| Channel Private | `ChannelPrivate` | `/channelprivate` | null               | `ChannelPrivate` | Hides channel from @everyone.                         | [x]    |
| Channel Public  | `ChannelPublic`  | `/channelpublic`  | null               | `ChannelPublic`  | Makes channel visible to @everyone.                   | [x]    |
| Channel SFW     | `ChannelSFW`     | `/channelsfw`     | null               | `ChannelSFW`     | Disables NSFW mode for the channel.                   | [x]    |
| Channel NSFW    | `ChannelNSFW`    | `/channelnsfw`    | null               | `ChannelNSFW`    | Enables NSFW mode for the channel.                    | [x]    |

## Member Management

| Name             | Script           | Slash           | Event | Action           | Description                                      | Status |
| ---------------- | ---------------- | --------------- | ----- | ---------------- | ------------------------------------------------ | ------ |
| Member Info      | `MemberInfo`     | `/memberinfo`   | null  | `MemberInfo`     | Views member profile (level, status, EXP).       | [x]    |
| Member Rename    | `MemberRename`   | `/memberrename` | null  | `MemberRename`   | Changes member nickname.                         | [x]    |
| Member Set Level | `MemberSetlevel` | `/memberlevel`  | null  | `MemberSetlevel` | Manually sets member level.                      | [x]    |
| Member Move      | `MemberMove`     | `/membermove`   | null  | `MemberMove`     | Moves member to another voice channel.           | [x]    |
| Member Reset     | `MemberReset`    | `/memberreset`  | null  | `MemberReset`    | Resets member status to Good.                    | [x]    |
| Member Warn      | `MemberWarn`     | `/memberwarn`   | null  | `MemberWarn`     | Warns member (assigns Warn role with expiry).    | [x]    |
| Member Mute      | `MemberMute`     | `/membermute`   | null  | `MemberMute`     | Mutes member (assigns Mute role with expiry).    | [x]    |
| Member Lock      | `MemberLock`     | `/memberlock`   | null  | `MemberLock`     | Locks all member permissions.                    | [x]    |
| Member Kick      | `MemberKick`     | `/memberkick`   | null  | `MemberKick`     | Kicks member from server.                        | [x]    |

## Auto Events

| Name            | Script           | Slash | Event               | Action | Description                                          | Status |
| --------------- | ---------------- | ----- | ------------------- | ------ | ---------------------------------------------------- | ------ |
| Member Greeting | `MemberGreeting` | null  | `GuildMemberAdd`    | null   | Automatically sends greeting message to new members. | [x]    |
| Member Leaving  | `MemberLeaving`  | null  | `GuildMemberRemove` | null   | Automatically sends goodbye message when members leave. | [x]    |
| Member Boosting | `MemberBoosting` | null  | `GuildMemberUpdate` | null   | Automatically sends thank you message for server boosts. | [x]    |

## Event Configuration

| Name             | Script            | Slash               | Event | Action            | Description                        | Status |
| ---------------- | ----------------- | ------------------- | ----- | ----------------- | ---------------------------------- | ------ |
| Greeting Channel | `GreetingChannel` | `/greetingchannel`  | null  | `GreetingChannel` | Sets the greeting message channel.  | [x]    |
| Greeting Message | `GreetingMessage` | `/greetingmessage`  | null  | `GreetingMessage` | Selects the greeting embed template. | [x]    |
| Leaving Channel  | `LeavingChannel`  | `/leavingchannel`   | null  | `LeavingChannel`  | Sets the goodbye message channel.   | [x]    |
| Leaving Message  | `LeavingMessage`  | `/leavingmessage`   | null  | `LeavingMessage`  | Selects the goodbye embed template.  | [x]    |
| Boosting Channel | `BoostingChannel` | `/boostingchannel`  | null  | `BoostingChannel` | Sets the boost message channel.     | [x]    |
| Boosting Message | `BoostingMessage` | `/boostingmessage`  | null  | `BoostingMessage` | Selects the boost embed template.    | [x]    |

## Embed Builder

| Name              | Script            | Slash           | Event | Action            | Description                             | Status |
| ----------------- | ----------------- | --------------- | ----- | ----------------- | --------------------------------------- | ------ |
| Embed Create      | `EmbedCreate`     | `/embedcreate`  | null  | `EmbedCreate`     | Creates a new server embed template.    | [x]    |
| Embed Edit        | `EmbedEdit`       | `/embededit`    | null  | `EmbedEdit`       | Interactive menu for embed editing.     | [x]    |
| Embed Rename      | `EmbedRename`     | `/embedrename`  | null  | `EmbedRename`     | Renames an embed template.              | [x]    |
| Embed Delete      | `EmbedDelete`     | `/embeddelete`  | null  | `EmbedDelete`     | Deletes an embed template.              | [x]    |
| Embed Apply       | `EmbedApply`      | `/embedapply`   | null  | `EmbedApply`      | Assigns embed to message types (Greeting/Leaving/Boosting). | [x]    |
| Message Send      | `MessageSend`     | `/messagesend`  | null  | `MessageSend`     | Sends an embed (from DB or raw JSON) to channel. | [x] |
| Message Delete    | `MessageDele`     | `/messagedele`  | null  | `MessageDele`     | Batch deletes messages with filters (number, role, member). | [x] |



