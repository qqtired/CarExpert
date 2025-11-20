import { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../store/useAppStore';
import type { SelectionOrder, Candidate } from '../../types';
import '../../App.css';

export function ExpertInspectionsPage() {
  const navigate = useNavigate();
  const {
    inspections,
    selections,
    currentExpertId,
    claimInspection,
    claimSelection,
    updateInspectionStatus,
    addCandidate,
    updateCandidateStatus,
    generateId,
    addInspection,
    linkCandidateInspection,
    addInspectionToSelection,
  } = useAppStore();

  useEffect(() => {
    if (!currentExpertId) navigate('/expert');
  }, [currentExpertId, navigate]);

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

  const availableSelections = useMemo(
    () =>
      selections.filter(
        (sel) =>
          !sel.assignedExpertId &&
          (sel.status === 'WAITING_FOR_EXPERT' || sel.status === 'NEW' || sel.status === 'SOURCING' || sel.status === 'ASSIGNED')
      ),
    [selections]
  );

  const mySelections = useMemo(
    () =>
      selections.filter((sel) => {
        const assigned = sel.assignedExpertId === currentExpertId;
        const hasInspection = sel.inspectionIds.some((inspId) => inspections.find((i) => i.id === inspId)?.expertId === currentExpertId);
        return assigned || hasInspection;
      }),
    [selections, inspections, currentExpertId]
  );

  const [drafts, setDrafts] = useState<Record<string, Partial<Candidate>>>({});
  const creatingRef = useRef<Set<string>>(new Set());

  const updateDraft = (selectionId: string, patch: Partial<Candidate>) =>
    setDrafts((prev) => ({ ...prev, [selectionId]: { ...prev[selectionId], ...patch } }));

  const onAddCandidate = (selectionId: string) => {
    const draft = drafts[selectionId] ?? {};
    const candidate: Candidate = {
      id: generateId('CAND'),
      sourceUrl: draft.sourceUrl || 'https://auto.ru/cars/new/group/vaz/iskra/23983214/24098513/1129720348-a363fe7e/',
      make: draft.make || 'Марка',
      model: draft.model || 'Модель',
      year: draft.year ? Number(draft.year) : new Date().getFullYear(),
      body: draft.body,
      mileage: draft.mileage ? Number(draft.mileage) : 0,
      price: draft.price ? Number(draft.price) : 0,
      city: draft.city || '—',
      status: 'PENDING',
      summary: draft.summary || 'Добавлен экспертом',
      inspectionId: undefined,
    };
    addCandidate(selectionId, candidate);
    setDrafts((prev) => ({ ...prev, [selectionId]: {} }));
  };

  const createInspectionFromCandidate = (sel: SelectionOrder, cand: Candidate) => {
    if (cand.inspectionId) return;
    if (creatingRef.current.has(cand.id)) return;
    creatingRef.current.add(cand.id);
    const newId = generateId('OSM');
    const now = new Date().toISOString();
    addInspection({
      id: newId,
      status: 'ASSIGNED',
      sourceUrl: cand.sourceUrl,
      parsedData: {
        make: cand.make,
        model: cand.model,
        year: cand.year,
        mileage: cand.mileage,
        price: cand.price,
        city: cand.city,
      },
      city: cand.city,
      client: sel.client,
      priceSegment: sel.budget ?? 'Не указан',
      summary: cand.summary ?? sel.requirements,
      expertId: currentExpertId,
      appointmentAt: null,
      createdAt: now,
      updatedAt: now,
      selectionOrderId: sel.id,
      address: '',
    });
    addInspectionToSelection(sel.id, newId);
    linkCandidateInspection(sel.id, cand.id, newId);
    setTimeout(() => creatingRef.current.delete(cand.id), 0);
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
      {!currentExpertId && (
        <div className="table-card" style={{ marginBottom: 12, padding: 16, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <span>Выберите эксперта, чтобы видеть задачи.</span>
          <div className="actions" style={{ justifyContent: 'center', marginTop: 8 }}>
            <Link className="chip chip--primary" to="/expert">
              Выбрать эксперта
            </Link>
          </div>
        </div>
      )}

      <div className="page-bar">
        <span className="page-title">Доступные осмотры</span>
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
                    <button className="chip chip--primary" onClick={() => { if (currentExpertId) claimInspection(order.id, currentExpertId); }}>
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
        <span className="page-title">Доступные подборы</span>
      </div>
      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Город</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {availableSelections.map((sel) => (
              <tr key={sel.id}>
                <td>{sel.id}</td>
                <td>{sel.client.name}</td>
                <td>{sel.city}</td>
                <td>
                  <StatusBadge status={sel.status} mode="selection" />
                </td>
                <td>
                  <button className="chip chip--primary" onClick={() => { if (currentExpertId) claimSelection(sel.id, currentExpertId); }}>
                    Взять подбор
                  </button>
                </td>
              </tr>
            ))}
            {availableSelections.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 16, color: 'var(--text-secondary)' }}>
                  Нет свободных подборов
                </td>
              </tr>
            )}
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
              <th>ID подбора</th>
              <th>Клиент / Город</th>
              <th>Кандидаты</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {mySelections.map((sel) => (
              <tr key={sel.id}>
                <td style={{ verticalAlign: 'top' }}>
                  <div className="section">
                    <Link to={`/admin/selections/${sel.id}`}>{sel.id}</Link>
                    <StatusBadge status={sel.status} mode="selection" />
                  </div>
                </td>
                <td style={{ verticalAlign: 'top' }}>
                  <div className="section">
                    <span style={{ fontWeight: 700 }}>{sel.client.name}</span>
                    <span className="badge">
                      <span className="badge__dot" />
                      {sel.city}
                    </span>
                  </div>
                </td>
                <td style={{ verticalAlign: 'top' }}>
                  <div className="section" style={{ gap: 6 }}>
                    {(sel.candidates ?? []).map((c) => (
                      <div key={c.id} className="badge">
                        <span className="badge__dot" />
                        {c.make} {c.model} ({c.status === 'APPROVED' ? 'Подходит' : c.status === 'REJECTED' ? 'Не подходит' : 'Новый'})
                        <div className="actions" style={{ marginTop: 4 }}>
                          <button className={`chip ${c.status === 'APPROVED' ? 'chip--primary' : 'chip--ghost'}`} onClick={() => updateCandidateStatus(sel.id, c.id, 'APPROVED')}>
                            Подходит
                          </button>
                          <button className={`chip ${c.status === 'REJECTED' ? 'chip--danger is-active' : 'chip--ghost'}`} onClick={() => updateCandidateStatus(sel.id, c.id, 'REJECTED')}>
                            Не подходит
                          </button>
                          {!c.inspectionId && (
                            <button
                              className={`chip ${c.status === 'APPROVED' ? 'chip--primary' : 'chip--ghost'}`}
                              onClick={() => c.status === 'APPROVED' && createInspectionFromCandidate(sel, c)}
                              disabled={c.status !== 'APPROVED'}
                            >
                              Создать осмотр
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td style={{ verticalAlign: 'top' }}>
                  <div className="section" style={{ gap: 8 }}>
                    <div className="candidate-form">
                      <div className="candidate-form__row">
                        <label className="candidate-form__field candidate-form__field--wide">
                          <span>Ссылка</span>
                          <input
                            value={drafts[sel.id]?.sourceUrl ?? ''}
                            onChange={(e) => updateDraft(sel.id, { sourceUrl: e.target.value })}
                            placeholder="https://..."
                          />
                        </label>
                        <label className="candidate-form__field">
                          <span>Марка</span>
                          <input
                            value={drafts[sel.id]?.make ?? ''}
                            onChange={(e) => updateDraft(sel.id, { make: e.target.value })}
                            placeholder="Марка"
                          />
                        </label>
                        <label className="candidate-form__field">
                          <span>Модель</span>
                          <input
                            value={drafts[sel.id]?.model ?? ''}
                            onChange={(e) => updateDraft(sel.id, { model: e.target.value })}
                            placeholder="Модель"
                          />
                        </label>
                      </div>
                      <div className="candidate-form__row">
                        <label className="candidate-form__field">
                          <span>Год</span>
                          <input
                            type="number"
                            value={drafts[sel.id]?.year ?? ''}
                            onChange={(e) => updateDraft(sel.id, { year: Number(e.target.value) })}
                            placeholder="Год"
                          />
                        </label>
                        <label className="candidate-form__field">
                          <span>Цена</span>
                          <input
                            type="number"
                            value={drafts[sel.id]?.price ?? ''}
                            onChange={(e) => updateDraft(sel.id, { price: Number(e.target.value) })}
                            placeholder="Цена"
                          />
                        </label>
                        <label className="candidate-form__field">
                          <span>Пробег</span>
                          <input
                            type="number"
                            value={drafts[sel.id]?.mileage ?? ''}
                            onChange={(e) => updateDraft(sel.id, { mileage: Number(e.target.value) })}
                            placeholder="Пробег"
                          />
                        </label>
                        <label className="candidate-form__field">
                          <span>Город</span>
                          <input
                            value={drafts[sel.id]?.city ?? sel.city}
                            onChange={(e) => updateDraft(sel.id, { city: e.target.value })}
                            placeholder="Город"
                          />
                        </label>
                      </div>
                      <div className="candidate-form__footer">
                        <input
                          className="candidate-form__comment"
                          value={drafts[sel.id]?.summary ?? ''}
                          onChange={(e) => updateDraft(sel.id, { summary: e.target.value })}
                          placeholder="Коротко: почему кандидат хорош/плох"
                        />
                        <button className="chip chip--primary" type="button" onClick={() => onAddCandidate(sel.id)}>
                          Предложить кандидата
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="page-bar">
        <span className="page-title">Мои осмотры</span>
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
            {mine.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 16, color: 'var(--text-secondary)' }}>
                  Нет задач — возьмите осмотр или подбор
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
