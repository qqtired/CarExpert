import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../store/useAppStore';
import type { Candidate } from '../../types';
import '../../App.css';

export function ClientSelectionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selections, inspections, experts, updateCandidateStatus } = useAppStore();

  const selection = useMemo(() => selections.find((s) => s.id === id), [selections, id]);
  if (!selection) {
    navigate('/client/inspections');
    return null;
  }

  const related = inspections.filter((i) => selection.inspectionIds.includes(i.id));
  const candidates = selection.candidates ?? [];
  const expert = selection.assignedExpertId
    ? experts.find((ex) => ex.id === selection.assignedExpertId)
    : undefined;

  const onCandidate = (candidate: Candidate, status: 'APPROVED' | 'REJECTED') => {
    updateCandidateStatus(selection.id, candidate.id, status);
  };

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">Подбор {selection.id}</span>
        <StatusBadge status={selection.status} mode="selection" />
        <Link className="chip chip--ghost" to="/client/inspections">
          Назад
        </Link>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <span className="stat-card__label">Клиент</span>
          <span className="stat-card__value">{selection.client.name}</span>
          <span className="badge status--warn">
            <span className="badge__dot" />
            {selection.client.phone}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Параметры</span>
          <span className="badge">
            <span className="badge__dot" />
            Бюджет: {selection.budget}
          </span>
          <span className="badge status--active">
            <span className="badge__dot" />
            Город: {selection.city}
          </span>
          <span className="badge status--warn">
            <span className="badge__dot" />
            Дедлайн: {selection.deadline ?? '—'}
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
              Эксперт назначается
            </span>
          )}
        </div>
      </div>

      <div className="table-card" style={{ padding: 16 }}>
        <h4 style={{ margin: '0 0 8px' }}>Требования</h4>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{selection.requirements}</p>
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Кандидат</th>
              <th>Авто</th>
              <th>Цена</th>
              <th>Юр.</th>
              <th>Статус</th>
              <th>Действия</th>
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
                  {c.make} {c.model} {c.year} {c.body ? `(${c.body})` : ''}, {c.mileage.toLocaleString('ru-RU')} км
                </td>
                <td>{c.price.toLocaleString('ru-RU')} ₽</td>
                <td>
                  {c.legalCheck ? (
                    <span className={`badge ${c.legalCheck.pledge === 'BAD' ? 'status--danger' : c.legalCheck.pledge === 'RISK' ? 'status--warn' : 'status--active'}`}>
                      <span className="badge__dot" />
                      {c.legalCheck.pledge}
                    </span>
                  ) : (
                    <span className="badge">
                      <span className="badge__dot" />
                      Нет данных
                    </span>
                  )}
                </td>
                <td>
                  {c.inspectionId ? (() => {
                    const linked = inspections.find((i) => i.id === c.inspectionId);
                    return linked ? <StatusBadge status={linked.status} /> : <span className="badge">Нет осмотра</span>;
                  })() : (
                    <span className="badge">Нет осмотра</span>
                  )}
                </td>
                <td>
                  <div className="actions">
                    <button
                      className={`chip ${c.status === 'APPROVED' ? 'chip--primary is-active' : 'chip--ghost'}`}
                      onClick={() => onCandidate(c, 'APPROVED')}
                      aria-pressed={c.status === 'APPROVED'}
                    >
                      Подходит
                    </button>
                    <button
                      className={`chip ${c.status === 'REJECTED' ? 'chip--danger is-active' : 'chip--ghost'}`}
                      onClick={() => onCandidate(c, 'REJECTED')}
                      aria-pressed={c.status === 'REJECTED'}
                    >
                      Не подходит
                    </button>
                    {c.inspectionId && (
                      <Link className="chip chip--ghost" to={`/client/inspections/${c.inspectionId}`}>
                        Отчёт
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 16 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Пока нет предложений, ищем</span>
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
            </tr>
          </thead>
          <tbody>
            {related.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link to={`/client/inspections/${order.id}`}>{order.id}</Link>
                </td>
                <td>
                  {order.parsedData.make} {order.parsedData.model} {order.parsedData.year}
                </td>
                <td>{order.city}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
            {related.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 16 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Пока нет осмотров по подбору</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
