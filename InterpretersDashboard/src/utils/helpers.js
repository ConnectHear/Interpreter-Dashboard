/** Returns a consistent color from a string (for avatars) */
const COLORS = [
    'linear-gradient(135deg,#3b82f6,#8b5cf6)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    'linear-gradient(135deg,#06b6d4,#3b82f6)',
    'linear-gradient(135deg,#ef4444,#f59e0b)',
];

export function gradientFromStr(str = '') {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return COLORS[Math.abs(hash) % COLORS.length];
}

export function initials(name = '') {
    return name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0] || '')
        .join('')
        .toUpperCase() || '?';
}

export function formatDate(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        timeZone: 'Asia/Karachi'
    });
}

export function formatDateTime(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        timeZone: 'Asia/Karachi'
    });
}

export function formatDuration(sec) {
    if (!sec) return '—';
    const s = parseInt(sec, 10);
    if (isNaN(s)) return sec;
    const m = Math.floor(s / 60);
    const rs = s % 60;
    if (m === 0) return `${rs}s`;
    return `${m}m ${rs}s`;
}

export function timeAgo(dt) {
    if (!dt) return '—';
    const diff = (Date.now() - new Date(dt).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export function callStatusLabel(status) {
    const map = { 0: 'Disconnected', 1: 'Connecting', 2: 'Completed', 3: 'Cancelled', 4: 'In Session' };
    return map[status] ?? 'Unknown';
}

export function callStatusBadge(status) {
    const map = {
        0: 'badge-gray',
        1: 'badge-yellow',
        2: 'badge-green',
        3: 'badge-red',
        4: 'badge-blue',
    };
    return map[status] ?? 'badge-gray';
}
