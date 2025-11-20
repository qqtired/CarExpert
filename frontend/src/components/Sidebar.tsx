import { NavLink, useLocation } from 'react-router-dom';
import {
  BadgePercent,
  Box,
  FileText,
  Home,
  Layers,
  ListChecks,
  LogOut,
  MapPin,
  MessageCircle,
  Settings2,
  Users,
  UserRound,
  Sparkles,
} from 'lucide-react';
import '../App.css';

const navGroups = [
  {
    title: 'Работа',
    items: [
      { label: 'Обзор', icon: Home, to: '/admin/dashboard' },
      { label: 'Создать заказ', icon: Sparkles, to: '/admin/inspections/new' },
      { label: 'Чат', icon: MessageCircle, to: '/chat' },
    ],
  },
  {
    title: 'Админка',
    items: [
      { label: 'Осмотры', icon: ListChecks, to: '/admin/inspections' },
      { label: 'Подборы', icon: Layers, to: '/admin/selections' },
      { label: 'Эксперты', icon: Users, to: '/admin/experts' },
      { label: 'Чеклисты', icon: FileText, to: '/admin/checklists' },
      { label: 'Тарифы', icon: BadgePercent, to: '/admin/tariffs' },
    ],
  },
  {
    title: 'Клиенты и сервис',
    items: [
      { label: 'Клиентский кабинет', icon: UserRound, to: '/client' },
      { label: 'Кабинет эксперта', icon: Box, to: '/expert' },
      { label: 'Карта', icon: MapPin, to: '/map', disabled: true },
      { label: 'Настройки', icon: Settings2, to: '/settings', disabled: true },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Layers size={18} />
        <span>CarExpert</span>
      </div>
      <div className="sidebar__user">
        <div className="avatar">PM</div>
        <div className="sidebar__user-info">
          <span className="sidebar__user-name">Роман PM</span>
          <span className="sidebar__user-role">Суперадмин</span>
        </div>
      </div>
      {navGroups.map((group) => (
        <div key={group.title} className="nav-section">
          <div className="nav-label">{group.title}</div>
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'nav-item',
                    isActive || location.pathname.startsWith(item.to) ? 'active' : '',
                    item.disabled ? 'disabled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <span className="nav-item__icon">
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      ))}
      <NavLink to="/logout" className="nav-item" style={{ marginTop: 'auto' }}>
        <span className="nav-item__icon">
          <LogOut size={18} />
        </span>
        Выйти
      </NavLink>
    </aside>
  );
}
