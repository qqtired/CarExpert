import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../store/useAppStore';
import { Toast } from '../../components/Toast';
import '../../App.css';

export function ExpertInspectionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { inspections, experts, checklistTemplates, updateInspectionStatus, upsertReport } = useAppStore();
  const order = useMemo(() => inspections.find((o) => o.id === id), [inspections, id]);
  const template = checklistTemplates[0];

  const buildInitialFormData = () => {
    const result: Record<string, any> = {};
    if (order?.report?.data && template) {
      template.sections.forEach((section) => {
        section.items.forEach((item) => {
          const nestedVal = (order.report?.data as any)?.[section.id]?.[item.id];
          if (nestedVal !== undefined) result[item.id] = nestedVal;
          const sev = order.report?.severities?.[item.id];
          if (sev) result[`${item.id}_severity`] = sev;
        });
      });
    }
    return result;
  };

  const [summary, setSummary] = useState(order?.report?.summary ?? '');
  const [torhAmount, setTorhAmount] = useState(order?.report?.recommendedDiscount?.min ?? 0);
  const [discComment, setDiscComment] = useState(order?.report?.recommendedDiscount?.comment ?? '');
  const [formData, setFormData] = useState<Record<string, any>>(buildInitialFormData());
  const [legalPledge, setLegalPledge] = useState<'OK' | 'RISK' | 'BAD' | ''>((order?.report?.legalCheck?.pledge as any) ?? '');
  const [legalRestr, setLegalRestr] = useState<'OK' | 'RISK' | 'BAD' | ''>((order?.report?.legalCheck?.restrictions as any) ?? '');
  const [legalFines, setLegalFines] = useState<'OK' | 'RISK' | 'BAD' | ''>((order?.report?.legalCheck?.fines as any) ?? '');
  const [legalNotes, setLegalNotes] = useState(order?.report?.legalCheck?.notes ?? '');
  const [savedToast, setSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!order) {
    navigate('/expert/inspections');
    return null;
  }

  const expert = order.expertId ? experts.find((ex) => ex.id === order.expertId) : null;
  const isInProgress = order.status === 'IN_PROGRESS';
  const isReport = order.status === 'REPORT_IN_PROGRESS';
  const isDone = order.status === 'DONE';

  const onSave = () => {
    if (isSaving) return;
    setIsSaving(true);
    const structuredData: Record<string, Record<string, unknown>> = {};
    template?.sections.forEach((section) => {
      const sectionValues: Record<string, unknown> = {};
      section.items.forEach((item) => {
        const val = formData[item.id];
        if (val !== undefined && val !== '') {
          sectionValues[item.id] = val;
        }
      });
      if (Object.keys(sectionValues).length) structuredData[section.id] = sectionValues;
    });

    const severities: Record<string, 'OK' | 'WARN' | 'BAD'> = {};
    template?.sections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.severityEnabled) {
          const sev = (formData[`${item.id}_severity`] as 'OK' | 'WARN' | 'BAD') ?? 'OK';
          severities[item.id] = sev;
        }
      });
    });

    upsertReport(order.id, {
      summary: summary || 'Отчёт сохранён',
      recommendedDiscount: {
        min: torhAmount || 0,
        max: torhAmount || 0,
        comment: discComment || '',
      },
      data: structuredData,
      legalCheck:
        legalPledge || legalRestr || legalFines || legalNotes
          ? {
              pledge: (legalPledge || undefined) as any,
              restrictions: (legalRestr || undefined) as any,
              fines: (legalFines || undefined) as any,
              notes: legalNotes || undefined,
            }
          : undefined,
      severities,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
    setTimeout(() => setIsSaving(false), 300);
  };

  const onSetStatus = (status: any) => updateInspectionStatus(order.id, status);

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">
          {order.parsedData.make} {order.parsedData.model} {order.parsedData.year}
        </span>
        <StatusBadge status={order.status} />
        <Link className="chip chip--ghost" to="/expert/inspections">
          Назад
        </Link>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <span className="stat-card__label">Клиент</span>
          <span className="stat-card__value">{order.client.name}</span>
          <span className="badge status--warn">
            <span className="badge__dot" />
            {order.client.phone}
          </span>
          {order.sellerContact && (
            <span className="badge">
              <span className="badge__dot" />
              Продавец: {order.sellerContact}
            </span>
          )}
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Сегмент/город</span>
          <span className="badge status--active">
            <span className="badge__dot" />
            {order.priceSegment}
          </span>
          <span className="badge">
            <span className="badge__dot" />
            {order.city}
          </span>
          <span className="badge status--warn">
            <span className="badge__dot" />
            Визит: {order.appointmentAt ? new Date(order.appointmentAt).toLocaleString('ru-RU') : '—'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Эксперт</span>
          <span className="stat-card__value">{expert?.name ?? 'Не назначен'}</span>
          <div className="actions">
            <button
              className={`chip ${isInProgress ? 'chip--primary is-active' : 'chip--ghost'}`}
              onClick={() => onSetStatus('IN_PROGRESS')}
            >
              В работе
            </button>
            <button
              className={`chip ${isReport ? 'chip--primary is-active' : 'chip--ghost'}`}
              onClick={() => onSetStatus('REPORT_IN_PROGRESS')}
            >
              Пишу отчёт
            </button>
            <button
              className={`chip ${isDone ? 'chip--primary is-active' : 'chip--ghost'}`}
              onClick={() => onSetStatus('DONE')}
            >
              Завершить
            </button>
          </div>
        </div>
      </div>

      {template && (
      <div className="table-card" style={{ padding: 16 }}>
        <h4 style={{ margin: '0 0 12px' }}>Чеклист</h4>
        <div className="section">
          {template.sections.map((section) => (
            <div key={section.id} className="table-card" style={{ padding: 12 }}>
              <strong style={{ display: 'block', marginBottom: 6 }}>{section.title}</strong>
              <div className="form-grid">
                {section.items.map((item) => {
                  const value = formData[item.id] ?? '';
                  const severityKey = `${item.id}_severity`;
                  const severity = formData[severityKey] ?? 'OK';
                  const severitySelect =
                    item.severityEnabled && (
                      <select
                        value={severity}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [severityKey]: e.target.value }))}
                      >
                        <option value="OK">OK</option>
                        <option value="WARN">WARN</option>
                        <option value="BAD">BAD</option>
                      </select>
                    );

                  if (item.type === 'enum') {
                    return (
                      <div className="field" key={item.id}>
                        <label>{item.label}</label>
                        <select value={value} onChange={(e) => setFormData((prev) => ({ ...prev, [item.id]: e.target.value }))}>
                          <option value="">Не выбрано</option>
                          {item.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {severitySelect && <div style={{ marginTop: 6 }}>{severitySelect}</div>}
                      </div>
                    );
                  }
                  if (item.type === 'number') {
                    return (
                      <div className="field" key={item.id}>
                        <label>{item.label}</label>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              [item.id]: e.target.value === '' ? '' : Number(e.target.value),
                            }))
                          }
                        />
                        {severitySelect && <div style={{ marginTop: 6 }}>{severitySelect}</div>}
                      </div>
                    );
                  }
                  if (item.type === 'boolean') {
                    return (
                      <div className="field" key={item.id}>
                        <label>{item.label}</label>
                        <select
                          value={value === '' ? '' : value ? 'true' : 'false'}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              [item.id]: e.target.value === '' ? '' : e.target.value === 'true',
                            }))
                          }
                        >
                          <option value="">Не выбрано</option>
                          <option value="true">Да</option>
                          <option value="false">Нет</option>
                        </select>
                        {severitySelect && <div style={{ marginTop: 6 }}>{severitySelect}</div>}
                      </div>
                    );
                  }
                  return (
                    <div className="field" key={item.id}>
                      <label>{item.label}</label>
                      {item.type === 'text' ? (
                        <textarea
                          value={value}
                          onChange={(e) => setFormData((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        />
                      ) : (
                        <input value={value} onChange={(e) => setFormData((prev) => ({ ...prev, [item.id]: e.target.value }))} />
                      )}
                      {severitySelect && <div style={{ marginTop: 6 }}>{severitySelect}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      <div className="table-card" style={{ padding: 16 }}>
        <h4 style={{ margin: '0 0 8px' }}>Рекомендация и торг</h4>
        <div className="form-grid">
          <div className="field">
            <label>Итоговый вывод</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Рекомендуем / С оговорками / Не рекомендуем" />
          </div>
          <div className="field">
            <label>Возможный торг (₽)</label>
            <input type="number" value={torhAmount} onChange={(e) => setTorhAmount(Number(e.target.value))} />
          </div>
          <div className="field">
            <label>Комментарий по торгу</label>
            <textarea value={discComment} onChange={(e) => setDiscComment(e.target.value)} placeholder="Что починить/заменить" />
          </div>
        </div>
        <div className="actions" style={{ marginTop: 12 }}>
          <button className={`chip chip--primary ${savedToast ? 'pulse' : ''}`} onClick={onSave}>
            Сохранить отчёт
          </button>
          {savedToast && (
            <span className="badge status--done" style={{ marginLeft: 8 }}>
              <span className="badge__dot" />
              Сохранено
            </span>
          )}
        </div>
      </div>

      <div className="table-card" style={{ padding: 16 }}>
        <h4 style={{ margin: '0 0 8px' }}>Юр-проверка (демо)</h4>
        <div className="form-grid">
          <div className="field">
            <label>Залог</label>
            <select value={legalPledge} onChange={(e) => setLegalPledge(e.target.value as any)}>
              <option value="">Не указано</option>
              <option value="OK">Ок</option>
              <option value="RISK">Риск</option>
              <option value="BAD">Криминал</option>
            </select>
          </div>
          <div className="field">
            <label>Ограничения/аресты</label>
            <select value={legalRestr} onChange={(e) => setLegalRestr(e.target.value as any)}>
              <option value="">Не указано</option>
              <option value="OK">Ок</option>
              <option value="RISK">Риск</option>
              <option value="BAD">Криминал</option>
            </select>
          </div>
          <div className="field">
            <label>Штрафы/долги</label>
            <select value={legalFines} onChange={(e) => setLegalFines(e.target.value as any)}>
              <option value="">Не указано</option>
              <option value="OK">Ок</option>
              <option value="RISK">Риск</option>
              <option value="BAD">Криминал</option>
            </select>
          </div>
          <div className="field">
            <label>Комментарий</label>
            <textarea value={legalNotes} onChange={(e) => setLegalNotes(e.target.value)} placeholder="Ссылки на базы, примечания" />
          </div>
        </div>
      </div>

      <div className="table-card" style={{ padding: 16 }}>
        <h4 style={{ margin: '0 0 8px' }}>Медиа (демо)</h4>
        <div className="section">
          <span className="badge">
            <span className="badge__dot" />
            Фото: до 100 шт (пока заглушка)
          </span>
          <span className="badge">
            <span className="badge__dot" />
            Видео: 0/2 (заглушка)
          </span>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>В проде сюда прикрутим аплоуд фото/видео по категориям.</p>
        </div>
      </div>

      {savedToast && (
        <Toast message="Отчёт сохранён" kind="success" onClose={() => setSavedToast(false)} />
      )}
    </div>
  );
}
