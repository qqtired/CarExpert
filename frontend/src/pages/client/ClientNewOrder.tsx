import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import type { InspectionOrder, SelectionOrder } from '../../types';
import '../../App.css';

type OrderType = 'inspection' | 'selection';

export function ClientNewOrder() {
  const navigate = useNavigate();
  const {
    addInspection,
    addSelection,
    generateId,
    tariffs,
    currentClientId,
    setCurrentClient,
  } = useAppStore();

  const tariffsInspection = useMemo(() => tariffs.filter((t) => t.kind === 'inspection'), [tariffs]);
  const tariffsSelection = useMemo(() => tariffs.filter((t) => t.kind === 'selection'), [tariffs]);

  const defaultInspectionTariff = tariffsInspection[0];
  const defaultSelectionTariff = tariffsSelection[0];

  const [orderType, setOrderType] = useState<OrderType>('inspection');

  const [inspectionForm, setInspectionForm] = useState({
    sourceUrl: '',
    city: 'Москва',
    make: '',
    model: '',
    year: 2020,
    mileage: 50000,
    price: 1500000,
    summary: '',
    tariffId: defaultInspectionTariff?.id ?? '',
  });

  const activeInspectionTariff = useMemo(
    () => tariffsInspection.find((t) => t.id === inspectionForm.tariffId),
    [tariffsInspection, inspectionForm.tariffId]
  );

  const [selectionForm, setSelectionForm] = useState({
    city: 'Москва',
    cityTarget: 'Москва и МО',
    budgetMin: 2500000,
    budgetMax: 3000000,
    requirements: 'Кроссовер, автомат, 2020+, до 70 тыс. км',
    deadline: '',
    selectionTariffId: defaultSelectionTariff?.id ?? '',
    includedInspections: 5,
    extraInspections: 0,
  });

  const [clientForm, setClientForm] = useState({
    name: '',
    phone: currentClientId ?? '',
    email: '',
  });

  const updateInspection = (key: keyof typeof inspectionForm, value: any) =>
    setInspectionForm((prev) => ({ ...prev, [key]: value }));

  const updateSelection = (key: keyof typeof selectionForm, value: any) =>
    setSelectionForm((prev) => ({ ...prev, [key]: value }));

  const updateClient = (key: keyof typeof clientForm, value: any) =>
    setClientForm((prev) => ({ ...prev, [key]: value }));

  const submitInspection = () => {
    const id = generateId('OSM');
    const now = new Date().toISOString();
    const newOrder: InspectionOrder = {
      id,
      status: 'WAITING_FOR_EXPERT',
      sourceUrl: inspectionForm.sourceUrl || 'https://auto.ru/cars/new/group/vaz/iskra/23983214/24098513/1129720348-a363fe7e/',
      parsedData: {
        make: inspectionForm.make || 'Марка',
        model: inspectionForm.model || 'Модель',
        year: Number(inspectionForm.year),
        mileage: Number(inspectionForm.mileage),
        price: Number(inspectionForm.price),
        city: inspectionForm.city,
      },
      city: inspectionForm.city,
      client: {
        name: clientForm.name || 'Клиент',
        phone: clientForm.phone || '+7 (900) 000-00-00',
        email: clientForm.email || undefined,
      },
      priceSegment: activeInspectionTariff?.priceSegment ?? 'Не указан',
      summary: inspectionForm.summary || 'Комментарий от клиента',
      expertId: null,
      appointmentAt: null,
      createdAt: now,
      updatedAt: now,
      tariffId: inspectionForm.tariffId,
    };
    addInspection(newOrder);
    setCurrentClient(newOrder.client.phone);
    navigate(`/client/inspections/${id}`);
  };

  const submitSelection = () => {
    const id = generateId('POD');
    const now = new Date().toISOString();
    const budgetString =
      selectionForm.budgetMin && selectionForm.budgetMax
        ? `${selectionForm.budgetMin.toLocaleString('ru-RU')}–${selectionForm.budgetMax.toLocaleString('ru-RU')} ₽`
        : 'Бюджет не указан';
    const selection: SelectionOrder = {
      id,
      status: 'WAITING_FOR_EXPERT',
      assignedExpertId: null,
      city: selectionForm.city,
      cityFrom: selectionForm.city,
      cityTarget: selectionForm.cityTarget,
      client: {
        name: clientForm.name || 'Клиент',
        phone: clientForm.phone || '+7 (900) 000-00-00',
        email: clientForm.email || undefined,
      },
      budget: budgetString,
      budgetMin: selectionForm.budgetMin,
      budgetMax: selectionForm.budgetMax,
      requirements: selectionForm.requirements,
      deadline: selectionForm.deadline || undefined,
      inspectionIds: [],
      candidates: [],
      tariffId: selectionForm.selectionTariffId,
      includedInspections: selectionForm.includedInspections,
      extraInspections: selectionForm.extraInspections,
      createdAt: now,
      updatedAt: now,
    };
    addSelection(selection);
    setCurrentClient(selection.client.phone);
    navigate(`/client/selections/${id}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderType === 'inspection') submitInspection();
    else submitSelection();
  };

  return (
    <div className="page">
      <div className="page-bar" style={{ gap: 12 }}>
        <span className="page-title">Новый заказ</span>
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

      <form className="section" style={{ gap: 16 }} onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <label>Имя</label>
            <input value={clientForm.name} onChange={(e) => updateClient('name', e.target.value)} />
          </div>
          <div className="field">
            <label>Телефон</label>
            <input value={clientForm.phone} onChange={(e) => updateClient('phone', e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={clientForm.email} onChange={(e) => updateClient('email', e.target.value)} />
          </div>
        </div>

        {orderType === 'inspection' ? (
          <>
            <div className="form-grid">
              <div className="field">
                <label>Ссылка на объявление</label>
                <input value={inspectionForm.sourceUrl} onChange={(e) => updateInspection('sourceUrl', e.target.value)} placeholder="https://..." />
              </div>
              <div className="field">
                <label>Город осмотра</label>
                <input value={inspectionForm.city} onChange={(e) => updateInspection('city', e.target.value)} />
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Марка</label>
                <input value={inspectionForm.make} onChange={(e) => updateInspection('make', e.target.value)} />
              </div>
              <div className="field">
                <label>Модель</label>
                <input value={inspectionForm.model} onChange={(e) => updateInspection('model', e.target.value)} />
              </div>
              <div className="field">
                <label>Год</label>
                <input type="number" value={inspectionForm.year} onChange={(e) => updateInspection('year', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Пробег</label>
                <input type="number" value={inspectionForm.mileage} onChange={(e) => updateInspection('mileage', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Цена</label>
                <input type="number" value={inspectionForm.price} onChange={(e) => updateInspection('price', Number(e.target.value))} />
              </div>
            </div>
            <div className="field">
              <label>Комментарий</label>
              <textarea value={inspectionForm.summary} onChange={(e) => updateInspection('summary', e.target.value)} placeholder="Что важно проверить" />
            </div>
            <div className="section">
              <h4 style={{ margin: '0 0 8px' }}>Тариф (осмотр)</h4>
              <div className="tariff-grid">
                {tariffsInspection.map((tariff) => (
                  <button
                    key={tariff.id}
                    type="button"
                    className={`tariff-card ${inspectionForm.tariffId === tariff.id ? 'active' : ''}`}
                    onClick={() => updateInspection('tariffId', tariff.id)}
                  >
                    <div className="tariff-card__title">{tariff.priceSegment}</div>
                    <div className="tariff-card__price">
                      {tariff.amount === 'custom' ? 'По договоренности' : `${tariff.amount.toLocaleString('ru-RU')} ₽`}
                    </div>
                    <div className="tariff-card__comment">{tariff.comment ?? '—'}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="form-grid">
              <div className="field">
                <label>Город клиента</label>
                <input value={selectionForm.city} onChange={(e) => updateSelection('city', e.target.value)} />
              </div>
              <div className="field">
                <label>Где ищем</label>
                <input value={selectionForm.cityTarget} onChange={(e) => updateSelection('cityTarget', e.target.value)} />
              </div>
              <div className="field">
                <label>Бюджет мин</label>
                <input type="number" value={selectionForm.budgetMin} onChange={(e) => updateSelection('budgetMin', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Бюджет макс</label>
                <input type="number" value={selectionForm.budgetMax} onChange={(e) => updateSelection('budgetMax', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Дедлайн</label>
                <input type="date" value={selectionForm.deadline} onChange={(e) => updateSelection('deadline', e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Требования</label>
              <textarea value={selectionForm.requirements} onChange={(e) => updateSelection('requirements', e.target.value)} placeholder="Класс, коробка, год, пробег, страна, пожелания" />
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Осмотров в пакете</label>
                <input type="number" value={selectionForm.includedInspections} onChange={(e) => updateSelection('includedInspections', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Доп. осмотров</label>
                <input type="number" value={selectionForm.extraInspections} onChange={(e) => updateSelection('extraInspections', Number(e.target.value))} />
              </div>
            </div>
            <div className="section">
              <h4 style={{ margin: '0 0 8px' }}>Тариф (подбор)</h4>
              <div className="tariff-grid">
                {tariffsSelection.map((tariff) => (
                  <button
                    key={tariff.id}
                    type="button"
                    className={`tariff-card ${selectionForm.selectionTariffId === tariff.id ? 'active' : ''}`}
                    onClick={() => updateSelection('selectionTariffId', tariff.id)}
                  >
                    <div className="tariff-card__title">{tariff.priceSegment}</div>
                    <div className="tariff-card__price">
                      {tariff.amount === 'custom' ? 'По договоренности' : `${tariff.amount.toLocaleString('ru-RU')} ₽`}
                    </div>
                    <div className="tariff-card__comment">{tariff.comment ?? '—'}</div>
                  </button>
                ))}
              </div>
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
