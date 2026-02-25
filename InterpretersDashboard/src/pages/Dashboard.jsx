import { useApi } from '../hooks/useApi';
import { api } from '../api/api';
import { formatDateTime, timeAgo } from '../utils/helpers';
import { StatusBadge, ChatBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS_PIE = ['#10b981', '#f59e0b', '#4b5a72'];

function StatCard({ icon, label, value, color, sub }) {
    return (
        <div className="stat-card fade-in">
            <div className={`stat-icon ${color}`}>{icon}</div>
            <div className="stat-info">
                <div className="stat-value">{value ?? '—'}</div>
                <div className="stat-label">{label}</div>
                {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="tooltip-custom">
            <div className="label">{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color: p.color, marginTop: 2 }}>
                    {p.name}: <strong>{p.value}</strong>
                </div>
            ))}
        </div>
    );
}

export function Dashboard() {
    const { data: stats, loading: l1 } = useApi(api.getDashboardStats);
    const { data: trend, loading: l2 } = useApi(api.getCallsTrend);
    const { data: recent, loading: l3 } = useApi(api.getRecentSessions);
    const { data: interpStatus, loading: l4 } = useApi(api.getInterpreterStatus);

    const trendData = (trend || []).map(r => ({
        date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Total: Number(r.total),
        Completed: Number(r.completed),
        Cancelled: Number(r.cancelled),
    }));

    const pieData = interpStatus || [];

    return (
        <div className="page-content fade-in">
            {/* ── Stats Row ────────────────────────────────── */}
            <div className="section">
                <div className="page-header">
                    <div>
                        <div className="page-title">Dashboard Overview</div>
                        <div className="page-description">Real-time call center statistics</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
                        Live data
                    </div>
                </div>

                {l1 ? <div className="loading-container"><div className="spinner" /></div> : (
                    <div className="grid-4">
                        <StatCard
                            color="blue"
                            label="Total Interpreters"
                            value={stats?.total_interpreters}
                            icon={<IconUsers />}
                        />
                        <StatCard
                            color="green"
                            label="Online Now"
                            value={stats?.active_interpreters}
                            icon={<IconWifi />}
                            sub="Available interpreters"
                        />
                        <StatCard
                            color="orange"
                            label="On Call Now"
                            value={stats?.on_call}
                            icon={<IconPhone />}
                            sub="Active sessions"
                        />
                        <StatCard
                            color="purple"
                            label="Total Customers"
                            value={stats?.total_customers}
                            icon={<IconUser />}
                        />
                        <StatCard
                            color="cyan"
                            label="Calls Today"
                            value={stats?.calls_today}
                            icon={<IconActivity />}
                            sub="All call attempts"
                        />
                        <StatCard
                            color="green"
                            label="Completed Today"
                            value={stats?.completed_today}
                            icon={<IconCheck />}
                            sub="Successfully answered"
                        />
                        <StatCard
                            color="red"
                            label="Missed Today"
                            value={stats?.missed_today}
                            icon={<IconPhoneMissed />}
                            sub="Cancelled calls"
                        />
                        <StatCard
                            color="yellow"
                            label="Pending Today"
                            value={stats?.pending_today}
                            icon={<IconClock />}
                            sub="Awaiting connection"
                        />
                    </div>
                )}
            </div>

            {/* ── Charts Row ───────────────────────────────── */}
            <div className="grid-2-1 section">
                {/* Area Chart - Call Trend */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Call Activity (Last 7 Days)</div>
                            <div className="card-subtitle">Total vs completed vs cancelled</div>
                        </div>
                    </div>
                    {l2 ? <div className="loading-container" style={{ height: 200 }}><div className="spinner" /></div> : (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                                <defs>
                                    <linearGradient id="colTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="Total" stroke="#3b82f6" fill="url(#colTotal)" strokeWidth={2} />
                                <Area type="monotone" dataKey="Completed" stroke="#10b981" fill="url(#colCompleted)" strokeWidth={2} />
                                <Area type="monotone" dataKey="Cancelled" stroke="#ef4444" fill="none" strokeWidth={2} strokeDasharray="4 2" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pie Chart - Interpreter Status */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Interpreter Status</div>
                            <div className="card-subtitle">Current availability</div>
                        </div>
                    </div>
                    {l4 ? <div className="loading-container" style={{ height: 200 }}><div className="spinner" /></div> : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(v, n) => [v, n]}
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── Recent Sessions ──────────────────────────── */}
            <div className="card section">
                <div className="card-header">
                    <div>
                        <div className="card-title">Recent Sessions</div>
                        <div className="card-subtitle">Latest 10 call sessions</div>
                    </div>
                </div>
                {l3 ? (
                    <div className="loading-container"><div className="spinner" /></div>
                ) : !recent?.length ? (
                    <div className="empty-state">
                        <IconActivity size={40} />
                        <p>No sessions found</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Interpreter</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Duration</th>
                                    <th>Started</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map(s => (
                                    <tr key={s.monitoring_id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Avatar name={s.customer_name || '?'} size="sm" />
                                                <div>
                                                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.customer_name || 'Unknown'}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.customer_email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{s.interpreter_name || <span className="badge badge-gray">Unassigned</span>}</td>
                                        <td><ChatBadge is_chat={s.is_chat} /></td>
                                        <td><StatusBadge status={s.status} /></td>
                                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.duration ? `${s.duration}s` : '—'}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDateTime(s.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconUsers() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function IconUser() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
function IconPhone() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5 2 2 0 0 1 3.59 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.91A16 16 0 0 0 13 16l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
}
function IconPhoneMissed() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="23" y1="1" x2="1" y2="23" /><path d="M16.5 4.5A14.5 14.5 0 0 1 5.24 14.87M9.5 1.5A14.5 14.5 0 0 1 22.27 14.13" /><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 2 2 0 0 1-.45-2.11" /><path d="M3.5 3.5A19.79 19.79 0 0 0 1.61 5 2 2 0 0 0 3.59 7h3a2 2 0 0 0 2-1.72" /></svg>;
}
function IconWifi() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" /></svg>;
}
function IconActivity() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
}
function IconCheck() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>;
}
function IconClock() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
