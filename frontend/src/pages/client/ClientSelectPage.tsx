import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import '../../App.css';

export function ClientSelectPage() {
  const navigate = useNavigate();
  const { inspections, selections, currentClientId, setCurrentClient } = useAppStore();

  const clients = useMemo(() => {
    const list = [...inspections, ...selections].map((item) => item.client);
    const unique = new Map<string, { name: string; phone: string; email?: string }>();
    list.forEach((c) => {
      if (!unique.has(c.phone)) unique.set(c.phone, c);
    });
    return Array.from(unique.values());
  }, [inspections, selections]);

  const onPick = (phone: string) => {
    setCurrentClient(phone);
    navigate('/client/inspections');
  };

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">Клиентский кабинет</span>
        <span className="chip chip--ghost">Демо-вход</span>
      </div>
      <p style={{ color: 'var(--text-secondary)' }}>Выберите демо-клиента, чтобы посмотреть его заявки и подборы.</p>
      <div className="cards-grid">
        {clients.map((client) => (
          <button
            key={client.phone}
            className="stat-card"
            style={{
              border: currentClientId === client.phone ? `2px solid var(--accent)` : '1px solid var(--border-soft)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onClick={() => onPick(client.phone)}
          >
            <span className="stat-card__label">Клиент</span>
            <span className="stat-card__value">{client.name}</span>
            <span className="badge status--warn">
              <span className="badge__dot" />
              {client.phone}
            </span>
            {client.email && (
              <span className="badge">
                <span className="badge__dot" />
                {client.email}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
