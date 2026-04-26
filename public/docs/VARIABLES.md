# Discord Counselor — Variables Reference

> Custom variable system for messages, embeds, and command responses.
> Syntax: `{variable_name}` or `{variable_name: argument}`.

---

## Placeholders (Phase 4)

Automatic replacement variables that do not require arguments. Used within message content and embeds.

### User Variables

| Group | Name                    | Value       | Description                               |
| ----- | ----------------------- | ----------- | ----------------------------------------- |
| User  | `{user}`                | `@Username` | Pings the user who triggered the command. |
| User  | `{user_tag}`            | `User#1234` | Username + Tag.                           |
| User  | `{user_name}`           | `Username`  | Username without tag.                     |
| User  | `{user_avatar}`         | URL         | User's avatar image link.                 |
| User  | `{user_discrim}`        | `1234`      | Discriminator tag.                        |
| User  | `{user_id}`             | `123456789` | User ID.                                  |
| User  | `{user_nick}`           | `Nickname`  | Server nickname.                          |
| User  | `{user_joindate}`       | Date        | Server join date.                         |
| User  | `{user_createdate}`     | Date        | Discord account creation date.            |
| User  | `{user_displaycolor}`   | `#FF5733`   | User's display color based on roles.      |
| User  | `{user_boostsince}`     | Date        | Server boost start date.                  |
| User  | `{user_balance}`        | Number      | User's currency balance.                  |
| User  | `{user_balance_locale}` | `1,000`     | Formatted currency balance.               |
| User  | `{user_item}`           | String      | Item currently held by user.              |
| User  | `{user_item_count}`     | Number      | Item quantity.                            |
| User  | `{user_inventory}`      | List        | User's inventory list.                    |
| User  | `{user_exp}`            | Number      | Global experience points.                 |
| User  | `{user_rank}`           | Number      | Global rank.                              |
| User  | `{member_exp}`          | Number      | Local server experience points.           |
| User  | `{member_level}`        | Number      | Local server level.                       |
| User  | `{member_rank}`         | Number      | Local server rank.                        |

### Assets & Icons

| Group  | Name                | Value | Description                      |
| ------ | ------------------- | ----- | -------------------------------- |
| Banner | `{blank_banner}`    | URL   | Default banner URL for Blank.    |
| Banner | `{imposter_banner}` | URL   | Default banner URL for Imposter. |
| Banner | `{manycat_banner}`  | URL   | Default banner URL for Manycat.  |
| Banner | `{nahihi_banner}`   | URL   | Default banner URL for Nahihi.   |
| Banner | `{whitepet_banner}` | URL   | Default banner URL for Whitepet. |
| Banner | `{goodjob_banner}`  | URL   | Default banner URL for Goodjob.  |
| Icon   | `{paimom_icon}`     | URL   | Default icon URL for Paimom.     |
| Icon   | `{march71_icon}`    | URL   | Default icon URL for March71.    |
| Icon   | `{march72_icon}`    | URL   | Default icon URL for March72.    |

### Server Variables

| Group  | Name                                     | Value       | Description                             |
| ------ | ---------------------------------------- | ----------- | --------------------------------------- |
| Server | `{server_prefix}`                        | String      | Current server prefix.                  |
| Server | `{server_currency}`                      | String      | Server currency unit.                   |
| Server | `{server_name}`                          | String      | Server name.                            |
| Server | `{server_id}`                            | String      | Server ID.                              |
| Server | `{server_membercount}`                   | Number      | Total member count.                     |
| Server | `{server_membercount_ordinal}`           | `1st`       | Member count (ordinal).                 |
| Server | `{server_membercount_nobots}`            | Number      | Member count excluding bots.            |
| Server | `{server_membercount_nobots_ordinal}`    | `1st`       | Member count excluding bots (ordinal).  |
| Server | `{server_botcount}`                      | Number      | Total bot count.                        |
| Server | `{server_botcount_ordinal}`              | `1st`       | Bot count (ordinal).                    |
| Server | `{server_icon}`                          | URL         | Server icon link.                       |
| Server | `{server_banner}`                        | URL         | Server banner link.                     |
| Server | `{server_rolecount}`                     | Number      | Total role count.                       |
| Server | `{server_channelcount}`                  | Number      | Total channel count.                    |
| Server | `{server_randommember}`                  | `@User`     | Randomly selected member (ping).        |
| Server | `{server_randommember_tag}`              | `User#1234` | Random member's tag.                    |
| Server | `{server_randommember_nobots}`           | `@User`     | Random member excluding bots (ping).    |
| Server | `{server_owner}`                         | `@Owner`    | Pings the server owner.                 |
| Server | `{server_owner_id}`                      | String      | Server owner ID.                        |
| Server | `{server_createdate}`                    | Date        | Server creation date.                   |
| Server | `{server_boostlevel}`                    | `1/2/3`     | Current Boost level.                    |
| Server | `{server_boostcount}`                    | Number      | Current Boost count.                    |
| Server | `{server_nextboostlevel}`                | `2/3`       | Next Boost level.                       |
| Server | `{server_nextboostlevel_required}`       | Number      | Boosts required for next level.         |
| Server | `{server_nextboostlevel_until_required}` | Number      | Remaining boosts needed for next level. |
| Server | `{server_status}`                        | String      | Subscription status (Standard/Premium/Deluxe). |
| Server | `{server_class}`                         | String      | Alias for `{server_status}`.            |

### Channel & Message Variables

| Group   | Name                   | Value      | Description                           |
| ------- | ---------------------- | ---------- | ------------------------------------- |
| Channel | `{channel}`            | `#channel` | Pings the current channel.            |
| Channel | `{channel_name}`       | String     | Current channel name.                 |
| Channel | `{channel_createdate}` | Date       | Channel creation date.                |
| Channel | `{rule_channel}`       | `#rules`   | Rules/Guidelines channel (Community). |
| Message | `{message_link}`       | URL        | Link to the command message.          |
| Message | `{message_id}`         | String     | Message ID.                           |
| Message | `{message_content}`    | String     | Original message content.             |
| Misc    | `{date}`               | DateTime   | Current date and time.                |
| Misc    | `{newline}`            | `\n`       | New line character.                   |
| Misc    | `{embed_name}`         | String     | Embed name from metadata.             |

---

## Advanced Logic (Phase 4)

Logic variables that require arguments.

| Group | Name                             | Value         | Description                            |
| ----- | -------------------------------- | ------------- | -------------------------------------- |
| Logic | `{range: 1-100}`                 | Random Number | Generates a random number in range.    |
| Logic | `{choose: A; B; C}`              | Random Pick   | Randomly selects one item.             |
| Logic | `{lockedchoose: A; B}`           | Locked Pick   | Random select, fixed result per user.  |
| Logic | `{weightedchoose: A 50%; B 50%}` | Weighted Pick | Random selection based on percentages. |
| Logic | `[choice]`                       | Result        | Retrieves result from `choose`.        |
| Logic | `[lockedchoice]`                 | Result        | Retrieves result from `lockedchoose`.  |
| Logic | `[$1]`, `[$2]`, ...              | Argument      | Retrieves the N-th user argument.      |

---

## Modifiers (Phase 2)

Controls how the bot sends responses.

| Group    | Name                   | Value      | Description                           |
| -------- | ---------------------- | ---------- | ------------------------------------- |
| Modifier | `{dm}`                 | —          | Sends response via Direct Message.    |
| Modifier | `{sendto: channel_id}` | Channel ID | Sends response to a specific channel. |
| Modifier | `{embed: embed_id}`    | Embed ID   | Calls an embed template from DB.      |
| Modifier | `{silent}`             | —          | Sends message silently.               |
| Modifier | `{delete}`             | —          | Deletes the trigger message.          |
| Modifier | `{delete_reply: 5}`    | Seconds    | Deletes bot response after X seconds. |

---

## Guards (Phase 1)

Pre-execution conditions. If not met, the command is denied.

| Group   | Name                   | Value      | Description                      |
| ------- | ---------------------- | ---------- | -------------------------------- |
| Require | `{requireuser: id}`    | User ID    | Restricts to a specific user.    |
| Require | `{requireperm: perm}`  | Permission | Requires specific permission.    |
| Require | `{requirechannel: id}` | Channel ID | Restricts to specific channel.   |
| Require | `{requirerole: id}`    | Role ID    | Requires a specific Role.        |
| Require | `{requirebal: amount}` | Number     | Requires X currency.             |
| Require | `{requireitem: name}`  | Item Name  | Requires a specific item.        |
| Require | `{requirearg: text}`   | Argument   | Requires user input arguments.   |
| Deny    | `{denyuser: id}`       | User ID    | Blocks a specific user.          |
| Deny    | `{denyperm: perm}`     | Permission | Blocks users with permission.    |
| Deny    | `{denychannel: id}`    | Channel ID | Blocks specific channel usage.   |
| Deny    | `{denyrole: id}`       | Role ID    | Blocks users with specific Role. |
| Deny    | `{denyitem: name}`     | Item Name  | Blocks if user has item.         |
| Rate    | `{cooldown: seconds}`  | Seconds    | Cooldown between command usage.  |

---

## Actions (Phase 3)

Secondary actions executed alongside the response.

| Group   | Name                         | Value          | Description                    |
| ------- | ---------------------------- | -------------- | ------------------------------ |
| Economy | `{modifybal: +100}`          | ±Number        | Adds/Subtracts currency.       |
| Economy | `{modifyinv: item}`          | Item           | Adds/Removes inventory item.   |
| Role    | `{addrole: id}`              | Role ID        | Assigns role to user.          |
| Role    | `{removerole: id}`           | Role ID        | Removes role from user.        |
| Profile | `{setnick: name}`            | Nickname       | Changes user nickname.         |
| React   | `{react: emoji}`             | Emoji          | Bot reacts to trigger message. |
| React   | `{reactreply: emoji}`        | Emoji          | Bot reacts to its response.    |
| UI      | `{addbutton: label\|script}` | Label + Script | Adds an interactive button.    |
| UI      | `{addlinkbutton: label\|url}`| Label + URL    | Adds a web link button.        |
