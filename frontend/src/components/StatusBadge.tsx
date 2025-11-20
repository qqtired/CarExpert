import type { InspectionStatus, SelectionStatus } from '../types';

type BadgeMode = 'inspection' | 'selection';

const statusLabels: Record<InspectionStatus | SelectionStatus, string> = {
  NEW: 'Новая',
  WAITING_FOR_EXPERT: 'Ждёт эксперта',
  ASSIGNED: 'Эксперт назначен',
  IN_PROGRESS: 'Осмотр в работе',
  REPORT_IN_PROGRESS: 'Подготовка отчёта',
  DONE: 'Отчёт готов',
  CANCELLED: 'Отменена',
  WAITING_FOR_DECISION: 'Ожидание решения',
  DEAL_FLOW: 'Сделка',
  SOURCING: 'Подбор кандидатов',
  CANDIDATES_SENT: 'Кандидаты предложены',
  INSPECTIONS: 'Осмотры',
};

function tone(status: InspectionStatus | SelectionStatus): string {
  if (status === 'CANCELLED') return 'status--danger';
  if (status === 'DONE') return 'status--done';
  if (status === 'IN_PROGRESS' || status === 'REPORT_IN_PROGRESS' || status === 'INSPECTIONS') return 'status--active';
  if (status === 'WAITING_FOR_EXPERT' || status === 'WAITING_FOR_DECISION') return 'status--warn';
  if (status === 'SOURCING' || status === 'CANDIDATES_SENT' || status === 'ASSIGNED') return 'status--new';
  return 'status--new';
}

interface Props {
  status: InspectionStatus | SelectionStatus;
  mode?: BadgeMode;
}

export function StatusBadge({ status, mode = 'inspection' }: Props) {
  const label = statusLabels[status] ?? status;
  const toneClass = tone(status);
  return (
    <span className={`badge ${toneClass}`}>
      <span className="badge__dot" />
      {mode === 'inspection' ? label : `Статус: ${label}`}
    </span>
  );
}
