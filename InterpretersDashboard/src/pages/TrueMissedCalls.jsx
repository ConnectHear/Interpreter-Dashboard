import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../api/api';
import { Avatar } from '../components/Avatar';
import { Pagination } from '../components/Pagination';
import { formatDateTime, timeAgo } from '../utils/helpers';
import { DateFilter } from '../components/DateFilter';

export function TrueMissedCalls() {
    const [dateFilter, setDateFilter] = useState('today');
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, loading, error } = useApi(
        () => api.getTrueMissedCalls(dateFilter, page, debouncedSearch),
        [dateFilter, page, debouncedSearch]
    );

    const navigate = useNavigate();

    const trueMissedCalls = data?.data || [];
    const pagination = data?.pagination || {};

    const totalCount = pagination.total || 0;

    return (
        <div className="page-content fade-in">
            <div className="page-header">
                <div>
                    <div className="page-title">True Missed Calls</div>
                    <div className="page-description">
                        Sessions where notifications were sent but no interpreter joined
                    </div>
                </div>
                <DateFilter value={dateFilter} onChange={(val) => { setDateFilter(val); setPage(1); }} />
            </div>

            {/* Stats Summary */}
            <div className="section">
                <div className="card" style={{ maxWidth: 300, background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ fontSize: 32, fontWeight: 800, color: '#ef4444' }}>{totalCount}</div>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>True missed calls</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Notification sent, no answer</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card section">
                {/* Search */}
                <div style={{ marginBottom: 16 }}>
                    <div className="search-bar" style={{ maxWidth: 360 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            placeholder="Search by customer name or email…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container"><div className="spinner" /><span>Loading true missed calls…</span></div>
                ) : error ? (
                    <div className="empty-state">
                        <p style={{ color: 'var(--accent-red)' }}>Error: {error}</p>
                    </div>
                ) : !trueMissedCalls.length ? (
                    <div className="empty-state">
                        <p>No true missed calls found</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Customer</th>
                                    <th>Email</th>
                                    <th>Time</th>
                                    <th>Occurred</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trueMissedCalls.map((m, idx) => (
                                    <tr key={m.monitoring_id}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                            {(page - 1) * 20 + idx + 1}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Avatar name={m.customer_name || 'Unknown'} size="sm" />
                                                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                                    {m.customer_name || 'Unknown'}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                            {m.customer_email}
                                        </td>
                                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                            {formatDateTime(m.created_at)}
                                        </td>
                                        <td>
                                            <span className="badge badge-red">
                                                {timeAgo(m.created_at)}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => navigate(`/customers/${m.customer_id}`)}
                                            >
                                                Customer Details →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    pagination={pagination}
                    onPageChange={(p) => {
                        setPage(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                />
            </div>
        </div>
    );
}
