import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
    {
        label: 'Main',
        items: [
            {
                to: '/', label: 'Dashboard', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                    </svg>
                )
            },
        ]
    },
    {
        label: 'People',
        items: [
            {
                to: '/interpreters', label: 'Interpreters', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                )
            },
            {
                to: '/customers', label: 'Customers', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                )
            },
        ]
    },
    {
        label: 'Calls',
        items: [
            {
                to: '/missed-calls', label: 'Missed Calls', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.43 9.88a19.72 19.72 0 0 1-3.07-8.67A2 2 0 0 1 3.34 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.3 10.9" />
                        <line x1="23" y1="1" x2="1" y2="23" />
                    </svg>
                )
            },
        ]
    }
];

export function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h1>ConnectHear</h1>
                <p>Interpreter Dashboard</p>
            </div>
            <nav className="sidebar-nav">
                {navItems.map(section => (
                    <div key={section.label}>
                        <div className="sidebar-section-label">{section.label}</div>
                        {section.items.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>ConnectHear Admin</div>
                    <div>v1.0.0 · Call Center</div>
                </div>
            </div>
        </aside>
    );
}
