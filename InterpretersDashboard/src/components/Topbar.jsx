import { useLocation } from 'react-router-dom';

const pageTitles = {
    '/': { title: 'Dashboard', desc: 'Overview of your call center operations' },
    '/interpreters': { title: 'Interpreters', desc: 'All interpreter performance and status' },
    '/customers': { title: 'Customers', desc: 'Customer activity and call history' },
    '/missed-calls': { title: 'Missed Calls', desc: 'All missed call records' },
};

export function Topbar() {
    const location = useLocation();
    const matched = Object.keys(pageTitles)
        .filter(k => k !== '/')
        .find(k => location.pathname.startsWith(k));
    const key = matched || (location.pathname === '/' ? '/' : '/');
    const info = pageTitles[key] || { title: 'Page', desc: '' };
    const now = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="topbar">
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{info.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{info.desc}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>{now}</div>
                </div>
                <div
                    className="avatar"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', cursor: 'default' }}
                    title="Admin"
                >
                    A
                </div>
            </div>
        </div>
    );
}
