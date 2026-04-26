import express from 'express';
import { ChannelType, PermissionFlagsBits } from './discord.js';
import env from './config.js';

/**
 * Middleware: Mọi endpoint /internal/* bắt buộc phải có header `x-internal-key`
 * trùng với INTERNAL_SECRET_KEY. Ngăn external caller bắn request.
 */
function requireInternalKey(req, res, next) {
  const key = req.headers['x-internal-key'];
  if (!key || key !== env.internalSecretKey) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid internal key' });
  }
  return next();
}

export function startApiServer(client) {
  const app = express();
  app.use(express.json());

  app.use('/internal', requireInternalKey);

  app.post('/internal/check-permission', async (req, res) => {
    try {
      const { serverId, userId, actionType, targetId } = req.body;

      if (!serverId || !userId) {
        return res.status(400).json({ hasPermission: false, error: 'Missing serverId or userId' });
      }

      const guild = client.guilds.cache.get(serverId);
      if (!guild) {
        return res.json({ hasPermission: false, error: 'Guild not found in cache' });
      }

      let member = guild.members.cache.get(userId);
      if (!member) {
        member = await guild.members.fetch(userId).catch(() => null);
      }
      if (!member) {
        return res.json({ hasPermission: false, error: 'Member not found in guild' });
      }

      if (member.id === guild.ownerId || member.permissions.has(PermissionFlagsBits.Administrator)) {
        return res.json({ hasPermission: true });
      }

      switch (actionType) {
        case 'manage_server':
          if (member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return res.json({ hasPermission: true });
          }
          break;

        case 'manage_channel':
          if (targetId) {
            const channel = guild.channels.cache.get(targetId);
            if (channel && channel.permissionsFor(member).has(PermissionFlagsBits.ManageChannels)) {
              return res.json({ hasPermission: true });
            }
          }
          if (member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return res.json({ hasPermission: true });
          }
          break;

        case 'moderate_member':
          if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return res.json({ hasPermission: false, error: 'Missing ModerateMembers permission' });
          }
          if (targetId && targetId !== userId) {
            const targetMember = guild.members.cache.get(targetId);
            if (targetMember && member.roles.highest.position <= targetMember.roles.highest.position) {
              return res.json({ hasPermission: false, error: 'Role hierarchy too low' });
            }
          }
          return res.json({ hasPermission: true });

        default:
          return res.status(400).json({ hasPermission: false, error: 'Unknown actionType' });
      }

      return res.json({ hasPermission: false });
    } catch (err) {
      console.error('[InternalAPI] Permission check error:', err);
      res.status(500).json({ hasPermission: false, error: err.message });
    }
  });

  /**
   * Trả về thông tin guild đầy đủ (icon, owner, members count, channels, roles).
   * Dùng cho Web để không phải gọi Discord API trực tiếp bằng user OAuth token.
   */
  app.get('/internal/guild/:id/info', async (req, res) => {
    try {
      const guild = client.guilds.cache.get(req.params.id);
      if (!guild) return res.status(404).json({ error: 'Guild not found in cache' });

      const channels = [...guild.channels.cache.values()]
        .map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          parentId: c.parentId ?? null,
          position: c.rawPosition ?? c.position ?? 0,
          isText: typeof c.isTextBased === 'function' ? c.isTextBased() : false,
          isVoice:
            c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice,
        }))
        .sort((a, b) => a.position - b.position);

      const categories = channels
        .filter((c) => c.type === ChannelType.GuildCategory)
        .map((c) => ({ id: c.id, name: c.name, position: c.position }));

      const roles = [...guild.roles.cache.values()]
        .filter((r) => r.id !== guild.id) // bỏ @everyone
        .map((r) => ({
          id: r.id,
          name: r.name,
          color: r.color,
          position: r.position,
          managed: r.managed,
          hoist: r.hoist,
        }))
        .sort((a, b) => b.position - a.position);

      return res.json({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        ownerId: guild.ownerId,
        memberCount: guild.memberCount,
        boostTier: guild.premiumTier,
        boostCount: guild.premiumSubscriptionCount ?? 0,
        channels,
        categories,
        roles,
        features: guild.features ?? [],
      });
    } catch (err) {
      console.error('[InternalAPI] guild info error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * Liệt kê member dưới dạng cache (nhanh, không gọi fetch).
   * Có thể filter bằng query ?q= để search theo username / displayName / id.
   */
  app.get('/internal/guild/:id/members', async (req, res) => {
    try {
      const guild = client.guilds.cache.get(req.params.id);
      if (!guild) return res.status(404).json({ error: 'Guild not found in cache' });

      const q = (req.query.q ?? '').toString().trim().toLowerCase();
      const limit = Math.min(Number(req.query.limit) || 50, 100);

      const collection = guild.members.cache;
      const all = [...collection.values()].map((m) => ({
        id: m.id,
        username: m.user?.username ?? '',
        globalName: m.user?.globalName ?? null,
        displayName: m.displayName ?? m.user?.username ?? '',
        avatar: m.user?.avatar ?? null,
        bot: m.user?.bot === true,
        roles: m.roles.cache.map((r) => r.id),
        joinedAt: m.joinedAt ? m.joinedAt.toISOString() : null,
      }));

      const filtered = q
        ? all.filter((m) =>
            (m.username && m.username.toLowerCase().includes(q)) ||
            (m.displayName && m.displayName.toLowerCase().includes(q)) ||
            (m.globalName && m.globalName.toLowerCase().includes(q)) ||
            m.id.includes(q)
          )
        : all;

      return res.json({ count: filtered.length, members: filtered.slice(0, limit) });
    } catch (err) {
      console.error('[InternalAPI] guild members error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  const port = process.env.INTERNAL_PORT || 4001;
  app.listen(port, () => {
    console.log(`[startup] Internal API Server running on port ${port}`);
  });
}
