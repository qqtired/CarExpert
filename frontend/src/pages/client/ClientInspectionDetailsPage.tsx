import { useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../store/useAppStore';
import '../../App.css';

export function ClientInspectionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { inspections, experts } = useAppStore();

  const order = useMemo(() => inspections.find((o) => o.id === id), [inspections, id]);

  if (!order) {
    navigate('/client/inspections');
    return null;
  }

  const expert = order.expertId ? experts.find((ex) => ex.id === order.expertId) : null;
  const report = order.report;

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">Осмотр {order.id}</span>
        <StatusBadge status={order.status} />
        <Link className="chip chip--ghost" to="/client/inspections">
          Назад к списку
        </Link>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <span className="stat-card__label">Авто</span>
          <span className="stat-card__value">
            {order.parsedData.make} {order.parsedData.model} {order.parsedData.year}
          </span>
          <span className="badge">
            <span className="badge__dot" />
            Пробег: {order.parsedData.mileage.toLocaleString('ru-RU')} км
          </span>
          <span className="badge status--active">
            <span className="badge__dot" />
            Цена: {order.parsedData.price?.toLocaleString('ru-RU') ?? '—'} ₽
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Сегмент</span>
          <span className="stat-card__value">{order.priceSegment}</span>
          <span className="badge status--warn">
            <span className="badge__dot" />
            Город: {order.city}
          </span>
          <span className="badge">
            <span className="badge__dot" />
            Создан: {new Date(order.createdAt).toLocaleString('ru-RU')}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Эксперт</span>
          {expert ? (
            <>
              <span className="stat-card__value">{expert.name}</span>
              <span className="badge status--active">
                <span className="badge__dot" />
                {expert.phone}
              </span>
            </>
          ) : (
            <span className="badge status--warn">
              <span className="badge__dot" />
              Эксперт не назначен
            </span>
          )}
          <span className="badge">
            <span className="badge__dot" />
            Время осмотра: {order.appointmentAt ? new Date(order.appointmentAt).toLocaleString('ru-RU') : '—'}
          </span>
        </div>
      </div>

      <div className="table-card" style={{ padding: 16 }}>
        <h4 style={{ margin: '0 0 8px' }}>Комментарий</h4>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{order.summary}</p>
      </div>

      <div className="table-card" style={{ padding: 16 }}>
        <h4 style={{ margin: '0 0 8px' }}>Отчёт</h4>
        {order.status === 'DONE' && report ? (
          <div className="section">
            <span className="badge status--done">
              <span className="badge__dot" />
              Готово
            </span>
            <p style={{ margin: 0 }}>{report.summary}</p>
            {report.recommendedDiscount && (
              <span className="badge">
                <span className="badge__dot" />
                Рекомендуемая скидка: {report.recommendedDiscount.min.toLocaleString('ru-RU')}–{report.recommendedDiscount.max.toLocaleString('ru-RU')} ₽
              </span>
            )}
            {report.legalCheck && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className={`badge ${report.legalCheck.pledge === 'BAD' ? 'status--danger' : report.legalCheck.pledge === 'RISK' ? 'status--warn' : 'status--active'}`}>
                  <span className="badge__dot" />
                  Залог: {report.legalCheck.pledge}
                </span>
                <span className={`badge ${report.legalCheck.restrictions === 'BAD' ? 'status--danger' : report.legalCheck.restrictions === 'RISK' ? 'status--warn' : 'status--active'}`}>
                  <span className="badge__dot" />
                  Ограничения: {report.legalCheck.restrictions}
                </span>
                {report.legalCheck.notes && (
                  <span className="badge status--warn">
                    <span className="badge__dot" />
                    {report.legalCheck.notes}
                  </span>
                )}
              </div>
            )}
            <div className="actions">
              <a className="chip chip--ghost" href={report.webUrl} target="_blank" rel="noreferrer">
                Web
              </a>
              <a className="chip chip--ghost" href={report.pdfUrl} target="_blank" rel="noreferrer">
                PDF
              </a>
            </div>
          </div>
        ) : (
          <span className="badge status--warn">
            <span className="badge__dot" />
            Отчёт пока не готов
          </span>
        )}
      </div>
    </div>
  );
}
