# Lộ trình xây dựng Discord System (Bot + Dashboard)

## Giai đoạn 1: Khởi tạo & Cấu hình

- Tạo cấu trúc thư mục dự án (monorepo: backend, bot, frontend, database, shared, docs, infra).
- Bot: package.json, env.js, .config.json/.config.js, index.js.
- Bot: Script / Command / Event Handler.
- Backend API: auth, endpoints phục vụ Dashboard.
- Frontend: trang Dashboard đầy đủ (cấu hình guild, logs, v.v.).

## Giai đoạn 2: Bot

- env.js, .config, Handlers.
- Scripts Logs, Commands Logs.
- **Scripts / Commands / Events: Mods, Services, Utilities** (chi tiết bên dưới).

### Mods — Thành viên (Member)


| #   | Script  | Command       | Event   | Chức năng                             |
| --- | ------- | ------------- | ------- | ------------------------------------- |
| 1   | scmem1  | user_level    | evmem1  | Xem level thành viên                  |
| 2   | scmem2  | user_role     | evmem2  | Cấp / quản lý role cho thành viên     |
| 3   | scmem3  | user_unrole   | evmem3  | Gỡ role khỏi thành viên               |
| 4   | scmem4  | user_autorole | evmem4  | Thiết lập role tự động khi vào server |
| 5   | scmem5  | user_warn     | evmem5  | Cảnh cáo thành viên                   |
| 6   | scmem6  | user_unwarn   | evmem6  | Gỡ cảnh cáo                           |
| 7   | scmem7  | user_mute     | evmem7  | Tắt tiếng (mute) thành viên           |
| 8   | scmem8  | user_unmute   | evmem8  | Bật tiếng lại                         |
| 9   | scmem9  | user_move     | evmem9  | Di chuyển thành viên (voice)          |
| 10  | scmem10 | user_kick     | evmem10 | Đuổi thành viên khỏi server           |
| 11  | scmem11 | user_ban      | evmem11 | Cấm thành viên (ban)                  |


### Mods — Kênh (Channel)


| #   | Script | Command        | Event  | Chức năng                                |
| --- | ------ | -------------- | ------ | ---------------------------------------- |
| 1   | sccha1 | channel_clone  | evcha1 | Nhân bản kênh (sao chép quyền, cấu hình) |
| 2   | sccha2 | channel_create | evcha2 | Tạo kênh mới                             |
| 3   | sccha3 | channel_delete | evcha3 | Xóa kênh                                 |
| 4   | sccha4 | channel_lock   | evcha4 | Khóa kênh                                |
| 5   | sccha5 | channel_unlock | evcha5 | Mở khóa kênh                             |


### Mods — Tin nhắn (Message)


| #   | Script | Command        | Event  | Chức năng                                |
| --- | ------ | -------------- | ------ | ---------------------------------------- |
| 1   | scmes1 | message_send   | evmes1 | Gửi tin nhắn (embed / text)              |
| 2   | scmes2 | message_edit   | evmes2 | Chỉnh sửa tin nhắn                       |
| 3   | scmes3 | message_delete | evmes3 | Xóa tin nhắn hàng loạt (bộ lọc nâng cao) |
| 4   | scmes4 | message_pin    | evmes4 | Ghim tin nhắn                            |
| 5   | scmes5 | message_unpin  | evmes5 | Bỏ ghim tin nhắn                         |


### Services — Nhạc (Music)


| #   | Script | Command       | Event  | Chức năng         |
| --- | ------ | ------------- | ------ | ----------------- |
| 1   | scmus1 | song_autoplay | evmus1 | Bật / tắt tự phát |
| 2   | scmus2 | song_play     | evmus2 | Phát bài hát      |
| 3   | scmus3 | song_pause    | evmus3 | Tạm dừng          |
| 4   | scmus4 | song_resume   | evmus4 | Tiếp tục phát     |
| 5   | scmus5 | song_skip     | evmus5 | Bỏ qua bài        |
| 6   | scmus6 | song_stop     | evmus6 | Dừng phát         |
| 7   | scmus7 | queue_add     | evmus7 | Thêm vào hàng chờ |
| 8   | scmus8 | queue_remove  | evmus8 | Xóa khỏi hàng chờ |
| 9   | scmus9 | queue_shuffle | evmus9 | Xáo trộn hàng chờ |


### Services — Game


| #   | Script | Command       | Event  | Chức năng                   |
| --- | ------ | ------------- | ------ | --------------------------- |
| 1   | scgam1 | game_rps      | evgam1 | Oẳn tù tì với Bot           |
| 2   | scgam2 | game_gamble   | evgam2 | Thử vận may (xúc xắc 1–100) |
| 3   | scgam3 | game_flipcoin | evgam3 | Cược đồng xu (sấp / ngửa)   |


### Utilities


| #   | Script  | Command        | Event   | Chức năng                          |
| --- | ------- | -------------- | ------- | ---------------------------------- |
| 1   | scuti1  | help           | evuti1  | Danh sách lệnh hỗ trợ              |
| 2   | scuti2  | setup          | evuti2  | Thiết lập ban đầu server           |
| 3   | scuti3  | set_embed      | evuti3  | Cấu hình embed (màu, footer, v.v.) |
| 4   | scuti4  | set_prefix     | evuti4  | Đặt prefix lệnh                    |
| 5   | scuti5  | set_autorole   | evuti5  | Cấu hình autorole                  |
| 6   | scuti6  | set_welcome    | evuti6  | Tin nhắn chào mừng khi vào server  |
| 7   | scuti7  | set_leave      | evuti7  | Tin nhắn khi rời server            |
| 8   | scuti8  | backup_config  | evuti8  | Sao lưu cấu hình                   |
| 9   | scuti9  | restore_config | evuti9  | Khôi phục cấu hình                 |
| 10  | scuti10 | dashboard      | evuti10 | Link / thông tin Web Dashboard     |


## Giai đoạn 3: Dashboard & API

- Backend: đăng nhập (Discord OAuth2), session.
- Backend: API guilds, cấu hình, logs (đọc từ database hoặc Bot).
- Frontend: sidebar, trang tổng quan, cấu hình, logs.

## Giai đoạn 4: Deployment

- GitHub (private repo).
- CI/CD: .github/workflows (test, deploy).
- Render / VPS: Bot + Backend; Frontend (Vercel hoặc static).
- Biến môi trường và bảo mật.

