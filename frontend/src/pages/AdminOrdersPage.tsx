import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  ExternalLink,
  Filter,
  Image,
  List,
  Phone,
  Search,
  Trash2,
  User2,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useAppStore } from '../store/useAppStore';
import type { AppState } from '../store/useAppStore';
import type { InspectionOrder, InspectionStatus } from '../types';
import '../App.css';

const statusOptions: { value: InspectionStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Все статусы' },
  { value: 'NEW', label: 'Новые' },
  { value: 'WAITING_FOR_EXPERT', label: 'Ждут эксперта' },
  { value: 'ASSIGNED', label: 'Эксперт назначен' },
  { value: 'IN_PROGRESS', label: 'Осмотр в работе' },
  { value: 'REPORT_IN_PROGRESS', label: 'Подготовка отчёта' },
  { value: 'DONE', label: 'Отчёт готов' },
  { value: 'CANCELLED', label: 'Отменены' },
];

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  const dt = new Date(iso);
  return `${dt.toLocaleDateString('ru-RU')} ${dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
}

function formatCar(order: InspectionOrder) {
  const { make, model, year } = order.parsedData;
  return `${make} ${model} ${year}`;
}

function formatPrice(amount: number | null) {
  if (!amount) return '—';
  return amount.toLocaleString('ru-RU');
}

function findExpertName(expertId: string | null, experts: AppState['experts']) {
  if (!expertId) return 'Не назначен';
  return experts.find((ex) => ex.id === expertId)?.name ?? 'Не назначен';
}

export function AdminOrdersPage() {
  const { inspections, experts } = useAppStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<InspectionStatus | 'ALL'>('ALL');
  const [city, setCity] = useState<string>('ALL');

  const cities = useMemo(() => ['ALL', ...new Set(inspections.map((item) => item.city))], [inspections]);

  const filtered = useMemo(() => {
    return inspections.filter((order) => {
      const matchesQuery =
        !query ||
        order.id.toLowerCase().includes(query.toLowerCase()) ||
        order.client.name.toLowerCase().includes(query.toLowerCase()) ||
        formatCar(order).toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'ALL' || order.status === status;
      const matchesCity = city === 'ALL' || order.city === city;
      return matchesQuery && matchesStatus && matchesCity;
    });
  }, [inspections, query, status, city]);

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">Заказы</span>
        <div className="filters">
          <label className="control">
            <Search size={16} />
            <input
              placeholder="Номер, авто, клиент"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="control">
            <Calendar size={16} />
            <input type="date" />
          </label>
          <label className="control">
            <User2 size={16} />
            <select value={status} onChange={(e) => setStatus(e.target.value as InspectionStatus | 'ALL')}>
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
          <span className="chip chip--ghost">
            <Trash2 size={16} />
            Сброс
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="chip chip--primary">
            <List size={16} />
            Список
          </button>
          <button className="chip chip--ghost">
            <Image size={16} />
            Фото
          </button>
        </div>
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Осмотр</th>
              <th>Создан</th>
              <th>Цена</th>
              <th>Авто</th>
              <th>Исполнитель</th>
              <th>Клиент</th>
              <th>Город</th>
              <th>Отчёт</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id}>
                <td>
                  <div className="section">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="pill">Осмотр</span>
                      {order.selectionOrderId && (
                        <Link className="pill" to={`/admin/selections/${order.selectionOrderId}`}>
                          Подбор {order.selectionOrderId}
                        </Link>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Link to={`/admin/inspections/${order.id}`}>{order.id}</Link>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="section">
                    <span>{formatDate(order.createdAt)}</span>
                    <span className="badge status--warn">
                      <span className="badge__dot" />
                      {order.appointmentAt ? `Визит: ${formatDate(order.appointmentAt)}` : 'Ожидает слот'}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="section">
                    <span style={{ color: 'var(--accent-strong)', fontWeight: 800 }}>
                      {formatPrice(order.parsedData.price)} ₽
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{order.priceSegment}</span>
                  </div>
                </td>
                <td>
                  <div className="section">
                    <span style={{ fontWeight: 700 }}>{formatCar(order)}</span>
                    <span className="badge">
                      <span className="badge__dot" style={{ background: '#7aa0ff' }} />
                      {order.parsedData.city}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="section">
                    <span>{findExpertName(order.expertId, experts)}</span>
                    <span className="badge status--active">
                      <span className="badge__dot" />
                      {order.expertId ? 'Назначен' : 'Не назначен'}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="section">
                    <span>{order.client.name}</span>
                    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--text-secondary)' }}>
                      <Phone size={14} />
                      {order.client.phone}
                    </span>
                  </div>
                </td>
                <td>{order.city}</td>
                <td>
                  {order.report ? (
                    <div className="section">
                      <a href={order.report.webUrl} target="_blank" rel="noreferrer">
                        Web
                      </a>
                      <a href={order.report.pdfUrl} target="_blank" rel="noreferrer">
                        PDF
                      </a>
                    </div>
                  ) : (
                    <span className="badge status--warn">
                      <span className="badge__dot" />
                      Нет отчёта
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link className="icon-button" to={`/admin/inspections/${order.id}`} title="Открыть">
                      <ExternalLink size={16} />
                    </Link>
                    <button className="icon-button" title="Удалить">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
