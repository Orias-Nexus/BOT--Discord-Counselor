# Discord Counselor — Features

> Danh sách tính năng của hệ thống, ánh xạ theo Script → Slash / Event / Action.

---

## Server Management

| Name | Script | Slash | Event | Action | Descript | Status |
|------|--------|-------|-------|--------|----------|--------|
| Server Info | `serverInfo` | `/server_info` | null | `ServerInfo` | Hiển thị thông tin tổng quan của server (members, roles, channels, boosts). | [x] |
| Status Timeout | `statusTimeout` | `/status_timeout` | null | null | Cấu hình thời gian timeout cho Warn / Mute / Lock / New. | [x] |
| Status Role | `statusRole` | `/status_role` | null | null | Gán Role ID cho các trạng thái Warn / Mute / Lock / New. | [x] |
| Status Unrole | `statusUnrole` | `/status_unrole` | null | null | Gán Unrole ID (role phục hồi khi bị Mute / Lock). | [x] |
| Set Voice Creator | `setVoiceCreator` | `/set_voice_creator` | null | null | Chỉ định kênh voice creator tự động tạo phòng riêng. | [x] |
| Set Server Stats | `setServerStats` | `/set_server_stats` | null | `SetServerStats` | Tạo/cập nhật category hiển thị thống kê server (Members, Bots, Roles...). | [x] |

## Category Management

| Name | Script | Slash | Event | Action | Descript | Status |
|------|--------|-------|-------|--------|----------|--------|
| Category Info | `categoryInfo` | `/category_info` | null | `CategoryInfo` | Hiển thị thông tin chi tiết của một category. | [x] |
| Category Clone | `categoryClone` | `/category_clone` | null | `CategoryClone` | Nhân bản toàn bộ category kèm các kênh con. | [x] |
| Category Private | `categoryPrivate` | null | null | `CategoryPrivate` | Ẩn category khỏi @everyone. | [x] |
| Category Public | `categoryPublic` | null | null | `CategoryPublic` | Hiện category cho @everyone. | [x] |

## Channel Management

| Name | Script | Slash | Event | Action | Descript | Status |
|------|--------|-------|-------|--------|----------|--------|
| Channel Info | `chanelInfo` | `/channel_info` | null | `ChanelInfo` | Hiển thị thông tin chi tiết của kênh. | [x] |
| Channel Clone | `channelClone` | `/channel_clone` | null | `ChannelClone` | Nhân bản kênh hiện tại (tối đa 10 bản). | [x] |
| Channel Create | `channelCreate` | null | `VoiceStateUpdate` | `ChannelCreate` | Tự động tạo phòng voice riêng khi join voice creator. | [x] |
| Channel Sync | `channelSync` | `/channel_sync` | null | `ChannelSync` | Đồng bộ permissions kênh theo category cha. | [x] |
| Channel Private | `channelPrivate` | `/channel_private` | null | `ChannelPrivate` | Ẩn kênh khỏi @everyone. | [x] |
| Channel Public | `channelPublic` | `/channel_public` | null | `ChannelPublic` | Hiện kênh cho @everyone. | [x] |
| Channel SFW | `channelSFW` | null | null | `ChannelSFW` | Tắt chế độ NSFW cho kênh. | [x] |
| Channel NSFW | `channelNSFW` | null | null | `ChannelNSFW` | Bật chế độ NSFW cho kênh. | [x] |

## Member Management

| Name | Script | Slash | Event | Action | Descript | Status |
|------|--------|-------|-------|--------|----------|--------|
| Member Info | `memberInfo` | `/member_info` | null | `MemberInfo` | Xem hồ sơ thành viên (level, status, EXP). | [x] |
| Member Rename | `memberRename` | `/member_rename` | null | `MemberRename` | Đổi biệt danh (nickname) của thành viên. | [x] |
| Member Set Level | `memberSetlevel` | `/member_setlevel` | null | `MemberSetlevel` | Gán level thủ công cho thành viên. | [x] |
| Member Move | `memberMove` | `/member_move` | null | `MemberMove` | Di chuyển thành viên sang kênh voice khác. | [x] |
| Member Reset | `memberReset` | `/member_reset` | null | `MemberReset` | Reset trạng thái thành viên về Good. | [x] |
| Member Warn | `memberWarn` | `/member_warn` | null | `MemberWarn` | Cảnh cáo thành viên (gán role Warn, tự hết hạn). | [x] |
| Member Mute | `memberMute` | `/member_mute` | null | `MemberMute` | Cấm chat thành viên (gán role Mute, tự hết hạn). | [x] |
| Member Lock | `memberLock` | `/member_lock` | null | `MemberLock` | Khoá toàn bộ quyền của thành viên. | [x] |
| Member Kick | `memberKick` | `/member_kick` | null | `MemberKick` | Kick thành viên khỏi server. | [x] |

## Auto Events

| Name | Script | Slash | Event | Action | Descript | Status |
|------|--------|-------|-------|--------|----------|--------|
| Member Greeting | `memberGreeting` | null | `GuildMemberAdd` | null | Tự động gửi tin nhắn chào mừng khi có thành viên mới. | [x] |
| Member Leaving | `memberLeaving` | null | `GuildMemberRemove` | null | Tự động gửi tin nhắn tạm biệt khi có thành viên rời. | [x] |
| Member Boosting | `memberBoosting` | null | `GuildMemberUpdate` | null | Tự động gửi tin nhắn cảm ơn khi có thành viên boost. | [x] |

## Event Configuration

| Name | Script | Slash | Event | Action | Descript | Status |
|------|--------|-------|-------|--------|----------|--------|
| Greeting Channel | `greetingChannel` | `/greeting_channel` | null | `GreetingChannel` | Chọn kênh gửi tin chào mừng. | [x] |
| Greeting Message | `greetingMessage` | `/greeting_message` | null | `GreetingMessage` | Chỉnh sửa nội dung tin chào mừng. | [x] |
| Leaving Channel | `leavingChannel` | `/leaving_channel` | null | `LeavingChannel` | Chọn kênh gửi tin tạm biệt. | [x] |
| Leaving Message | `leavingMessage` | `/leaving_message` | null | `LeavingMessage` | Chỉnh sửa nội dung tin tạm biệt. | [x] |
| Boosting Channel | `boostingChannel` | `/boosting_channel` | null | `BoostingChannel` | Chọn kênh gửi tin boost. | [x] |
| Boosting Message | `boostingMessage` | `/boosting_message` | null | `BoostingMessage` | Chỉnh sửa nội dung tin boost. | [x] |

## Embed Builder

| Name | Script | Slash | Event | Action | Descript | Status |
|------|--------|-------|-------|--------|----------|--------|
| Embed Create | `embedCreate` | `/embed_create` | null | `EmbedCreate` | Tạo embed template mới cho server. | [x] |
| Embed Edit | `embedEdit` | `/embed_edit` | null | `EmbedEdit` | Menu chỉnh sửa embed (chọn component). | [x] |
| Embed Edit Basic | `embedEditBasic` | null | null | `EmbedEditBasic` | Chỉnh sửa Title, Description, Color. | [x] |
| Embed Edit Author | `embedEditAuthor` | null | null | `EmbedEditAuthor` | Chỉnh sửa phần Author của embed. | [x] |
| Embed Edit Footer | `embedEditFooter` | null | null | `EmbedEditFooter` | Chỉnh sửa phần Footer của embed. | [x] |
| Embed Edit Images | `embedEditImages` | null | null | `EmbedEditImages` | Chỉnh sửa Thumbnail và Image URL. | [x] |
| Embed Rename | `embedRename` | null | null | `EmbedRename` | Đổi tên embed template. | [x] |
| Embed Delete | `embedDelete` | `/embed_delete` | null | `EmbedDelete` | Xoá embed template. | [x] |
| Embed Apply | `embedApply` | `/embed_apply` | null | `EmbedApply` | Gửi embed đã tạo vào kênh chỉ định. | [x] |
