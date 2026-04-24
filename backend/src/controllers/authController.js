import axios from 'axios';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { createSession, destroySession, getSession } from '../utils/sessionStore.js';
import { cacheGet, cacheSet, cacheDel } from '../utils/cache.js';

const APPLICATION_ID = env.discordClientId;
const DISCORD_CLIENT_SECRET = env.discordClientSecret;
const DISCORD_REDIRECT_URI = env.discordRedirectUri;
const AUTH_JWT_SECRET = env.jwtSecret;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const JWT_EXPIRES_IN = '7d';

function signJwt(payload) {
  return jwt.sign(payload, AUTH_JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export const getDiscordLoginUrl = (_req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${APPLICATION_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
  res.redirect(url);
};

function buildBotInviteUrl(guildId = '') {
  const fallback = `https://discord.com/oauth2/authorize?client_id=${APPLICATION_ID}&scope=bot%20applications.commands&permissions=8`;
  const base = env.discordBotInviteUrl || fallback;
  try {
    const url = new URL(base);
    if (guildId) {
      url.searchParams.set('guild_id', guildId);
      url.searchParams.set('disable_guild_select', 'true');
    }
    return url.toString();
  } catch {
    return fallback;
  }
}

export const getBotInviteUrl = (req, res) => {
  const guildId = req.query.guildId?.toString() ?? '';
  return res.json({ inviteUrl: buildBotInviteUrl(guildId) });
};

export const handleDiscordCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  try {
    const params = new URLSearchParams({
      client_id: APPLICATION_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    });

    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token ?? null;
    const expiresIn = tokenResponse.data.expires_in ?? 0;

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = userResponse.data;

    // Discord access token sống server-side trong Redis; JWT chỉ mang sessionId.
    const sessionId = await createSession(
      {
        userId: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        discordAccessToken: accessToken,
        refreshToken,
        expiresAt: Date.now() + expiresIn * 1000,
      },
      SESSION_TTL_SECONDS,
    );

    const jwtToken = signJwt({
      sub: userData.id,
      sid: sessionId,
      username: userData.username,
      avatar: userData.avatar,
    });

    const FRONTEND_URL = env.frontendOrigin;
    // Truyền token qua hash fragment — không được lưu vào server log / Referer header.
    res.redirect(`${FRONTEND_URL}/login#token=${encodeURIComponent(jwtToken)}`);
  } catch (error) {
    console.error('[auth] Discord callback failed:', error.response?.data || error.message);
    res.status(500).json({
      error: 'OAuth2 Authentication Failed',
      details: error.response?.data || error.message,
    });
  }
};

export const getMe = (req, res) => {
  if (!req.user || req.user.isBot) {
    return res.status(401).json({ error: 'No user session' });
  }
  return res.json({
    id: req.user.sub || req.user.id,
    username: req.user.username,
    avatar: req.user.avatar,
  });
};

export const logout = async (req, res) => {
  try {
    const sid = req.user?.sid;
    if (sid) await destroySession(sid);
    return res.json({ ok: true });
  } catch (err) {
    console.error('[auth] logout failed:', err.message);
    return res.status(500).json({ error: 'Logout failed' });
  }
};

const GUILDS_TTL = 60;
const guildsKey = (userId) => `guilds:${userId}`;

async function ensureBotInGuild(guildId) {
  try {
    await axios.get(`${env.directiveApiUrl}/internal/guild/${guildId}/info`, {
      headers: { 'x-internal-key': env.internalSecretKey },
      timeout: 3000,
    });
    return true;
  } catch (err) {
    if (err.response?.status === 404) return false;
    throw err;
  }
}

export const getGuilds = async (req, res) => {
  try {
    const sid = req.user?.sid;
    if (!sid) return res.status(401).json({ error: 'No session' });

    const session = await getSession(sid);
    if (!session?.discordAccessToken) {
      return res.status(401).json({ error: 'Session expired, please login again' });
    }

    const cached = await cacheGet(guildsKey(session.userId));
    if (cached) return res.json(cached);

    const response = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${session.discordAccessToken}` },
    });

    const guilds = response.data;
    const managedGuilds = guilds
      .filter((guild) => {
        try {
          const permissions = BigInt(guild.permissions);
          return (permissions & 0x20n) === 0x20n || (permissions & 0x8n) === 0x8n;
        } catch {
          return false;
        }
      })
      .map((g) => ({ id: g.id, name: g.name, icon: g.icon, owner: g.owner === true }));

    const checks = await Promise.all(
      managedGuilds.map(async (guild) => ({
        guild,
        available: await ensureBotInGuild(guild.id),
      })),
    );
    const availableGuilds = checks.filter((item) => item.available).map((item) => item.guild);

    await cacheSet(guildsKey(session.userId), availableGuilds, GUILDS_TTL);
    return res.json(availableGuilds);
  } catch (err) {
    if (err.response?.status === 401) {
      const sid = req.user?.sid;
      if (sid) await destroySession(sid);
      return res.status(401).json({ error: 'Discord session expired, please login again', expired: true });
    }
    console.error('[auth] fetch guilds error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to fetch guilds from Discord' });
  }
};

export const refreshGuilds = async (req, res) => {
  const sid = req.user?.sid;
  const session = sid ? await getSession(sid) : null;
  if (session?.userId) await cacheDel(guildsKey(session.userId));
  return getGuilds(req, res);
};
