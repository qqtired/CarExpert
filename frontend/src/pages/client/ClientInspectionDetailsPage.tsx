import { useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../store/useAppStore';
import type { ChecklistItem, ChecklistTemplate } from '../../types';
import '../../App.css';

function formatValue(item: ChecklistItem, value: unknown) {
  if (value === undefined || value === null || value === '') return '—';
  if (item.type === 'enum' && item.options) {
    const option = item.options.find((opt) => opt.value === value);
    return option ? option.label : String(value);
  }
  if (item.type === 'boolean') return value ? 'Да' : 'Нет';
  if (item.type === 'number') return typeof value === 'number' ? value : Number(value);
  return String(value);
}

export function ClientInspectionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { inspections, experts, checklistTemplates } = useAppStore();

  const order = useMemo(() => inspections.find((o) => o.id === id), [inspections, id]);
  const template: ChecklistTemplate | undefined = useMemo(() => {
    const rpt = order?.report;
    if (!rpt) return undefined;
    return checklistTemplates.find((tpl) => tpl.id === rpt.templateId) ?? checklistTemplates[0];
  }, [order, checklistTemplates]);

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
                Рекомендации по торгу: {report.recommendedDiscount.min.toLocaleString('ru-RU')} ₽
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
            {template && (
              <div className="report-grid">
                {template.sections.map((section) => (
                  <div key={section.id} className="report-section">
                    <div className="report-section__title">{section.title}</div>
                    <div className="report-items">
                      {section.items.map((item) => {
                        const sectionData = (report.data as Record<string, Record<string, unknown>> | undefined)?.[section.id];
                        const flatValue = (report.data as Record<string, unknown> | undefined)?.[item.id];
                        const value = sectionData ? sectionData[item.id] : flatValue;
                        const severity = report.severities?.[item.id];
                        const severityClass =
                          severity === 'BAD' ? 'status--danger' : severity === 'WARN' ? 'status--warn' : 'status--active';
                        return (
                          <div key={item.id} className="report-item">
                            <div className="report-item__label">{item.label}</div>
                            <div className="report-item__value">{formatValue(item, value)}</div>
                            {severity && (
                              <span className={`severity-dot ${severityClass}`} title={severity === 'BAD' ? 'Риск' : 'Внимание'} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="actions">
              <button className="chip chip--ghost" type="button" disabled>
                Экспорт в PDF (скоро)
              </button>
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
