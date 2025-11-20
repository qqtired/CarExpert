import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../store/useAppStore';
import type { InspectionStatus } from '../../types';
import '../../App.css';

const statusOptions: InspectionStatus[] = [
  'NEW',
  'WAITING_FOR_EXPERT',
  'ASSIGNED',
  'IN_PROGRESS',
  'REPORT_IN_PROGRESS',
  'DONE',
  'CANCELLED',
];

export function AdminInspectionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { inspections, experts, updateInspectionStatus, assignExpert, updateAppointment, updateInspectionFields } =
    useAppStore();

  const order = useMemo(() => inspections.find((o) => o.id === id), [inspections, id]);
  const [expertId, setExpertId] = useState(order?.expertId ?? '');
  const [appointmentAt, setAppointmentAt] = useState(order?.appointmentAt ?? '');
  const [summary, setSummary] = useState(order?.summary ?? '');
  const [priceSegment, setPriceSegment] = useState(order?.priceSegment ?? '');
  const [address, setAddress] = useState(order?.address ?? '');

  if (!order) {
    navigate('/admin/inspections');
    return null;
  }

  const onSaveMeta = () => {
    assignExpert(order.id, expertId || null);
    updateAppointment(order.id, appointmentAt || null);
    updateInspectionFields(order.id, { summary, priceSegment, address });
  };

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">
          Осмотр {order.id} — {order.parsedData.make} {order.parsedData.model} {order.parsedData.year}
        </span>
        <StatusBadge status={order.status} />
        <Link className="chip chip--ghost" to="/admin/inspections">
          Назад
        </Link>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <span className="stat-card__label">Статус</span>
          <div className="field">
            <label>Изменить статус</label>
            <select value={order.status} onChange={(e) => updateInspectionStatus(order.id, e.target.value as InspectionStatus)}>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <span className="badge status--warn">
            <span className="badge__dot" />
            Создан: {new Date(order.createdAt).toLocaleString('ru-RU')}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Клиент</span>
          <span className="stat-card__value">{order.client.name}</span>
          <span className="badge">
            <span className="badge__dot" />
            {order.client.phone}
          </span>
          {order.sellerContact && (
            <span className="badge status--active">
              <span className="badge__dot" />
              Продавец: {order.sellerContact}
            </span>
          )}
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Авто</span>
          <span className="stat-card__value">
            {order.parsedData.make} {order.parsedData.model}
          </span>
          <span className="badge">
            <span className="badge__dot" />
            {order.parsedData.year}, {order.parsedData.mileage.toLocaleString('ru-RU')} км
          </span>
          <span className="badge status--active">
            <span className="badge__dot" />
            {order.parsedData.price?.toLocaleString('ru-RU') ?? '—'} ₽
          </span>
        </div>
      </div>

      <div className="table-card" style={{ padding: 16 }}>
        <div className="form-grid">
          <div className="field">
            <label>Эксперт</label>
            <select value={expertId ?? ''} onChange={(e) => setExpertId(e.target.value)}>
              <option value="">Не назначен</option>
              {experts.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} {ex.active ? '' : '(не активен)'}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Время осмотра</label>
            <input
              type="datetime-local"
              value={appointmentAt ? new Date(appointmentAt).toISOString().slice(0, 16) : ''}
              onChange={(e) => setAppointmentAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
            />
          </div>
          <div className="field">
            <label>Сегмент цены</label>
            <input value={priceSegment} onChange={(e) => setPriceSegment(e.target.value)} />
          </div>
          <div className="field">
            <label>Адрес осмотра</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Город, улица, дом" />
          </div>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Комментарий клиента</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div className="actions" style={{ marginTop: 12 }}>
          <button className="chip chip--primary" onClick={onSaveMeta}>
            Сохранить
          </button>
        </div>
      </div>

      <div className="table-card" style={{ padding: 16 }}>
        <h4 style={{ margin: '0 0 8px' }}>Отчёт</h4>
        {order.report ? (
          <div className="section">
            <span className="badge status--done">
              <span className="badge__dot" />
              Готов
            </span>
            <p style={{ margin: 0 }}>{order.report.summary}</p>
            {order.report.recommendedDiscount && (
              <span className="badge status--warn">
                <span className="badge__dot" />
                Скидка: {order.report.recommendedDiscount.min.toLocaleString('ru-RU')}–{order.report.recommendedDiscount.max.toLocaleString('ru-RU')} ₽
              </span>
            )}
            {order.report.legalCheck && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className={`badge ${order.report.legalCheck.pledge === 'BAD' ? 'status--danger' : order.report.legalCheck.pledge === 'RISK' ? 'status--warn' : 'status--active'}`}>
                  <span className="badge__dot" />
                  Залог: {order.report.legalCheck.pledge}
                </span>
                <span className={`badge ${order.report.legalCheck.restrictions === 'BAD' ? 'status--danger' : order.report.legalCheck.restrictions === 'RISK' ? 'status--warn' : 'status--active'}`}>
                  <span className="badge__dot" />
                  Ограничения: {order.report.legalCheck.restrictions}
                </span>
                {order.report.legalCheck.notes && (
                  <span className="badge status--warn">
                    <span className="badge__dot" />
                    {order.report.legalCheck.notes}
                  </span>
                )}
                {order.report.severities && (
                  <span className="badge">
                    <span className="badge__dot" />
                    Пунктов с рисками: {Object.values(order.report.severities).filter((v) => v === 'WARN' || v === 'BAD').length}
                  </span>
                )}
              </div>
            )}
            <div className="actions">
              <a className="chip chip--ghost" href={order.report.webUrl} target="_blank" rel="noreferrer">
                Web
              </a>
              <a className="chip chip--ghost" href={order.report.pdfUrl} target="_blank" rel="noreferrer">
                PDF
              </a>
            </div>
          </div>
        ) : (
          <span className="badge status--warn">
            <span className="badge__dot" />
            Отчёт отсутствует / в работе
          </span>
        )}
      </div>
    </div>
  );
}
