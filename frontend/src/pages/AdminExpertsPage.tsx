import { useMemo, useState } from 'react';
import { ToggleLeft, ToggleRight, Star, Phone, Filter, SlidersHorizontal, MessageCircle, Link as LinkIcon, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Expert } from '../types';
import '../App.css';

type SortKey = 'rating' | 'completedInspections' | 'load';
type LoadFilter = 'all' | 'free' | 'busy' | 'overloaded';
type ActiveFilter = 'all' | 'active' | 'inactive';

export function AdminExpertsPage() {
  const { experts, toggleExpertActive, inspections, selections } = useAppStore();
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [loadFilter, setLoadFilter] = useState<LoadFilter>('all');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('rating');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

  const allCities = useMemo(() => Array.from(new Set(experts.flatMap((e) => e.cities))), [experts]);
  const allBrands = useMemo(() => Array.from(new Set(experts.flatMap((e) => [...e.brands, ...(e.brandTags ?? [])]))), [experts]);

  const filtered = useMemo(() => {
    let list: Expert[] = [...experts];
    if (cityFilter !== 'all') list = list.filter((e) => e.cities.includes(cityFilter));
    if (brandFilter !== 'all') list = list.filter((e) => e.brands.includes(brandFilter) || e.brandTags?.includes(brandFilter));
    if (loadFilter !== 'all') list = list.filter((e) => e.loadToday === loadFilter);
    if (activeFilter !== 'all') list = list.filter((e) => (activeFilter === 'active' ? e.active : !e.active));

    list.sort((a, b) => {
      if (sortKey === 'rating') return b.rating - a.rating;
      if (sortKey === 'completedInspections') return b.completedInspections - a.completedInspections;
      if (sortKey === 'load') {
        const weight = { free: 0, busy: 1, overloaded: 2 } as const;
        return weight[a.loadToday ?? 'free'] - weight[b.loadToday ?? 'free'];
      }
      return 0;
    });
    return list;
  }, [experts, cityFilter, brandFilter, loadFilter, activeFilter, sortKey]);

  const getAssignments = (expertId: string) => inspections.filter((o) => o.expertId === expertId);
  const getSelectionLinks = (expertId: string) => {
    const relatedInspectionIds = inspections.filter((o) => o.expertId === expertId && o.selectionOrderId).map((o) => o.selectionOrderId);
    return selections.filter((s) => relatedInspectionIds.includes(s.id));
  };


  return (
    <>
    <div className="page">
      <div className="page-bar">
        <span className="page-title">Эксперты</span>
        <div className="filters">
          <span className="chip chip--ghost">
            <Filter size={16} />
            Фильтры
          </span>
          <label className="control">
            <SlidersHorizontal size={16} />
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
              <option value="rating">Сортировать по рейтингу</option>
              <option value="completedInspections">Сортировать по опыту</option>
              <option value="load">Сортировать по загрузке</option>
            </select>
          </label>
          <label className="control">
            <span>Город</span>
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
              <option value="all">Все</option>
              {allCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="control">
            <span>Бренды/теги</span>
            <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
              <option value="all">Все</option>
              {allBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="control">
            <span>Загрузка</span>
            <select value={loadFilter} onChange={(e) => setLoadFilter(e.target.value as LoadFilter)}>
              <option value="all">Все</option>
              <option value="free">Свободен</option>
              <option value="busy">1 осмотр</option>
              <option value="overloaded">Перегружен</option>
            </select>
          </label>
          <label className="control">
            <span>Статус</span>
            <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)}>
              <option value="all">Все</option>
              <option value="active">Активен</option>
              <option value="inactive">Не активен</option>
            </select>
          </label>
        </div>
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Города</th>
              <th>Бренды / теги</th>
              <th>Рейтинг/опыт</th>
              <th>Загрузка / SLA</th>
              <th>Теги навыков</th>
              <th>Связанные</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((expert) => {
              const assignments = getAssignments(expert.id);
              const selectionLinks = getSelectionLinks(expert.id);
              return (
                <tr key={expert.id}>
                  <td>
                    <div className="section">
                      <strong style={{ cursor: 'pointer' }} onClick={() => setSelectedExpert(expert)}>
                        {expert.name}
                      </strong>
                      <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--text-secondary)' }}>
                        <Phone size={14} />
                        {expert.phone}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="section">
                      <span>{expert.cities.join(', ')}</span>
                      {expert.travelRadiusKm && (
                        <span className="badge">
                          <span className="badge__dot" />
                          Радиус {expert.travelRadiusKm} км ({expert.baseArea ?? 'база не указана'})
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="section">
                      <span>{expert.brands.join(', ')}</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(expert.brandTags ?? []).map((tag) => (
                          <span key={tag} className="pill">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="section">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Star size={16} color="#ffb020" fill="#ffb020" />
                        {expert.rating}
                      </span>
                      <span className="badge">
                        <span className="badge__dot" />
                        {expert.completedInspections} осмотров
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="section">
                      <span className={`badge ${expert.loadToday === 'overloaded' ? 'status--danger' : expert.loadToday === 'busy' ? 'status--warn' : 'status--done'}`}>
                        <span className="badge__dot" />
                        {expert.loadToday === 'overloaded' ? 'Перегружен' : expert.loadToday === 'busy' ? '1 осмотр' : 'Свободен'}
                      </span>
                      <span className="badge status--active">
                        <span className="badge__dot" />
                        SLA: отчёт ~ {expert.avgReportHours ?? '—'}ч, ответ ~ {expert.avgResponseMinutes ?? '—'} мин
                      </span>
                      <span className="badge">
                        <span className="badge__dot" />
                        30д: {expert.last30dInspections ?? 0} осмотров, рекомендуем {Math.round((expert.recommendRatio ?? 0) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(expert.skillTags ?? []).map((tag) => (
                        <span key={tag} className="pill">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="section">
                      <span className="badge">
                        <span className="badge__dot" />
                        Осмотров: {assignments.length}
                      </span>
                      {selectionLinks.map((sel) => (
                        <a key={sel.id} className="chip chip--ghost" href={`/admin/selections/${sel.id}`}>
                          Подбор {sel.id}
                        </a>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="icon-button" onClick={() => toggleExpertActive(expert.id)} title="Переключить статус">
                        {expert.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      <button className="icon-button" title="Открыть чат">
                        <MessageCircle size={16} />
                      </button>
                      <button className="icon-button" title="Связанные осмотры">
                        <LinkIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    {selectedExpert && (
      <ExpertModal
        expert={selectedExpert}
        inspections={inspections}
        selections={selections}
        onClose={() => setSelectedExpert(null)}
      />
    )}
    </>
  );
}

function ExpertModal({
  expert,
  onClose,
  inspections,
  selections,
}: {
  expert: Expert;
  onClose: () => void;
  inspections: ReturnType<typeof useAppStore.getState>['inspections'];
  selections: ReturnType<typeof useAppStore.getState>['selections'];
}) {
  const assignments = inspections.filter((o) => o.expertId === expert.id);
  const selectionLinks = selections.filter((s) => assignments.some((o) => o.selectionOrderId === s.id));
  const initials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] ?? '').toUpperCase() + (parts[1]?.[0] ?? '').toUpperCase();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="avatar-large">{initials(expert.name)}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{expert.name}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{expert.phone}</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="close">
            <X size={18} />
          </button>
        </div>

        <div className="cards-grid">
          <div className="stat-card">
            <span className="stat-card__label">Услуги</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(expert.services ?? []).map((s) => (
                <span key={s} className="pill">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Загрузка и SLA</span>
            <span className={`badge ${expert.loadToday === 'overloaded' ? 'status--danger' : expert.loadToday === 'busy' ? 'status--warn' : 'status--done'}`}>
              <span className="badge__dot" />
              {expert.loadToday === 'overloaded' ? 'Перегружен' : expert.loadToday === 'busy' ? '1 осмотр' : 'Свободен'}
            </span>
            <span className="badge status--active">
              <span className="badge__dot" />
              Отчёт ~ {expert.avgReportHours ?? '—'}ч, ответ ~ {expert.avgResponseMinutes ?? '—'} мин
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Радиус и база</span>
            <span>{expert.cities.join(', ')}</span>
            {expert.travelRadiusKm && (
              <span className="badge">
                <span className="badge__dot" />
                Радиус {expert.travelRadiusKm} км ({expert.baseArea ?? 'база не указана'})
              </span>
            )}
          </div>
        </div>

        <div className="section">
          <h4 style={{ margin: '0 0 8px' }}>Бренды и навыки</h4>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            {(expert.brandTags ?? []).map((tag) => (
              <span key={tag} className="pill">
                {tag}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(expert.skillTags ?? []).map((tag) => (
              <span key={tag} className="pill">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="section">
          <h4 style={{ margin: '0 0 8px' }}>Текущие осмотры</h4>
          {assignments.length === 0 ? (
            <span style={{ color: 'var(--text-secondary)' }}>Нет назначенных осмотров</span>
          ) : (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {assignments.map((o) => (
                <a key={o.id} className="chip chip--ghost" href={`/admin/inspections/${o.id}`}>
                  {o.id} — {o.parsedData.make} {o.parsedData.model}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <h4 style={{ margin: '0 0 8px' }}>Связанные подборы</h4>
          {selectionLinks.length === 0 ? (
            <span style={{ color: 'var(--text-secondary)' }}>Нет связанных подборов</span>
          ) : (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {selectionLinks.map((s) => (
                <a key={s.id} className="chip chip--ghost" href={`/admin/selections/${s.id}`}>
                  Подбор {s.id}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <h4 style={{ margin: '0 0 8px' }}>Качество / История</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge status--active">
              <span className="badge__dot" />
              Рейтинг {expert.rating}
            </span>
            <span className="badge">
              <span className="badge__dot" />
              {expert.completedInspections} осмотров, 30д: {expert.last30dInspections ?? 0}
            </span>
            <span className="badge status--warn">
              <span className="badge__dot" />
              Отмен: {expert.cancelRate}%
            </span>
            <span className="badge status--done">
              <span className="badge__dot" />
              Рекомендуем: {Math.round((expert.recommendRatio ?? 0) * 100)}%
            </span>
          </div>
        </div>

        <div className="actions" style={{ marginTop: 8 }}>
          <a className="chip chip--primary" href="/chat">
            Открыть чат
          </a>
          <button className="chip chip--ghost" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
