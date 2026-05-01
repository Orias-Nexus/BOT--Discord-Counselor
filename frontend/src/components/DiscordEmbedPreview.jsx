/**
 * DiscordEmbedPreview — renders an embed object in Discord's visual style.
 * Uses inline styles exclusively to prevent Hygge CSS leakage.
 * Supports Discord-flavored markdown in title, description, field values, and footer.
 */
import { parseDiscordMarkdown } from '../utils/discordMarkdown';

/** Render markdown text as HTML safely within an inline-styled span. */
function Md({ children, style = {} }) {
  if (!children) return null;
  return (
    <span
      style={style}
      dangerouslySetInnerHTML={{ __html: parseDiscordMarkdown(children) }}
    />
  );
}

export default function DiscordEmbedPreview({ embed, showPlaceholderHint = false }) {
  if (!embed || typeof embed !== 'object') {
    return (
      <div style={{ backgroundColor: '#313338', borderRadius: 8, padding: 16, fontFamily: "'gg sans','Noto Sans',system-ui,sans-serif", color: '#72767d', fontSize: 13, fontStyle: 'italic' }}>
        Start editing to see your embed preview here.
      </div>
    );
  }

  const colorHex = embed.color
    ? typeof embed.color === 'number'
      ? `#${embed.color.toString(16).padStart(6, '0')}`
      : typeof embed.color === 'string' && embed.color.startsWith('#')
        ? embed.color
        : '#4f614e'
    : '#4f614e';

  return (
    <div style={{ backgroundColor: '#313338', borderRadius: 8, padding: 16, fontFamily: "'gg sans','Noto Sans',system-ui,sans-serif", color: '#dbdee1', fontSize: 14, lineHeight: '1.375' }}>
      {showPlaceholderHint && (
        <div style={{ fontSize: 11, color: '#949ba4', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 14 }}>ℹ️</span> Placeholders like {'{user_name}'} are resolved with sample values
        </div>
      )}
      <div style={{ borderLeft: `4px solid ${colorHex}`, borderRadius: 4, backgroundColor: '#2b2d31', padding: '12px 16px', maxWidth: 520, display: 'grid', gridTemplateColumns: embed.thumbnail?.url ? '1fr auto' : '1fr', gap: 16 }}>
        <div>
          {/* Author */}
          {embed.author?.name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {embed.author.icon_url && (
                <img src={embed.author.icon_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} onError={e => { e.target.style.display = 'none'; }} />
              )}
              <span style={{ fontSize: 13, fontWeight: 600, color: '#f2f3f5' }}>
                <Md>{embed.author.name}</Md>
              </span>
            </div>
          )}
          {/* Title */}
          {embed.title && (
            <div style={{ fontWeight: 700, color: '#00b0f4', marginBottom: 8, fontSize: 16 }}>
              <Md>{embed.title}</Md>
            </div>
          )}
          {/* Description */}
          {embed.description && (
            <div style={{ whiteSpace: 'pre-wrap', marginBottom: 8, color: '#dbdee1', fontSize: 14, lineHeight: '1.375' }}>
              <Md>{embed.description}</Md>
            </div>
          )}
          {/* Fields */}
          {embed.fields?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: embed.fields.some(f => f.inline) ? 'repeat(3, 1fr)' : '1fr', gap: 8, marginBottom: 8 }}>
              {embed.fields.map((field, i) => (
                <div key={i} style={{ gridColumn: field.inline ? undefined : '1 / -1' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f2f3f5', marginBottom: 2 }}>
                    <Md>{field.name}</Md>
                  </div>
                  <div style={{ fontSize: 13, color: '#dbdee1' }}>
                    <Md>{field.value}</Md>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Image */}
          {embed.image?.url && (
            <img src={embed.image.url} alt="" style={{ maxWidth: '100%', borderRadius: 4, marginBottom: 8 }} onError={e => { e.target.style.display = 'none'; }} />
          )}
          {/* Footer */}
          {embed.footer?.text && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#949ba4', marginTop: 4 }}>
              {embed.footer.icon_url && (
                <img src={embed.footer.icon_url} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} onError={e => { e.target.style.display = 'none'; }} />
              )}
              <Md style={{ fontSize: 12, color: '#949ba4' }}>{embed.footer.text}</Md>
            </div>
          )}
          {/* Timestamp */}
          {embed.timestamp && (
            <div style={{ fontSize: 11, color: '#949ba4', marginTop: 4 }}>
              {new Date(embed.timestamp).toLocaleString()}
            </div>
          )}
          {/* Empty state */}
          {!embed.title && !embed.description && !embed.author?.name && !(embed.fields?.length) && (
            <p style={{ color: '#72767d', fontStyle: 'italic', fontSize: 13 }}>Empty embed — add a title or description.</p>
          )}
        </div>

        {/* Thumbnail */}
        {embed.thumbnail?.url && (
          <img src={embed.thumbnail.url} alt="" style={{ width: 80, height: 80, borderRadius: 4, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
        )}
      </div>
    </div>
  );
}
