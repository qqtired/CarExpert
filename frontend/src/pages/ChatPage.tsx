import { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { StatusBadge } from '../components/StatusBadge';
import '../App.css';

function formatTime(iso: string) {
  const dt = new Date(iso);
  return dt.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

function initials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] ?? '').toUpperCase() + (parts[1]?.[0] ?? '').toUpperCase();
}

export function ChatPage() {
  const { chats, sendChatMessage, resetChats } = useAppStore();
  const [activeId, setActiveId] = useState(chats[0]?.id ?? '');
  const [text, setText] = useState('');

  const activeChat = useMemo(() => chats.find((c) => c.id === activeId) ?? chats[0], [chats, activeId]);

  const onSend = () => {
    if (!activeChat || !text.trim()) return;
    sendChatMessage(activeChat.id, { from: 'service', text: text.trim() });
    setText('');
  };

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">Чаты (демо)</span>
        <span className="chip chip--ghost">Связь с клиентом</span>
        <button className="chip chip--ghost" type="button" onClick={() => resetChats()}>
          Сбросить демо-чаты
        </button>
      </div>

      <div className="chat-shell">
        <div className="chat-threads">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-thread-item ${chat.id === activeChat?.id ? 'active' : ''}`}
              onClick={() => setActiveId(chat.id)}
            >
              <div className="chat-thread-row">
                <div className="avatar-small">{initials(chat.participant.name)}</div>
                <div>
                  <div className="chat-thread-title">{chat.participant.name}</div>
                  <div className="chat-thread-meta">{chat.participant.phone}</div>
                </div>
              </div>
              {chat.selectionId && (
                <div className="chat-thread-meta">Подбор {chat.selectionId}</div>
              )}
              {chat.inspectionId && (
                <div className="chat-thread-meta">Осмотр {chat.inspectionId}</div>
              )}
            </div>
          ))}
        </div>

        <div className="chat-window">
          {activeChat ? (
            <>
              <div className="page-bar" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{activeChat.participant.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{activeChat.participant.phone}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  {activeChat.inspectionId && <StatusBadge status="ASSIGNED" />}
                  {activeChat.selectionId && <StatusBadge status="SOURCING" mode="selection" />}
                </div>
              </div>
              <div className="chat-messages">
                {activeChat.messages.map((msg) => (
                  <div key={msg.id} className={`bubble ${msg.from}`}>
                    <header>
                      {msg.from === 'service' ? 'Сервис' : msg.from === 'system' ? 'Система' : 'Клиент'}
                    </header>
                    <div>{msg.text}</div>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="bubble-actions">
                        {msg.actions.map((action) => (
                          <button
                            key={action.label}
                            className="chip chip--ghost"
                            onClick={() => sendChatMessage(activeChat.id, { from: 'service', text: action.reply ?? action.label })}
                            type="button"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: 6, fontSize: 11, opacity: 0.7 }}>{formatTime(msg.createdAt)}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <textarea
                  placeholder="Написать сообщение..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button className="chip chip--primary" onClick={onSend} type="button">
                  Отправить
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: 20, color: 'var(--text-secondary)' }}>Нет чатов</div>
          )}
        </div>
      </div>
    </div>
  );
}
