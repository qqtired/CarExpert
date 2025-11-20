import { Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../store/useAppStore';
import '../../App.css';

export function ClientInspectionsPage() {
  const navigate = useNavigate();
  const { inspections, selections, currentClientId } = useAppStore();

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
        <span className="page-title">Мои осмотры</span>
        <Link className="chip chip--ghost" to="/client">
          Сменить клиента
        </Link>
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Авто</th>
              <th>Город</th>
              <th>Создан</th>
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
          </tbody>
        </table>
      </div>

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
          </tbody>
        </table>
      </div>
    </div>
  );
}
