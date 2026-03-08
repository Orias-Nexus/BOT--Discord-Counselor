import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch(() => {
        setHealth({ status: 'error' });
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>My Discord System</h1>
      <p style={{ color: '#71717a', marginBottom: '2rem' }}>
        Dashboard — kết nối Backend & Bot
      </p>

      <section
        style={{
          background: '#27272a',
          borderRadius: 8,
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Trạng thái API</h2>
        {loading && <p>Đang kiểm tra...</p>}
        {!loading && health && (
          <pre
            style={{
              margin: 0,
              fontSize: 14,
              overflow: 'auto',
            }}
          >
            {JSON.stringify(health, null, 2)}
          </pre>
        )}
        {!loading && !health && <p>Không kết nối được Backend.</p>}
      </section>

      <p style={{ color: '#71717a', fontSize: 14 }}>
        Chạy backend: <code>cd backend && npm run dev</code> — Frontend:{' '}
        <code>cd frontend && npm run dev</code>
      </p>
    </div>
  );
}
