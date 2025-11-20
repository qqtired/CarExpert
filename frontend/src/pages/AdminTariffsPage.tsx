import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import '../App.css';

type FormState = {
  id?: string;
  priceSegment: string;
  amount: number | 'custom';
  comment: string;
  kind: 'inspection' | 'selection';
  isCustom: boolean;
};

export function AdminTariffsPage() {
  const { tariffs, addTariff, updateTariff, generateId } = useAppStore();
  const inspectionTariffs = tariffs.filter((t) => t.kind === 'inspection');
  const selectionTariffs = tariffs.filter((t) => t.kind === 'selection');

  const [form, setForm] = useState<FormState>({
    priceSegment: '',
    amount: 0,
    comment: '',
    kind: 'inspection',
    isCustom: false,
  });

  const onEdit = (id: string) => {
    const t = tariffs.find((tariff) => tariff.id === id);
    if (!t) return;
    setForm({
      id: t.id,
      priceSegment: t.priceSegment,
      amount: t.amount === 'custom' ? 0 : t.amount,
      comment: t.comment ?? '',
      kind: t.kind,
      isCustom: t.amount === 'custom',
    });
  };

  const onSubmit = () => {
    const payload = {
      id: form.id ?? generateId('TAR'),
      priceSegment: form.priceSegment || 'Новый тариф',
      amount: form.isCustom ? 'custom' : Number(form.amount) || 0,
      comment: form.comment || undefined,
      kind: form.kind,
    } as const;

    if (form.id) {
      updateTariff(payload);
    } else {
      addTariff(payload);
    }
    setForm({ priceSegment: '', amount: 0, comment: '', kind: 'inspection', isCustom: false });
  };

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">Тарифы</span>
      </div>

      <div className="table-card" style={{ marginBottom: 16, padding: 16 }}>
        <h4 style={{ margin: '0 0 8px' }}>{form.id ? 'Редактирование тарифа' : 'Добавить тариф'}</h4>
        <div className="form-grid">
          <div className="field">
            <label>Тип</label>
            <select value={form.kind} onChange={(e) => setForm((prev) => ({ ...prev, kind: e.target.value as 'inspection' | 'selection' }))}>
              <option value="inspection">Осмотр</option>
              <option value="selection">Комплексный подбор</option>
            </select>
          </div>
          <div className="field">
            <label>Сегмент / пакет</label>
            <input value={form.priceSegment} onChange={(e) => setForm((prev) => ({ ...prev, priceSegment: e.target.value }))} />
          </div>
          <div className="field">
            <label>Стоимость</label>
            <input
              type="number"
              value={form.isCustom ? '' : form.amount}
              disabled={form.isCustom}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={form.isCustom}
                onChange={(e) => setForm((prev) => ({ ...prev, isCustom: e.target.checked }))}
              />
              По договорённости
            </label>
          </div>
          <div className="field">
            <label>Комментарий</label>
            <input value={form.comment} onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))} />
          </div>
        </div>
        <div className="actions" style={{ marginTop: 8 }}>
          <button className="chip chip--primary" type="button" onClick={onSubmit}>
            {form.id ? 'Сохранить' : 'Добавить'}
          </button>
          {form.id && (
            <button className="chip chip--ghost" type="button" onClick={() => setForm({ priceSegment: '', amount: 0, comment: '', kind: 'inspection', isCustom: false })}>
              Сбросить
            </button>
          )}
        </div>
      </div>

      <div className="table-card" style={{ marginBottom: 16 }}>
        <div className="page-bar">
          <span className="page-title">Осмотры</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Сегмент цены авто</th>
              <th>Тариф</th>
              <th>Комментарий</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {inspectionTariffs.map((tariff) => (
              <tr key={tariff.id}>
                <td>{tariff.priceSegment}</td>
                <td>{tariff.amount === 'custom' ? 'По договорённости' : `${tariff.amount.toLocaleString('ru-RU')} ₽`}</td>
                <td>{tariff.comment ?? '—'}</td>
                <td>
                  <button className="chip chip--ghost" type="button" onClick={() => onEdit(tariff.id)}>
                    Редактировать
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-card">
        <div className="page-bar">
          <span className="page-title">Комплексный подбор</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Пакет</th>
              <th>Стоимость</th>
              <th>Комментарий</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {selectionTariffs.map((tariff) => (
              <tr key={tariff.id}>
                <td>{tariff.priceSegment}</td>
                <td>{tariff.amount === 'custom' ? 'По договорённости' : `${tariff.amount.toLocaleString('ru-RU')} ₽`}</td>
                <td>{tariff.comment ?? '—'}</td>
                <td>
                  <button className="chip chip--ghost" type="button" onClick={() => onEdit(tariff.id)}>
                    Редактировать
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
