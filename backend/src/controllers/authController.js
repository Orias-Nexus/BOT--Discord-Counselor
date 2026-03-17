import axios from 'axios';
import jwt from 'jsonwebtoken';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:4000/api/auth/discord/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

/**
 * Tạo link đăng nhập qua Discord
 */
export const getDiscordLoginUrl = (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
  res.redirect(url);
};

/**
 * Callback sau khi người dùng cho quyền trên Discord
 */
export const handleDiscordCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // 1. Đổi authorization_code lấy access_token
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    });

    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const accessToken = tokenResponse.data.access_token;

    // 2. Lấy thông tin User từ Discord API
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = userResponse.data;

    // TODO: (Mở rộng) Bạn có thể fetch thêm /users/@me/guilds để xem user có quyền quản trị server nào

    // 3. Ký JWT cho Session đăng nhập
    const jwtToken = jwt.sign(
      {
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar,
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token sống 7 ngày
    );

    // Chuyển hướng người dùng về Frontend kèm Token
    // Vd: res.redirect(`http://localhost:3000/login-success?token=${jwtToken}`);
    res.json({ message: 'Login Success', token: jwtToken, user: userData });
  } catch (error) {
    console.error('Lỗi khi Discord OAuth2 Callback:', error.response?.data || error.message);
    res.status(500).json({ error: 'OAuth2 Authentication Failed' });
  }
};
