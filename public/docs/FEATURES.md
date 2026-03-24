# Discord Counselor — Features

> Danh sách tính năng của hệ thống, ánh xạ theo Script → Slash / Event / Action.

---

## Server Management


| Name              | Script            | Slash                | Event | Action           | Descript                                                                    | Status |
| ----------------- | ----------------- | -------------------- | ----- | ---------------- | --------------------------------------------------------------------------- | ------ |
| Server Info       | `ServerInfo`      | `/serverinfo`        | null  | `ServerInfo`     | Hiển thị thông tin tổng quan của server (members, roles, channels, boosts). | [x]    |
| Status Timeout    | `StatusTimeout`   | `/statustimeout`     | null  | null             | Cấu hình thời gian timeout cho Warn / Mute / Lock / New.                    | [x]    |
| Status Role       | `StatusRole`      | `/statusrole`        | null  | null             | Gán Role name cho các trạng thái Warn / Mute / Lock / Newbie.               | [x]    |
| Status Unrole     | `StatusUnrole`    | `/statusunrole`      | null  | null             | Gán Unrole ID (role phục hồi khi bị Mute / Lock).                           | [x]    |
| Set Voice Creator | `SetVoiceCreator` | `/setvoicecreator`   | null  | null             | Chỉ định kênh voice creator tự động tạo phòng riêng.                        | [x]    |
| Set Server Stats  | `SetServerStats`  | `/setserverstats`    | null  | `SetServerStats` | Tạo/cập nhật category hiển thị thống kê server (Members, Bots, Roles...).   | [x]    |


## Category Management


| Name             | Script            | Slash             | Event | Action            | Descript                                      | Status |
| ---------------- | ----------------- | ----------------- | ----- | ----------------- | --------------------------------------------- | ------ |
| Category Info    | `CategoryInfo`    | `/categoryinfo`   | null  | `CategoryInfo`    | Hiển thị thông tin chi tiết của một category. | [x]    |
| Category Clone   | `CategoryClone`   | `/categoryclone`  | null  | `CategoryClone`   | Nhân bản toàn bộ category kèm các kênh con.   | [x]    |
| Category Private | `CategoryPrivate` | `/categoryprivate`| null  | `CategoryPrivate` | Ẩn category khỏi @everyone.                   | [x]    |
| Category Public  | `CategoryPublic`  | `/categorypublic` | null  | `CategoryPublic`  | Hiện category cho @everyone.                  | [x]    |


## Channel Management


| Name            | Script           | Slash              | Event              | Action           | Descript                                              | Status |
| --------------- | ---------------- | ------------------ | ------------------ | ---------------- | ----------------------------------------------------- | ------ |
| Channel Info    | `ChannelInfo`    | `/channelinfo`     | null               | `ChannelInfo`    | Hiển thị thông tin chi tiết của kênh.                 | [x]    |
| Channel Clone   | `ChannelClone`   | `/channelclone`    | null               | `ChannelClone`   | Nhân bản kênh hiện tại (tối đa 10 bản).               | [x]    |
| Channel Create  | `ChannelCreate`  | null               | `VoiceStateUpdate` | `ChannelCreate`  | Tự động tạo phòng voice riêng khi join voice creator. | [x]    |
| Channel Sync    | `ChannelSync`    | `/channelsync`     | null               | `ChannelSync`    | Đồng bộ permissions kênh theo category cha.           | [x]    |
| Channel Private | `ChannelPrivate` | `/channelprivate`  | null               | `ChannelPrivate` | Ẩn kênh khỏi @everyone.                               | [x]    |
| Channel Public  | `ChannelPublic`  | `/channelpublic`   | null               | `ChannelPublic`  | Hiện kênh cho @everyone.                              | [x]    |
| Channel SFW     | `ChannelSFW`     | `/channelsfw`      | null               | `ChannelSFW`     | Tắt chế độ NSFW cho kênh.                             | [x]    |
| Channel NSFW    | `ChannelNSFW`    | `/channelnsfw`     | null               | `ChannelNSFW`    | Bật chế độ NSFW cho kênh.                             | [x]    |


## Member Management


| Name             | Script           | Slash              | Event | Action           | Descript                                         | Status |
| ---------------- | ---------------- | ------------------ | ----- | ---------------- | ------------------------------------------------ | ------ |
| Member Info      | `MemberInfo`     | `/memberinfo`      | null  | `MemberInfo`     | Xem hồ sơ thành viên (level, status, EXP).       | [x]    |
| Member Rename    | `MemberRename`   | `/memberrename`    | null  | `MemberRename`   | Đổi biệt danh (nickname) của thành viên.         | [x]    |
| Member Set Level | `MemberSetlevel` | `/memberlevel`     | null  | `MemberSetlevel` | Gán level thủ công cho thành viên.               | [x]    |
| Member Move      | `MemberMove`     | `/membermove`      | null  | `MemberMove`     | Di chuyển thành viên sang kênh voice khác.       | [x]    |
| Member Reset     | `MemberReset`    | `/memberreset`     | null  | `MemberReset`    | Reset trạng thái thành viên về Good.             | [x]    |
| Member Warn      | `MemberWarn`     | `/memberwarn`      | null  | `MemberWarn`     | Cảnh cáo thành viên (gán role Warn, tự hết hạn). | [x]    |
| Member Mute      | `MemberMute`     | `/membermute`      | null  | `MemberMute`     | Cấm chat thành viên (gán role Mute, tự hết hạn). | [x]    |
| Member Lock      | `MemberLock`     | `/memberlock`      | null  | `MemberLock`     | Khoá toàn bộ quyền của thành viên.               | [x]    |
| Member Kick      | `MemberKick`     | `/memberkick`      | null  | `MemberKick`     | Kick thành viên khỏi server.                     | [x]    |


## Auto Events


| Name            | Script           | Slash | Event               | Action | Descript                                              | Status |
| --------------- | ---------------- | ----- | ------------------- | ------ | ----------------------------------------------------- | ------ |
| Member Greeting | `MemberGreeting` | null  | `GuildMemberAdd`    | null   | Tự động gửi tin nhắn chào mừng khi có thành viên mới. | [x]    |
| Member Leaving  | `MemberLeaving`  | null  | `GuildMemberRemove` | null   | Tự động gửi tin nhắn tạm biệt khi có thành viên rời.  | [x]    |
| Member Boosting | `MemberBoosting` | null  | `GuildMemberUpdate` | null   | Tự động gửi tin nhắn cảm ơn khi có thành viên boost.  | [x]    |


## Event Configuration


| Name             | Script            | Slash               | Event | Action            | Descript                          | Status |
| ---------------- | ----------------- | ------------------- | ----- | ----------------- | --------------------------------- | ------ |
| Greeting Channel | `GreetingChannel` | `/greetingchannel`  | null  | `GreetingChannel` | Chọn kênh gửi tin chào mừng.      | [x]    |
| Greeting Message | `GreetingMessage` | `/greetingmessage`  | null  | `GreetingMessage` | Chọn embed cho tin chào mừng.     | [x]    |
| Leaving Channel  | `LeavingChannel`  | `/leavingchannel`   | null  | `LeavingChannel`  | Chọn kênh gửi tin tạm biệt.       | [x]    |
| Leaving Message  | `LeavingMessage`  | `/leavingmessage`   | null  | `LeavingMessage`  | Chọn embed cho tin tạm biệt.      | [x]    |
| Boosting Channel | `BoostingChannel` | `/boostingchannel`  | null  | `BoostingChannel` | Chọn kênh gửi tin boost.          | [x]    |
| Boosting Message | `BoostingMessage` | `/boostingmessage`  | null  | `BoostingMessage` | Chọn embed cho tin boost.         | [x]    |


## Embed Builder


| Name              | Script            | Slash           | Event | Action            | Descript                               | Status |
| ----------------- | ----------------- | --------------- | ----- | ----------------- | -------------------------------------- | ------ |
| Embed Create      | `EmbedCreate`     | `/embedcreate`  | null  | `EmbedCreate`     | Tạo embed template mới cho server.     | [x]    |
| Embed Edit        | `EmbedEdit`       | `/embededit`    | null  | `EmbedEdit`       | Menu chỉnh sửa embed (nút).            | [x]    |
| Embed Rename      | `EmbedRename`     | `/embedrename`  | null  | `EmbedRename`     | Đổi tên embed template.                | [x]    |
| Embed Delete      | `EmbedDelete`     | `/embeddelete`  | null  | `EmbedDelete`     | Xoá embed template.                    | [x]    |
| Embed Apply       | `EmbedApply`      | `/embedapply`   | null  | `EmbedApply`      | Gắn embed vào message type (Greeting/Leaving/Boosting). | [x]    |
| Message Send      | `MessageSend`     | `/messagesend`  | null  | `MessageSend`     | Gửi 1 embed (từ DB hoặc raw JSON) vào kênh. | [x] |
| Message Delete    | `MessageDele`     | `/messagedele`  | null  | `MessageDele`     | Xoá hàng loạt message theo filter; `number` rỗng = xoá hết, `role/member` rỗng = mọi người. | [x] |


