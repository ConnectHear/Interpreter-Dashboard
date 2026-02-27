import React from 'react';

export function Pagination({ pagination, onPageChange }) {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { page, totalPages } = pagination;

    // Generate page numbers to show
    const getPages = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="pagination-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            marginTop: 24,
            padding: '12px 0'
        }}>
            <button
                className="btn btn-ghost btn-sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                style={{ padding: '4px 8px' }}
            >
                ← Prev
            </button>

            {getPages()[0] > 1 && (
                <>
                    <button className={`btn btn-sm ${page === 1 ? '' : 'btn-ghost'}`} onClick={() => onPageChange(1)}>1</button>
                    {getPages()[0] > 2 && <span style={{ color: 'var(--text-muted)' }}>...</span>}
                </>
            )}

            {getPages().map(p => (
                <button
                    key={p}
                    className={`btn btn-sm ${page === p ? '' : 'btn-ghost'}`}
                    onClick={() => onPageChange(p)}
                    style={{ minWidth: 32 }}
                >
                    {p}
                </button>
            ))}

            {getPages()[getPages().length - 1] < totalPages && (
                <>
                    {getPages()[getPages().length - 1] < totalPages - 1 && <span style={{ color: 'var(--text-muted)' }}>...</span>}
                    <button className={`btn btn-sm ${page === totalPages ? '' : 'btn-ghost'}`} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
                </>
            )}

            <button
                className="btn btn-ghost btn-sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                style={{ padding: '4px 8px' }}
            >
                Next →
            </button>
        </div>
    );
}
