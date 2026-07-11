import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/history', label: 'History', icon: '📋', end: false },
  { to: '/log', label: 'Log', icon: '➕', end: false },
  { to: '/charts', label: 'Charts', icon: '📈', end: false },
  { to: '/settings', label: 'Settings', icon: '⚙️', end: false },
];

export default function TabBar() {
  return (
    <nav className="tabbar" aria-label="Primary">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) => `tabbar__item${isActive ? ' tabbar__item--active' : ''}`}
        >
          <span className="tabbar__icon" aria-hidden="true">
            {t.icon}
          </span>
          <span className="tabbar__label">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
