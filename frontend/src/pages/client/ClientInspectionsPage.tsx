import { Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../store/useAppStore';
import '../../App.css';

export function ClientInspectionsPage() {
  const navigate = useNavigate();
  const { inspections, selections, experts, currentClientId } = useAppStore();

  const getExpertName = (expertId: string | null | undefined) => {
    if (!expertId) return 'Не назначен';
    return experts.find((ex) => ex.id === expertId)?.name ?? 'Не назначен';
  };

  const myInspections = useMemo(() => {
    if (!currentClientId) return [];
    return inspections.filter((o) => o.client.phone === currentClientId);
  }, [inspections, currentClientId]);

  const mySelections = useMemo(() => {
    if (!currentClientId) return [];
    return selections.filter((s) => s.client.phone === currentClientId);
  }, [selections, currentClientId]);

  if (!currentClientId) {
    navigate('/client');
    return null;
  }

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">Мои подборы</span>
      </div>
      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Город</th>
              <th>Бюджет</th>
              <th>Создан</th>
              <th>Эксперт</th>
              <th>Статус</th>
              <th>Детали</th>
            </tr>
          </thead>
          <tbody>
            {mySelections.map((sel) => (
              <tr key={sel.id}>
                <td>{sel.id}</td>
                <td>{sel.city}</td>
                <td>{sel.budget}</td>
                <td>{new Date(sel.createdAt).toLocaleDateString('ru-RU')}</td>
                <td>{getExpertName(sel.assignedExpertId ?? null)}</td>
                <td>
                  <StatusBadge status={sel.status} mode="selection" />
                </td>
                <td>
                  <Link className="chip chip--ghost" to={`/client/selections/${sel.id}`}>
                    Открыть
                  </Link>
                </td>
              </tr>
            ))}
            {mySelections.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 16 }}>
                  <div className="section" style={{ alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Пока нет предложений, ищем</span>
                    <Link className="chip chip--primary" to="/client/new">
                      Перейти на страницу заказа
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="page-bar">
        <span className="page-title">Мои осмотры</span>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>
          (осмотры заказанные, вне рамок комплексного подбора)
        </span>
      </div>
      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Авто</th>
              <th>Город</th>
              <th>Создан</th>
              <th>Эксперт</th>
              <th>Статус</th>
              <th>Детали</th>
            </tr>
          </thead>
          <tbody>
            {myInspections.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  {order.parsedData.make} {order.parsedData.model} {order.parsedData.year}
                </td>
                <td>{order.city}</td>
                <td>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                <td>{getExpertName(order.expertId)}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td>
                  <Link className="chip chip--ghost" to={`/client/inspections/${order.id}`}>
                    Открыть
                  </Link>
                </td>
              </tr>
            ))}
            {myInspections.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 16 }}>
                  <div className="section" style={{ alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Пока нет предложений, ищем</span>
                    <Link className="chip chip--primary" to="/client/new">
                      Перейти на страницу заказа
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
