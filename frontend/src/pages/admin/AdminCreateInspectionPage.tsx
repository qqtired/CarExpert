import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import type { InspectionOrder, SelectionOrder } from '../../types';
import '../../App.css';

type OrderType = 'inspection' | 'selection';

export function AdminCreateInspectionPage() {
  const navigate = useNavigate();
  const { addInspection, addSelection, generateId, tariffs } = useAppStore();
  const defaultTariff = tariffs.find((t) => t.kind === 'inspection');

  const [orderType, setOrderType] = useState<OrderType>('inspection');
  const [form, setForm] = useState({
    sourceUrl: '',
    make: '',
    model: '',
    year: 2020,
    mileage: 50000,
    price: 1500000,
    city: 'Москва',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    sellerContact: '',
    tariffId: defaultTariff?.id ?? '',
    summary: '',
  });

  const [selectionForm, setSelectionForm] = useState({
    city: 'Москва',
    cityFrom: 'Москва',
    cityTarget: 'Москва и МО',
    budgetMin: 2500000,
    budgetMax: 3000000,
    requirements: 'Кроссовер, 2020+, автомат, до 70 тыс. км, без серьёзных ДТП',
    deadline: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    includedInspections: 5,
    extraInspections: 0,
    selectionTariffId: tariffs.find((t) => t.kind === 'selection')?.id ?? '',
    addonTariffId: tariffs.find((t) => t.kind === 'selection' && t.priceSegment.includes('доп'))?.id ?? '',
  });

  const update = (key: keyof typeof form, value: any) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateSel = (key: keyof typeof selectionForm, value: any) =>
    setSelectionForm((prev) => ({ ...prev, [key]: value }));

  const tariffsInspection = tariffs.filter((t) => t.kind === 'inspection');
  const tariffsSelection = tariffs.filter((t) => t.kind === 'selection');
  const activeTariff = useMemo(() => tariffs.find((t) => t.id === form.tariffId), [tariffs, form.tariffId]);

  const selectTariff = (tariffId: string) => {
    const tariff = tariffs.find((t) => t.id === tariffId);
    if (!tariff) return;
    if (orderType === 'inspection') {
      setForm((prev) => ({
        ...prev,
        tariffId,
      }));
    } else {
      setSelectionForm((prev) => ({
        ...prev,
        selectionTariffId: tariffId,
      }));
    }
  };

  const onSubmitInspection = () => {
    const id = generateId('OSM');
    const now = new Date().toISOString();
    const newOrder: InspectionOrder = {
      id,
      status: 'WAITING_FOR_EXPERT',
      sourceUrl: form.sourceUrl || 'https://example.com/auto',
      parsedData: {
        make: form.make || 'Марка',
        model: form.model || 'Модель',
        year: Number(form.year),
        mileage: Number(form.mileage),
        price: Number(form.price),
        city: form.city,
      },
      city: form.city,
      client: { name: form.clientName || 'Клиент', phone: form.clientPhone || '+7 (900) 000-00-00', email: form.clientEmail || undefined },
      sellerContact: form.sellerContact || undefined,
      priceSegment: activeTariff?.priceSegment ?? 'Не указан',
      summary: form.summary || 'Комментарий от клиента',
      tariffId: activeTariff?.id,
      expertId: null,
      appointmentAt: null,
      createdAt: now,
      updatedAt: now,
    };
    addInspection(newOrder);
    navigate(`/admin/inspections/${id}`);
  };

  const onSubmitSelection = () => {
    const id = generateId('POD');
    const now = new Date().toISOString();
    const budgetString = selectionForm.budgetMin && selectionForm.budgetMax
      ? `${selectionForm.budgetMin.toLocaleString('ru-RU')}–${selectionForm.budgetMax.toLocaleString('ru-RU')} ₽`
      : 'Бюджет не указан';
    const selection: SelectionOrder = {
      id,
      status: 'WAITING_FOR_EXPERT',
      city: selectionForm.city,
      cityFrom: selectionForm.cityFrom,
      cityTarget: selectionForm.cityTarget,
      client: { name: selectionForm.clientName || 'Клиент', phone: selectionForm.clientPhone || '+7 (900) 000-00-00', email: selectionForm.clientEmail || undefined },
      budget: budgetString,
      budgetMin: selectionForm.budgetMin,
      budgetMax: selectionForm.budgetMax,
      requirements: selectionForm.requirements,
      deadline: selectionForm.deadline || undefined,
      inspectionIds: [],
      candidates: [],
      tariffId: selectionForm.selectionTariffId,
      addonTariffId: selectionForm.addonTariffId,
      includedInspections: selectionForm.includedInspections,
      extraInspections: selectionForm.extraInspections,
      createdAt: now,
      updatedAt: now,
    };
    addSelection(selection);
    navigate(`/admin/selections/${id}`);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (orderType === 'inspection') {
      onSubmitInspection();
    } else {
      onSubmitSelection();
    }
  };

  return (
    <div className="page">
      <div className="page-bar" style={{ gap: 12 }}>
        <span className="page-title">Создать заказ</span>
        <div className="segmented">
          <button
            type="button"
            className={orderType === 'inspection' ? 'active' : ''}
            onClick={() => setOrderType('inspection')}
          >
            Осмотр
          </button>
          <button
            type="button"
            className={orderType === 'selection' ? 'active' : ''}
            onClick={() => setOrderType('selection')}
          >
            Комплексный подбор
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="section" style={{ gap: 16 }}>
        {orderType === 'inspection' ? (
          <>
            <div className="form-grid">
              <div className="field">
                <label>Ссылка на объявление</label>
                <input value={form.sourceUrl} onChange={(e) => update('sourceUrl', e.target.value)} placeholder="https://..." />
              </div>
              <div className="field">
                <label>Марка</label>
                <input value={form.make} onChange={(e) => update('make', e.target.value)} />
              </div>
              <div className="field">
                <label>Модель</label>
                <input value={form.model} onChange={(e) => update('model', e.target.value)} />
              </div>
              <div className="field">
                <label>Год</label>
                <input type="number" value={form.year} onChange={(e) => update('year', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Пробег</label>
                <input type="number" value={form.mileage} onChange={(e) => update('mileage', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Цена</label>
                <input type="number" value={form.price} onChange={(e) => update('price', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Город</label>
                <input value={form.city} onChange={(e) => update('city', e.target.value)} />
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Клиент, имя</label>
                <input value={form.clientName} onChange={(e) => update('clientName', e.target.value)} />
              </div>
              <div className="field">
                <label>Клиент, телефон</label>
                <input value={form.clientPhone} onChange={(e) => update('clientPhone', e.target.value)} />
              </div>
              <div className="field">
                <label>Клиент, email</label>
                <input value={form.clientEmail} onChange={(e) => update('clientEmail', e.target.value)} />
              </div>
              <div className="field">
                <label>Контакт продавца</label>
                <input value={form.sellerContact} onChange={(e) => update('sellerContact', e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label>Комментарий клиента</label>
              <textarea value={form.summary} onChange={(e) => update('summary', e.target.value)} placeholder="Что важно проверить" />
            </div>

            <div className="section">
              <h4 style={{ margin: '0 0 8px' }}>Тариф</h4>
              <div className="tariff-grid">
                {tariffsInspection.map((tariff) => {
                  const isActive = tariff.id === form.tariffId;
                  return (
                    <button
                      type="button"
                      key={tariff.id}
                      className={`tariff-card ${isActive ? 'active' : ''}`}
                      onClick={() => selectTariff(tariff.id)}
                    >
                      <div className="tariff-card__title">{tariff.priceSegment}</div>
                      <div className="tariff-card__price">
                        {tariff.amount === 'custom' ? 'По договоренности' : `${tariff.amount.toLocaleString('ru-RU')} ₽`}
                      </div>
                      <div className="tariff-card__comment">{tariff.comment ?? '—'}</div>
                    </button>
                  );
                })}
              </div>
              {activeTariff && (
                <span className="badge" style={{ marginTop: 8 }}>
                  <span className="badge__dot" />
                  Выбран: {activeTariff.priceSegment}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="form-grid">
              <div className="field">
                <label>Город клиента</label>
                <input value={selectionForm.city} onChange={(e) => updateSel('city', e.target.value)} />
              </div>
              <div className="field">
                <label>Где ищем</label>
                <input value={selectionForm.cityTarget} onChange={(e) => updateSel('cityTarget', e.target.value)} />
              </div>
              <div className="field">
                <label>Бюджет мин</label>
                <input type="number" value={selectionForm.budgetMin} onChange={(e) => updateSel('budgetMin', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Бюджет макс</label>
                <input type="number" value={selectionForm.budgetMax} onChange={(e) => updateSel('budgetMax', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Дедлайн</label>
                <input type="date" value={selectionForm.deadline} onChange={(e) => updateSel('deadline', e.target.value)} />
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Клиент, имя</label>
                <input value={selectionForm.clientName} onChange={(e) => updateSel('clientName', e.target.value)} />
              </div>
              <div className="field">
                <label>Клиент, телефон</label>
                <input value={selectionForm.clientPhone} onChange={(e) => updateSel('clientPhone', e.target.value)} />
              </div>
              <div className="field">
                <label>Клиент, email</label>
                <input value={selectionForm.clientEmail} onChange={(e) => updateSel('clientEmail', e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label>Требования</label>
              <textarea value={selectionForm.requirements} onChange={(e) => updateSel('requirements', e.target.value)} placeholder="Класс авто, коробка, год, пробег, страна выпуска, пожелания" />
            </div>

            <div className="section">
              <h4 style={{ margin: '0 0 8px' }}>Тарифы подбора</h4>
              <div className="tariff-grid">
                {tariffsSelection.map((tariff) => {
                  const isActive = tariff.id === selectionForm.selectionTariffId;
                  return (
                    <button
                      type="button"
                      key={tariff.id}
                      className={`tariff-card ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectionForm((prev) => ({ ...prev, selectionTariffId: tariff.id }))}
                    >
                      <div className="tariff-card__title">{tariff.priceSegment}</div>
                      <div className="tariff-card__price">
                        {tariff.amount === 'custom' ? 'По договоренности' : `${tariff.amount.toLocaleString('ru-RU')} ₽`}
                      </div>
                      <div className="tariff-card__comment">{tariff.comment ?? '—'}</div>
                    </button>
                  );
                })}
              </div>
              <div className="form-grid" style={{ marginTop: 10 }}>
                <div className="field">
                  <label>Осмотров в пакете</label>
                  <input
                    type="number"
                    value={selectionForm.includedInspections}
                    onChange={(e) => updateSel('includedInspections', Number(e.target.value))}
                  />
                </div>
                <div className="field">
                  <label>Доп. осмотров</label>
                  <input
                    type="number"
                    value={selectionForm.extraInspections}
                    onChange={(e) => updateSel('extraInspections', Number(e.target.value))}
                  />
                </div>
                <div className="field">
                  <label>Тариф на доп. осмотр</label>
                  <select
                    value={selectionForm.addonTariffId}
                    onChange={(e) => setSelectionForm((prev) => ({ ...prev, addonTariffId: e.target.value }))}
                  >
                    <option value="">Не выбрано</option>
                    {tariffsSelection.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.priceSegment}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Базово включаем 5 осмотров. Если клиенту нужно больше, укажите доп. осмотры — можно биллить по отдельному тарифу.
              </p>
            </div>
          </>
        )}

        <div className="actions">
          <button className="chip chip--primary" type="submit">
            Создать
          </button>
        </div>
      </form>
    </div>
  );
}
