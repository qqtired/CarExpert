import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import '../../App.css';

export function ExpertSelectPage() {
  const navigate = useNavigate();
  const { experts, currentExpertId, setCurrentExpert } = useAppStore();

  const active = experts.filter((e) => e.active);

  const onPick = (id: string) => {
    setCurrentExpert(id);
    navigate('/expert/inspections');
  };

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">Кабинет эксперта</span>
        <span className="chip chip--ghost">Выбор профиля</span>
      </div>
      <div className="cards-grid">
        {active.map((expert) => (
          <button
            key={expert.id}
            className="stat-card"
            style={{
              border: currentExpertId === expert.id ? `2px solid var(--accent)` : '1px solid var(--border-soft)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onClick={() => onPick(expert.id)}
          >
            <span className="stat-card__label">Эксперт</span>
            <span className="stat-card__value">{expert.name}</span>
            <span className="badge status--active">
              <span className="badge__dot" />
              Города: {expert.cities.join(', ')}
            </span>
            <span className="badge">
              <span className="badge__dot" />
              Рейтинг: {expert.rating}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
