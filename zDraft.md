Đây là embed mẫu dùng khi người dùng tạo embed:

title: 'Embed Title',
description: 'Hi {user_name}!\n\n There are **Embed Description**',
color: EMBED_COLORS.DEFAULT,
timestamp: null,
author: {
    name: Author Name,
    icon_url: 'https://github.com/Orias1701/Resources--Discord-Bots/blob/main/assets/img/IconAuthor.png?raw=true',
},
thumbnail: { url: '{user_avatar}' },
image: { url: 'https://github.com/Orias1701/Resources--Discord-Bots/blob/main/assets/img/ImageMain.png?raw=true' },
fields: [
    {
        name: 'Field 1',
        value: 'There is Field 1's value with inline = true',
        inline: true,
    },
    {
        name: 'Field 2',
        value: 'There is Field 2's value with inline = true',
        inline: true,
    },
    {
        name: 'Field 3',
        value: 'There is Field 1's value with inline = false',
        inline: false,
    },
],
footer: {
    text: 'There is footer of the Embed',
    icon_url: 'https://github.com/Orias1701/Resources--Discord-Bots/blob/main/assets/img/IconFooter.png?raw=true',
}

Tạo embed: Người dùng sử dụng lệnh /embedcreate và nhập tên embed
- hệ thống sẽ tạo một embed với mẫu được định nghĩa hardcode ở trên, hiển thị tin nhắn embed lên, kèm các action button:
+ Edit Basic Info: chỉnh sửa Title, Description, Color, Fields
+ Edit Author: Author Name, Icon URL
+ Edit Footer: Footer Text, Icon URL
+ Edit Images: Thumbnail, Main Image

Sửa embed: Người dùng sử dụng lệnh /embededit và target 1 embed (dùng tên) có id server trùng trong database
- thay vì tạo embed thì hệ thống sẽ hiển thị embed đó lên dưới dạng tin nhắn với đầy đủ nội dung của embed và các action như khi dùng /embedcreate

3 Kiểu tương tác đặc biệt:
Greeting:
- Khi có người vào server bất kể bằng hình thức nào, thực hiện gửi tin nhắn vào kênh có id trong channel_id
Leaving:
- Khi có người rời server bất kể bằng hình thức nào, thực hiện gửi tin nhắn vào kênh có id trong channel_id
Boosting:
- Khi có người boost server bất kể bằng hình thức nào, thực hiện gửi tin nhắn vào kênh có id trong channel_id

Cách làm:
- Thiết lập bot: mỗi script đểu có cả action button (hiện tại chưa hiển thị, chỉ tạo sẵn phương thức) và slash riêng. nếu dạng slash có target đơn thì action mở panel chứa option dropdown, nếu target nhiều thì mở panel chứa checklist dropdown. nếu là dạng nhập giá trị thì mở modal nhập liệu. nếu là nhập embed thì cả slash và action đều mở modal
+ action "Greeting Channel" và slash /greetingchannel: target channel
+ action "Leaving Channel" và slash /leavingchannel: target channel
+ action "Boosting Channel" và slash /boostingchannel: target channel
+ action "Greeting Message" và slash /greetingmessage: target embed
+ action "Leaving Message" và slash /greetingmessage: target embed
+ action "Boosting Message" và slash /greetingmessage: target embed

các hành động trên sẽ trả về phản hồi:
Greeting Channel: Completed Set {channel_name} as Greeting Channel
* các channel khác tương tự
Greeting Message: Completed Set {embed_name} as Greeting Message
* các message khác tương tự
và cập nhật database với các thông tin lấy được