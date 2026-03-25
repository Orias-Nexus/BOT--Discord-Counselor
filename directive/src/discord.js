/**
 * Re-export discord.js using CJS-compatible default import.
 * Node.js may treat discord.js as CJS, preventing named exports.
 * This wrapper ensures compatibility across all Node versions.
 */
import pkg from 'discord.js';

export const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
  ModalBuilder,
  PermissionFlagsBits,
  REST,
  Routes,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  version,
} = pkg;

export default pkg;
