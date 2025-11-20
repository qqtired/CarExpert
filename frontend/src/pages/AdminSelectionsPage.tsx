import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Filter, Search, User2 } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useAppStore } from '../store/useAppStore';
import type { SelectionOrder, SelectionStatus } from '../types';
import '../App.css';

const statusOptions: { value: SelectionStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Все статусы' },
  { value: 'NEW', label: 'Новые' },
  { value: 'WAITING_FOR_EXPERT', label: 'Ждёт эксперта' },
  { value: 'ASSIGNED', label: 'Эксперт назначен' },
  { value: 'SOURCING', label: 'Подбор кандидатов' },
  { value: 'CANDIDATES_SENT', label: 'Кандидаты предложены' },
  { value: 'INSPECTIONS', label: 'Осмотры' },
  { value: 'WAITING_FOR_DECISION', label: 'Ожидание решения' },
  { value: 'DEAL_FLOW', label: 'Сделка' },
  { value: 'DONE', label: 'Завершено' },
  { value: 'CANCELLED', label: 'Отменён' },
];

function formatDate(iso: string) {
  const dt = new Date(iso);
  return dt.toLocaleDateString('ru-RU');
}

export function AdminSelectionsPage() {
  const { selections, inspections } = useAppStore();
  const [status, setStatus] = useState<SelectionStatus | 'ALL'>('ALL');
  const [city, setCity] = useState<string>('ALL');
  const [query, setQuery] = useState('');

  const cities = useMemo(() => ['ALL', ...new Set(selections.map((s) => s.city))], [selections]);

  const filtered = useMemo(() => {
    return selections.filter((sel) => {
      const matchesStatus = status === 'ALL' || sel.status === status;
      const matchesCity = city === 'ALL' || sel.city === city;
      const matchesQuery =
        !query ||
        sel.id.toLowerCase().includes(query.toLowerCase()) ||
        sel.client.name.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesCity && matchesQuery;
    });
  }, [selections, status, city, query]);

  const countInspections = (ids: string[]) => ids.length;
  const statusesText = (ids: string[]) =>
    ids
      .map((id) => inspections.find((o) => o.id === id)?.status)
      .filter(Boolean)
      .join(', ');

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">Подборы</span>
        <div className="filters">
          <label className="control">
            <Search size={16} />
            <input placeholder="ID или клиент" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <label className="control">
            <User2 size={16} />
            <select value={status} onChange={(e) => setStatus(e.target.value as SelectionStatus | 'ALL')}>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="control">
            <Building2 size={16} />
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'Все города' : c}
                </option>
              ))}
            </select>
          </label>
          <span className="chip chip--ghost">
            <Filter size={16} />
            Фильтр
          </span>
        </div>
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Город</th>
              <th>Бюджет</th>
              <th>Осмотры</th>
              <th>Создан</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sel: SelectionOrder) => (
              <tr key={sel.id}>
                <td>
                  <div className="section">
                    <Link to={`/admin/selections/${sel.id}`} style={{ fontWeight: 700, color: 'var(--accent-strong)' }}>
                      {sel.id}
                    </Link>
                    <span className="badge">
                      <span className="badge__dot" style={{ background: '#7aa0ff' }} />
                      Дедлайн: {sel.deadline ?? '—'}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="section">
                    <span>{sel.client.name}</span>
                    <span className="badge status--warn">
                      <span className="badge__dot" />
                      {sel.client.phone}
                    </span>
                  </div>
                </td>
                <td>{sel.city}</td>
                <td>{sel.budget}</td>
                <td>
                  <div className="section">
                    <span className="badge">
                      <span className="badge__dot" />
                      {countInspections(sel.inspectionIds)} осмотра
                    </span>
                    <span className="badge status--active">
                      <span className="badge__dot" />
                      {statusesText(sel.inspectionIds) || '—'}
                    </span>
                  </div>
                </td>
                <td>{formatDate(sel.createdAt)}</td>
                <td>
                  <StatusBadge status={sel.status} mode="selection" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
