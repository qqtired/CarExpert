import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../store/useAppStore';
import type { SelectionOrder } from '../../types';
import '../../App.css';

export function ExpertInspectionsPage() {
  const navigate = useNavigate();
  const { inspections, selections, currentExpertId, claimInspection, updateInspectionStatus } = useAppStore();

  if (!currentExpertId) {
    navigate('/expert');
    return null;
  }

  const available = useMemo(
    () => inspections.filter((o) => !o.expertId || o.status === 'WAITING_FOR_EXPERT'),
    [inspections]
  );
  const mine = useMemo(
    () => inspections.filter((o) => o.expertId === currentExpertId),
    [inspections, currentExpertId]
  );

  const relatedSelection = (inspectionId: string): SelectionOrder | undefined => {
    const insp = inspections.find((i) => i.id === inspectionId);
    if (!insp?.selectionOrderId) return undefined;
    return selections.find((s) => s.id === insp.selectionOrderId);
  };

  const nextStatus = (status: string) => {
    if (status === 'ASSIGNED') return 'IN_PROGRESS';
    if (status === 'IN_PROGRESS') return 'REPORT_IN_PROGRESS';
    if (status === 'REPORT_IN_PROGRESS') return 'DONE';
    return null;
  };

  const onAdvance = (id: string, status: string) => {
    const next = nextStatus(status);
    if (next) updateInspectionStatus(id, next as any);
  };

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">Доступные задачи</span>
        <Link className="chip chip--ghost" to="/expert">
          Сменить эксперта
        </Link>
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Авто</th>
              <th>Город</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {available.map((order) => (
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
                  <div className="actions">
                    <button className="chip chip--primary" onClick={() => claimInspection(order.id, currentExpertId)}>
                      Взять
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="page-bar">
        <span className="page-title">Мои задачи</span>
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Авто</th>
              <th>Город</th>
              <th>Статус</th>
              <th>Подбор</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {mine.map((order) => (
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
                  {relatedSelection(order.id) ? (
                    <Link className="chip chip--ghost" to={`/admin/selections/${relatedSelection(order.id)!.id}`}>
                      {relatedSelection(order.id)!.id}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <div className="actions">
                    <Link className="chip chip--ghost" to={`/expert/inspections/${order.id}`}>
                      Открыть
                    </Link>
                    {nextStatus(order.status) && (
                      <button className="chip chip--primary" onClick={() => onAdvance(order.id, order.status)}>
                        Дальше: {nextStatus(order.status)}
                      </button>
                    )}
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
