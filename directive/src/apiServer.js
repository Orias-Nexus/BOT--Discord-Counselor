import express from 'express';
import { PermissionFlagsBits } from './discord.js';

export function startApiServer(client) {
  const app = express();
  app.use(express.json());

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

      const member = guild.members.cache.get(userId);
      if (!member) {
        return res.json({ hasPermission: false, error: 'Member not found in guild' });
      }

      // Luôn cho phép Administrator hoặc Owner thực hiện mọi thứ
      if (member.id === guild.ownerId || member.permissions.has(PermissionFlagsBits.Administrator)) {
        return res.json({ hasPermission: true });
      }

      // logic kiểm tra dựa theo actionType
      switch (actionType) {
        case 'manage_server':
          // Cho phép nếu có quyền Manage Guild
          if (member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return res.json({ hasPermission: true });
          }
          break;

        case 'manage_channel':
          // Kiểm tra quyền trên toàn server HOẶC quyền cụ thể trên một target Channel
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
          // Phải có quyền ModerateMembers và hierarchy của User phải cao hơn Target (nếu có Target)
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

  const port = process.env.INTERNAL_PORT || 4001;
  app.listen(port, () => {
    console.log(`[startup] Internal API Server running on port ${port}`);
  });
}
