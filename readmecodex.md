Инфраструктура
- Стек: Vite + React + TypeScript, Zustand для стора, React Router, lucide-react для иконок.
- Темы/стили: тёмный navy сайдбар, светлая область, акцент фиолетовый. Глобальные переменные в `src/index.css`, компоненты/страницы стилизованы через `App.css`.
- STORAGE_VERSION v3 с снапшотом в localStorage. При изменении моков обновляется версия.

Модели и данные
- Осмотр (InspectionOrder, id OSM-****): статусы NEW → WAITING_FOR_EXPERT → ASSIGNED → IN_PROGRESS → REPORT_IN_PROGRESS → DONE → CANCELLED, поля: объявление, parsedData, клиент/продавец, город/адрес, priceSegment, summary, expertId, appointmentAt, selectionOrderId, tariffId, report (summary, скидка, legalCheck, severities, media).
- Подбор (SelectionOrder, id POD-****): статусы NEW → WAITING_FOR_EXPERT → ASSIGNED → SOURCING → CANDIDATES_SENT → INSPECTIONS → WAITING_FOR_DECISION → DEAL_FLOW → DONE/ CANCELLED. Поля: city/cityFrom/cityTarget, budget/budgetMin/Max, requirements, deadline, inspectionIds, candidates, tariffId/addonTariffId, included/extra inspections.
- Эксперт: города, бренды/теги, skillTags, специализация, услуги, радиус/база, SLA (avgReportHours/avgResponseMinutes), loadToday, last30dInspections, recommendRatio, cancelRate, completedInspections, active.
- Кандидат: ссылка, авто, год, кузов, пробег, цена, город, статус (PENDING/APPROVED/REJECTED), summary, inspectionId, legalCheck (pledge/restrictions/fines OK/RISK/BAD + notes).
- Чат: треды с клиентами, сообщения авторов service/client/expert/system, actions (быстрые кнопки).
- Тарифы (Tariff): kind inspection|selection, priceSegment, amount (number/custom), comment. Моки включают пакеты подбора (базовый 5 осмотров, доп. осмотр) и тарифы осмотров.

Стор (`src/store/useAppStore.ts`)
- Списки: inspections, selections, experts, checklistTemplates, tariffs, chats, currentClientId/currentExpertId.
- Экшены: setCurrentClient/Expert, updateInspectionStatus, updateSelectionStatus, assignExpert, updateAppointment, addInspection, addSelection, toggleExpertActive, claimInspection, upsertReport (summary/discount/data/legalCheck/severities), updateInspectionFields, generateId, sendChatMessage, addChatThread/resetChats, updateCandidateStatus, addTariff, updateTariff. Снапшот в localStorage с версией.

Ключевые экраны/модули
- Админка:
  - Осмотры: таблица фильтры, статусные бейджи; карточка осмотра с адресом, статусом, эксперт/слот, summary, отчёт (скидка, legalCheck, severities count).
  - Подборы: новые статусы, таблица; карточка подбора показывает бюджетные вилки/города, статусы; кандидаты с юр-бейджами, переходом на осмотр, кнопка «Создать осмотр» (auto OSM); осмотры списка; требования.
  - Эксперты: фильтры/сортировки, таблица с тэгами/загрузкой/SLA, модал профиля, связанные осмотры/подборы, переход в чат.
  - Тарифы: разделён на осмотр/подбор, форма добавления/редактирования tariff (custom/number, kind).
  - Создать заказ: сегментированные кнопки «Осмотр/Комплексный подбор». Осмотр — поля объявления/клиента/продавца/тариф. Подбор — города, бюджет min/max, требования, дедлайн, пакет осмотров (включено и доп.), выбор тарифов подбора.
  - Чеклисты: read-only отображение.
  - Чат: демо-треды, системные события, action-кнопки, аватары.
- Клиентский кабинет:
  - Список осмотров/подборов. Деталка осмотра: статус, авто, эксперт, отчёт с legalCheck/скидкой.
  - Подбор: кандидаты таблица с юр-бейджами, кнопки «Подходит/Не подходит» (статус в сторе), переход к отчётам; требования; осмотры.
  - Новый заказ `/client/new`: та же форма (осмотр/подбор) с выбором тарифов по типу.
- Кабинет эксперта:
  - Выбор эксперта; доступные задачи «взять», свои задачи с переходами статусов и привязкой к подбору.
  - Деталь осмотра: чеклист с severity ok/warn/bad, юр-проверка, медиа-заглушки, рекомендация/скидка, статусы.

Юр-проверка и медиа
- В отчёте: legalCheck (pledge/restrictions/fines OK/RISK/BAD + notes), отображается бейджами в админке/клиенте.
- Media: пока плейсхолдеры (до 100 фото/видео).

Чеклист severity
- Items с `severityEnabled` рендерятся с выпадающим severity (OK/WARN/BAD), сохраняются в `report.severities`. В отчёте показываем количество рисковых пунктов (админка).

Тарифы/пакеты подбора
- Tariffs kind=selection: базовый пакет 5 осмотров, доп. осмотр; подборам сохраняем tariffId/addonTariffId и included/extra inspections. Формы создания заказа подгружают только релевантные тарифы.

Маршруты
- Admin: /admin/dashboard, /admin/inspections, /admin/inspections/:id, /admin/inspections/new, /admin/selections, /admin/selections/:id, /admin/experts, /admin/checklists, /admin/tariffs, /chat.
- Client: /client, /client/new, /client/inspections, /client/inspections/:id, /client/selections/:id.
- Expert: /expert, /expert/inspections, /expert/inspections/:id.

Pending/известные хвосты
- Цветовая отрисовка severities в отчёте/чеклисте клиент/админ (сейчас только количество рисков).
- Оплата/промокоды — заглушка, нет реальной логики.
- Календарь/слоты осмотров — пока datetime, без календарного вида.
- Системные события чата по юр-проверке/кандидатам/отчётам — частично, можно расширить.
