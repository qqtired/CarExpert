import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { StatusBadge } from '../components/StatusBadge';
import type { InspectionOrder, SelectionOrder } from '../types';
import '../App.css';

function formatCar(order: InspectionOrder) {
  const { make, model, year } = order.parsedData;
  return `${make} ${model} ${year}`;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const dt = new Date(iso);
  return dt.toLocaleDateString('ru-RU');
}

export function AdminDashboardPage() {
  const { inspections, selections, experts } = useAppStore();

  const { totalInspections, activeInspections, doneInspections } = useMemo(() => {
    const total = inspections.length;
    const active = inspections.filter((i) => i.status !== 'DONE' && i.status !== 'CANCELLED').length;
    const done = inspections.filter((i) => i.status === 'DONE').length;
    return { totalInspections: total, activeInspections: active, doneInspections: done };
  }, [inspections]);

  const { totalSelections, activeSelections } = useMemo(() => {
    const total = selections.length;
    const active = selections.filter((s) => s.status !== 'DONE' && s.status !== 'CANCELLED').length;
    return { totalSelections: total, activeSelections: active };
  }, [selections]);

  const { activeExperts, avgRating } = useMemo(() => {
    const active = experts.filter((e) => e.active).length;
    const sum = experts.reduce((acc, e) => acc + e.rating, 0);
    return { activeExperts: active, avgRating: experts.length ? (sum / experts.length).toFixed(1) : '—' };
  }, [experts]);

  const latestInspections = [...inspections].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5);
  const latestSelections = [...selections].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5);

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">Дашборд</span>
        <span className="chip chip--ghost">v0.1 Demo</span>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <span className="stat-card__label">Осмотры (всего)</span>
          <span className="stat-card__value">{totalInspections}</span>
          <span className="badge status--active">
            <span className="badge__dot" />
            Активных: {activeInspections}
          </span>
          <span className="badge status--done">
            <span className="badge__dot" />
            Завершено: {doneInspections}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Подборы</span>
          <span className="stat-card__value">{totalSelections}</span>
          <span className="badge status--active">
            <span className="badge__dot" />
            Активных: {activeSelections}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Эксперты</span>
          <span className="stat-card__value">{activeExperts}</span>
          <span className="badge status--new">
            <span className="badge__dot" />
            В работе: {activeExperts}
          </span>
          <span className="badge status--warn">
            <span className="badge__dot" />
            Средний рейтинг: {avgRating}
          </span>
        </div>
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th colSpan={5}>Последние осмотры</th>
            </tr>
            <tr>
              <th>ID</th>
              <th>Авто</th>
              <th>Город</th>
              <th>Дата</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {latestInspections.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{formatCar(order)}</td>
                <td>{order.city}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th colSpan={5}>Подборы и пайплайн</th>
            </tr>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Город</th>
              <th>Создан</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {latestSelections.map((sel: SelectionOrder) => (
              <tr key={sel.id}>
                <td>{sel.id}</td>
                <td>{sel.client.name}</td>
                <td>{sel.city}</td>
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
