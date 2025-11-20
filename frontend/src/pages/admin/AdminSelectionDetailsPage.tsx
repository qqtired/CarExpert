import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../store/useAppStore';
import type { SelectionStatus, Candidate } from '../../types';
import '../../App.css';

const statusOptions: SelectionStatus[] = [
  'NEW',
  'WAITING_FOR_EXPERT',
  'ASSIGNED',
  'SOURCING',
  'CANDIDATES_SENT',
  'INSPECTIONS',
  'WAITING_FOR_DECISION',
  'DEAL_FLOW',
  'DONE',
  'CANCELLED',
];

export function AdminSelectionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selections, inspections, experts, updateSelectionStatus, addInspection, generateId } = useAppStore();

  const selection = useMemo(() => selections.find((s) => s.id === id), [selections, id]);
  if (!selection) {
    navigate('/admin/selections');
    return null;
  }

  const related = inspections.filter((i) => selection.inspectionIds.includes(i.id));
  const candidates = selection.candidates ?? [];
  const expert = selection.assignedExpertId
    ? experts.find((ex) => ex.id === selection.assignedExpertId)
    : undefined;

  const createInspectionFromCandidate = (candidate: Candidate) => {
    const newId = generateId('OSM');
    const now = new Date().toISOString();
    addInspection({
      id: newId,
      status: 'WAITING_FOR_EXPERT',
      sourceUrl: candidate.sourceUrl,
      parsedData: {
        make: candidate.make,
        model: candidate.model,
        year: candidate.year,
        mileage: candidate.mileage,
        price: candidate.price,
        city: candidate.city,
      },
      city: candidate.city,
      client: selection.client,
      priceSegment: `${selection.budgetMin?.toLocaleString('ru-RU') ?? selection.budget} ₽`,
      summary: candidate.summary ?? selection.requirements,
      expertId: null,
      appointmentAt: null,
      createdAt: now,
      updatedAt: now,
      selectionOrderId: selection.id,
      address: '',
    });
  };

  const legalBadge = (candidate: Candidate) => {
    const legal = candidate.legalCheck;
    if (!legal) return null;
    const tone = legal.pledge === 'BAD' || legal.restrictions === 'BAD' ? 'status--danger' : legal.pledge === 'RISK' || legal.restrictions === 'RISK' ? 'status--warn' : 'status--active';
    return (
      <span className={`badge ${tone}`}>
        <span className="badge__dot" />
        Юр-проверка: {legal.pledge ?? '—'}
      </span>
    );
  };

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">Подбор {selection.id}</span>
        <StatusBadge status={selection.status} mode="selection" />
        <Link className="chip chip--ghost" to="/admin/selections">
          Назад
        </Link>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <span className="stat-card__label">Клиент</span>
          <span className="stat-card__value">{selection.client.name}</span>
          <span className="badge">
            <span className="badge__dot" />
            {selection.client.phone}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Параметры</span>
          <span className="badge status--active">
            <span className="badge__dot" />
            Город: {selection.cityTarget ?? selection.city}
          </span>
          <span className="badge">
            <span className="badge__dot" />
            Бюджет: {selection.budget}
          </span>
          {(selection.budgetMin || selection.budgetMax) && (
            <span className="badge">
              <span className="badge__dot" />
              Вилка: {selection.budgetMin?.toLocaleString('ru-RU') ?? '—'}–{selection.budgetMax?.toLocaleString('ru-RU') ?? '—'} ₽
            </span>
          )}
          <span className="badge status--warn">
            <span className="badge__dot" />
            Дедлайн: {selection.deadline ?? '—'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Статус</span>
          <select
            value={selection.status}
            onChange={(e) => updateSelectionStatus(selection.id, e.target.value as SelectionStatus)}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="badge">
            <span className="badge__dot" />
            Осмотров: {selection.inspectionIds.length}
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
              <span className="badge">
                <span className="badge__dot" />
                Рейтинг: {expert.rating}
              </span>
              <Link className="chip chip--ghost" to="/chat">
                Написать эксперту
              </Link>
            </>
          ) : (
            <span className="badge status--warn">
              <span className="badge__dot" />
              Эксперт не назначен
            </span>
          )}
        </div>
      </div>

      <div className="table-card" style={{ padding: 16 }}>
        <h4 style={{ margin: '0 0 8px' }}>ТЗ на подбор</h4>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{selection.requirements}</p>
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Кандидат</th>
              <th>Авто</th>
              <th>Город</th>
              <th>Цена</th>
              <th>Статус</th>
              <th>Юр.</th>
              <th>Осмотр</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id}>
                <td>
                  <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                    {c.id}
                  </a>
                </td>
                <td>
                  {c.make} {c.model} {c.year} {c.body ? `(${c.body})` : ''}
                </td>
                <td>{c.city}</td>
                <td>{c.price.toLocaleString('ru-RU')} ₽</td>
                <td>
                  <span className="badge">
                    <span className="badge__dot" />
                    {c.status === 'APPROVED' ? 'Принят' : c.status === 'REJECTED' ? 'Отказ' : 'В рассмотрении'}
                  </span>
                </td>
                <td>{legalBadge(c)}</td>
                <td>
                  {c.inspectionId ? (
                    <Link className="chip chip--ghost" to={`/admin/inspections/${c.inspectionId}`}>
                      Осмотр {c.inspectionId}
                    </Link>
                  ) : (
                    <div className="section">
                      <span className="badge status--warn">
                        <span className="badge__dot" />
                        Без осмотра
                      </span>
                      <button className="chip chip--primary" type="button" onClick={() => createInspectionFromCandidate(c)}>
                        Создать осмотр
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 16, color: 'var(--text-secondary)' }}>
                  Пока нет кандидатов — ищем и предложим варианты
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Осмотр</th>
              <th>Авто</th>
              <th>Город</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {related.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  {order.parsedData.make} {order.parsedData.model} {order.parsedData.year}
                </td>
                <td>{order.city}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td>
                  <Link className="chip chip--ghost" to={`/admin/inspections/${order.id}`}>
                    Открыть
                  </Link>
                </td>
              </tr>
            ))}
            {related.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 16, color: 'var(--text-secondary)' }}>
                  Пока нет осмотров по подбору
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
