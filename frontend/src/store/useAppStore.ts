import { create } from 'zustand';
import { mockChecklistTemplates, mockExperts, mockInspections, mockSelections, mockTariffs, mockChats } from './mockData';
import type {
  ChecklistTemplate,
  Expert,
  InspectionOrder,
  InspectionStatus,
  SelectionOrder,
  SelectionStatus,
  Tariff,
  ChatThread,
  ChatMessage,
  LegalCheck,
  Candidate,
} from '../types';

const STORAGE_KEY = 'car-expert-demo-state';
const STORAGE_VERSION = 'v5';

export interface AppState {
  inspections: InspectionOrder[];
  selections: SelectionOrder[];
  experts: Expert[];
  checklistTemplates: ChecklistTemplate[];
  tariffs: Tariff[];
  chats: ChatThread[];
  currentClientId: string | null;
  currentExpertId: string | null;
  setCurrentClient: (clientId: string | null) => void;
  setCurrentExpert: (expertId: string | null) => void;
  updateInspectionStatus: (id: string, status: InspectionStatus) => void;
  updateSelectionStatus: (id: string, status: SelectionStatus) => void;
  claimSelection: (selectionId: string, expertId: string) => void;
  assignExpert: (inspectionId: string, expertId: string | null) => void;
  updateAppointment: (inspectionId: string, appointmentAt: string | null) => void;
  addInspection: (order: InspectionOrder) => void;
  addSelection: (selection: SelectionOrder) => void;
  addTariff: (tariff: Tariff) => void;
  updateTariff: (tariff: Tariff) => void;
  toggleExpertActive: (expertId: string) => void;
  claimInspection: (inspectionId: string, expertId: string) => void;
  upsertReport: (
    inspectionId: string,
    payload: {
      summary: string;
      recommendedDiscount?: { min: number; max: number; comment: string };
      data?: Record<string, unknown>;
      legalCheck?: LegalCheck;
      severities?: Record<string, 'OK' | 'WARN' | 'BAD'>;
    }
  ) => void;
  updateInspectionFields: (id: string, patch: Partial<InspectionOrder>) => void;
  generateId: (prefix: string) => string;
  sendChatMessage: (threadId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  addChatThread: (thread: ChatThread) => void;
  resetChats: () => void;
  updateCandidateStatus: (selectionId: string, candidateId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => void;
  addCandidate: (selectionId: string, candidate: Candidate) => void;
  linkCandidateInspection: (selectionId: string, candidateId: string, inspectionId: string) => void;
  addInspectionToSelection: (selectionId: string, inspectionId: string) => void;
}

function loadInitialState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      version?: string;
      state: Pick<
        AppState,
        'inspections' | 'selections' | 'experts' | 'checklistTemplates' | 'tariffs' | 'chats'
      >;
    };
    if (parsed.version !== STORAGE_VERSION) return null;
    return parsed.state;
  } catch {
    return null;
  }
}

const persisted = loadInitialState();

export const useAppStore = create<AppState>((set, _get) => ({
  inspections: persisted?.inspections ?? mockInspections,
  selections: persisted?.selections ?? mockSelections,
  experts: persisted?.experts ?? mockExperts,
  checklistTemplates: persisted?.checklistTemplates ?? mockChecklistTemplates,
  tariffs: persisted?.tariffs ?? mockTariffs,
  chats: persisted?.chats ?? mockChats,
  currentClientId: null,
  currentExpertId: null,
  setCurrentClient: (clientId) => set({ currentClientId: clientId }),
  setCurrentExpert: (expertId) => set({ currentExpertId: expertId }),
  updateInspectionStatus: (id, status) =>
    set((state) => ({
      inspections: state.inspections.map((order) =>
        order.id === id ? { ...order, status, updatedAt: new Date().toISOString() } : order
      ),
    })),
  updateSelectionStatus: (id, status) =>
    set((state) => ({
      selections: state.selections.map((selection) =>
        selection.id === id ? { ...selection, status, updatedAt: new Date().toISOString() } : selection
      ),
    })),
  claimSelection: (selectionId, expertId) =>
    set((state) => ({
      selections: state.selections.map((selection) =>
        selection.id === selectionId
          ? {
              ...selection,
              assignedExpertId: expertId,
              status: selection.status === 'NEW' || selection.status === 'WAITING_FOR_EXPERT' ? 'ASSIGNED' : selection.status,
              updatedAt: new Date().toISOString(),
            }
          : selection
      ),
    })),
  assignExpert: (inspectionId, expertId) =>
    set((state) => ({
      inspections: state.inspections.map((order) =>
        order.id === inspectionId ? { ...order, expertId, updatedAt: new Date().toISOString() } : order
      ),
    })),
  updateAppointment: (inspectionId, appointmentAt) =>
    set((state) => ({
      inspections: state.inspections.map((order) =>
        order.id === inspectionId ? { ...order, appointmentAt, updatedAt: new Date().toISOString() } : order
      ),
    })),
  addInspection: (order) =>
    set((state) => ({
      inspections: [order, ...state.inspections],
    })),
  addSelection: (selection) =>
    set((state) => ({
      selections: [selection, ...state.selections],
    })),
  addTariff: (tariff) =>
    set((state) => ({
      tariffs: [tariff, ...state.tariffs],
    })),
  updateTariff: (tariff) =>
    set((state) => ({
      tariffs: state.tariffs.map((t) => (t.id === tariff.id ? tariff : t)),
    })),
  toggleExpertActive: (expertId) =>
    set((state) => ({
      experts: state.experts.map((expert) =>
        expert.id === expertId ? { ...expert, active: !expert.active } : expert
      ),
    })),
  claimInspection: (inspectionId, expertId) =>
    set((state) => ({
      inspections: state.inspections.map((order) =>
        order.id === inspectionId
          ? {
              ...order,
              expertId,
              status: order.status === 'NEW' ? 'WAITING_FOR_EXPERT' : 'ASSIGNED',
              updatedAt: new Date().toISOString(),
            }
          : order
      ),
    })),
  upsertReport: (inspectionId, payload) =>
    set((state) => ({
      inspections: state.inspections.map((order) =>
        order.id === inspectionId
          ? {
              ...order,
              status: 'DONE',
              report: {
                id: order.report?.id ?? `REP-${Date.now()}`,
                inspectionOrderId: inspectionId,
                templateId: state.checklistTemplates[0]?.id ?? 'CHK-1',
                data: payload.data ?? order.report?.data ?? {},
                summary: payload.summary,
                recommendedDiscount: payload.recommendedDiscount,
                webUrl: order.report?.webUrl ?? `https://reports.local/${inspectionId}`,
                pdfUrl: order.report?.pdfUrl ?? `https://reports.local/${inspectionId}.pdf`,
              },
              updatedAt: new Date().toISOString(),
            }
          : order
      ),
    })),
  updateInspectionFields: (id, patch) =>
    set((state) => ({
      inspections: state.inspections.map((order) =>
        order.id === id ? { ...order, ...patch, updatedAt: new Date().toISOString() } : order
      ),
    })),
  generateId: (prefix) => {
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}-${random}`;
  },
  sendChatMessage: (threadId, message) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === threadId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  ...message,
                  id: `msg-${Date.now()}`,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : chat
      ),
    })),
  addChatThread: (thread) =>
    set((state) => ({
      chats: [...state.chats, thread],
    })),
  resetChats: () =>
    set(() => ({
      chats: mockChats,
    })),
  updateCandidateStatus: (selectionId, candidateId, status) =>
    set((state) => ({
      selections: state.selections.map((sel) =>
        sel.id === selectionId
          ? {
              ...sel,
              candidates: (sel.candidates ?? []).map((c) => (c.id === candidateId ? { ...c, status } : c)),
            }
          : sel
      ),
    })),
  addCandidate: (selectionId, candidate) =>
    set((state) => ({
      selections: state.selections.map((sel) =>
        sel.id === selectionId
          ? {
              ...sel,
              candidates: [...(sel.candidates ?? []), candidate],
              updatedAt: new Date().toISOString(),
            }
          : sel
      ),
    })),
  linkCandidateInspection: (selectionId, candidateId, inspectionId) =>
    set((state) => ({
      selections: state.selections.map((sel) =>
        sel.id === selectionId
          ? {
              ...sel,
              candidates: (sel.candidates ?? []).map((c) =>
                c.id === candidateId ? { ...c, inspectionId } : c
              ),
            }
          : sel
      ),
    })),
  addInspectionToSelection: (selectionId, inspectionId) =>
    set((state) => ({
      selections: state.selections.map((sel) =>
        sel.id === selectionId
          ? { ...sel, inspectionIds: [...sel.inspectionIds, inspectionId], updatedAt: new Date().toISOString() }
          : sel
      ),
    })),
}));

if (typeof window !== 'undefined') {
  useAppStore.subscribe((state) => {
    const snapshot = {
      version: STORAGE_VERSION,
      state: {
        inspections: state.inspections,
        selections: state.selections,
        experts: state.experts,
        checklistTemplates: state.checklistTemplates,
        tariffs: state.tariffs,
        chats: state.chats,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  });
}
