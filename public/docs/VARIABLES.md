# Discord Counselor — Variables Reference

> Hệ thống biến tuỳ chỉnh (Custom Variables) dùng trong tin nhắn, embed, và phản hồi lệnh.
> Cú pháp: `{variable_name}` hoặc `{variable_name: argument}`.

---

## Placeholders (Phase 4)

Biến thay thế tự động, không cần đối số. Dùng trong nội dung tin nhắn / embed.

### User Variables


| Group | Name                    | Value       | Descript                       |
| ----- | ----------------------- | ----------- | ------------------------------ |
| User  | `{user}`                | `@Username` | Ping người dùng gọi lệnh       |
| User  | `{user_tag}`            | `User#1234` | Username + Tag                 |
| User  | `{user_name}`           | `Username`  | Tên người dùng (không có tag)  |
| User  | `{user_avatar}`         | URL         | Link ảnh đại diện của user     |
| User  | `{user_discrim}`        | `1234`      | Mã số tag                      |
| User  | `{user_id}`             | `123456789` | ID của người dùng              |
| User  | `{user_nick}`           | `Nickname`  | Biệt danh trong server         |
| User  | `{user_joindate}`       | Date        | Ngày tham gia server           |
| User  | `{user_createdate}`     | Date        | Ngày tạo tài khoản Discord     |
| User  | `{user_displaycolor}`   | `#FF5733`   | Mã màu của user dựa trên role  |
| User  | `{user_boostsince}`     | Date        | Thời gian bắt đầu boost server |
| User  | `{user_balance}`        | Number      | Số dư tiền ảo của user         |
| User  | `{user_balance_locale}` | `1,000`     | Số dư tiền ảo (có dấu phẩy)    |
| User  | `{user_item}`           | String      | Vật phẩm user đang có          |
| User  | `{user_item_count}`     | Number      | Số lượng vật phẩm              |
| User  | `{user_inventory}`      | List        | Danh sách kho đồ của user      |


### Server Variables


| Group  | Name                                     | Value       | Descript                               |
| ------ | ---------------------------------------- | ----------- | -------------------------------------- |
| Server | `{server_prefix}`                        | String      | Prefix hiện tại của server             |
| Server | `{server_currency}`                      | String      | Đơn vị tiền tệ của server              |
| Server | `{server_name}`                          | String      | Tên server                             |
| Server | `{server_id}`                            | String      | ID của server                          |
| Server | `{server_membercount}`                   | Number      | Tổng số thành viên                     |
| Server | `{server_membercount_ordinal}`           | `1st`       | Số thành viên (thứ tự)                 |
| Server | `{server_membercount_nobots}`            | Number      | Số thành viên (không tính bot)         |
| Server | `{server_membercount_nobots_ordinal}`    | `1st`       | Thành viên không bot (thứ tự)          |
| Server | `{server_botcount}`                      | Number      | Tổng số lượng bot                      |
| Server | `{server_botcount_ordinal}`              | `1st`       | Số lượng bot (thứ tự)                  |
| Server | `{server_icon}`                          | URL         | Link icon của server                   |
| Server | `{server_banner}`                        | URL         | Link banner của server                 |
| Server | `{server_rolecount}`                     | Number      | Tổng số role                           |
| Server | `{server_channelcount}`                  | Number      | Tổng số kênh                           |
| Server | `{server_randommember}`                  | `@User`     | Chọn ngẫu nhiên 1 thành viên (ping)    |
| Server | `{server_randommember_tag}`              | `User#1234` | Tag thành viên ngẫu nhiên              |
| Server | `{server_randommember_nobots}`           | `@User`     | Thành viên ngẫu nhiên (không phải bot) |
| Server | `{server_owner}`                         | `@Owner`    | Ping chủ server                        |
| Server | `{server_owner_id}`                      | String      | ID của chủ server                      |
| Server | `{server_createdate}`                    | Date        | Ngày thành lập server                  |
| Server | `{server_boostlevel}`                    | `1/2/3`     | Cấp độ Boost hiện tại                  |
| Server | `{server_boostcount}`                    | Number      | Số lượng Boost hiện tại                |
| Server | `{server_nextboostlevel}`                | `2/3`       | Cấp Boost tiếp theo                    |
| Server | `{server_nextboostlevel_required}`       | Number      | Số Boost cần để lên cấp tiếp           |
| Server | `{server_nextboostlevel_until_required}` | Number      | Số Boost còn thiếu                     |


### Channel & Message Variables


| Group   | Name                   | Value      | Descript                          |
| ------- | ---------------------- | ---------- | --------------------------------- |
| Channel | `{channel}`            | `#channel` | Ping kênh hiện tại                |
| Channel | `{channel_name}`       | String     | Tên kênh hiện tại                 |
| Channel | `{channel_createdate}` | Date       | Ngày tạo kênh                     |
| Channel | `{rule_channel}`       | `#rules`   | Kênh Rules/Guidelines (Community) |
| Message | `{message_link}`       | URL        | Link dẫn đến tin nhắn gọi lệnh    |
| Message | `{message_id}`         | String     | ID của tin nhắn                   |
| Message | `{message_content}`    | String     | Nội dung gốc của tin nhắn         |
| Misc    | `{date}`               | DateTime   | Ngày giờ hiện tại                 |
| Misc    | `{newline}`            | `\n`       | Xuống dòng                        |
| Misc    | `{embed_name}`         | String     | Tên embed từ meta data            |


---

## Advanced Logic (Phase 4)

Biến logic nâng cao, yêu cầu đối số.


| Group | Name                             | Value         | Descript                                  |
| ----- | -------------------------------- | ------------- | ----------------------------------------- |
| Logic | `{range: 1-100}`                 | Random Number | Tạo số ngẫu nhiên trong khoảng            |
| Logic | `{choose: A; B; C}`              | Random Pick   | Chọn ngẫu nhiên 1 mục                     |
| Logic | `{lockedchoose: A; B}`           | Locked Pick   | Chọn ngẫu nhiên, kết quả cố định cho user |
| Logic | `{weightedchoose: A 50%; B 50%}` | Weighted Pick | Chọn ngẫu nhiên theo tỉ lệ %              |
| Logic | `[choice]`                       | Result        | Lấy kết quả từ `choose`                   |
| Logic | `[lockedchoice]`                 | Result        | Lấy kết quả từ `lockedchoose`             |
| Logic | `[$1]`, `[$2]`, ...              | Argument      | Lấy đối số thứ N người dùng nhập          |


---

## Modifiers (Phase 2)

Điều khiển cách bot gửi phản hồi.


| Group    | Name                   | Value      | Descript                             |
| -------- | ---------------------- | ---------- | ------------------------------------ |
| Modifier | `{dm}`                 | —          | Gửi phản hồi vào tin nhắn riêng      |
| Modifier | `{sendto: channel_id}` | Channel ID | Gửi phản hồi vào kênh cụ thể         |
| Modifier | `{embed: embed_id}`    | Embed ID   | Gọi mẫu embed từ Database            |
| Modifier | `{silent}`             | —          | Gửi tin nhắn silent                  |
| Modifier | `{delete}`             | —          | Xoá tin nhắn gọi lệnh                |
| Modifier | `{delete_reply: 5}`    | Seconds    | Xoá phản hồi bot sau X giây          |


---

## Guards (Phase 1)

Điều kiện kiểm tra trước khi thực thi lệnh. Nếu không thoả → từ chối.


| Group   | Name                   | Value      | Descript                        |
| ------- | ---------------------- | ---------- | ------------------------------- |
| Require | `{requireuser: id}`    | User ID    | Chỉ user này mới dùng được      |
| Require | `{requireperm: perm}`  | Permission | Cần quyền cụ thể (VD: Admin)    |
| Require | `{requirechannel: id}` | Channel ID | Chỉ dùng trong kênh cụ thể      |
| Require | `{requirerole: id}`    | Role ID    | Cần có Role cụ thể              |
| Require | `{requirebal: amount}` | Number     | Cần đủ X tiền ảo                |
| Require | `{requireitem: name}`  | Item Name  | Cần có vật phẩm cụ thể          |
| Require | `{requirearg: text}`   | Argument   | Bắt buộc nhập đối số            |
| Deny    | `{denyuser: id}`       | User ID    | Chặn user này dùng lệnh         |
| Deny    | `{denyperm: perm}`     | Permission | Chặn người có quyền này         |
| Deny    | `{denychannel: id}`    | Channel ID | Chặn dùng ở kênh này            |
| Deny    | `{denyrole: id}`       | Role ID    | Chặn người có Role này          |
| Deny    | `{denyitem: name}`     | Item Name  | Chặn nếu có vật phẩm            |
| Rate    | `{cooldown: seconds}`  | Seconds    | Thời gian chờ giữa các lần dùng |


---

## Actions (Phase 3)

Hành động phụ được thực thi cùng phản hồi.


| Group   | Name                         | Value          | Descript                       |
| ------- | ---------------------------- | -------------- | ------------------------------ |
| Economy | `{modifybal: +100}`          | ±Number        | Cộng/Trừ tiền ảo               |
| Economy | `{modifyinv: item}`          | Item           | Thêm/Xoá vật phẩm trong kho    |
| Role    | `{addrole: id}`              | Role ID        | Cấp Role cho user              |
| Role    | `{removerole: id}`           | Role ID        | Thu hồi Role của user          |
| Profile | `{setnick: name}`            | Nickname       | Đổi biệt danh của user         |
| React   | `{react: emoji}`             | Emoji          | Bot thả emoji vào tin nhắn gốc |
| React   | `{reactreply: emoji}`        | Emoji          | Bot thả emoji vào phản hồi     |
| UI      | `{addbutton: label|script}`  | Label + Script | Thêm nút bấm interactif        |
| UI      | `{addlinkbutton: label|url}` | Label + URL    | Thêm nút bấm dẫn link web      |


