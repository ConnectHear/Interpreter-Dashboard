export function DateFilter({ value, onChange }) {
    const filters = [
        { id: 'today', label: 'Today' },
        { id: 'yesterday', label: 'Yesterday' },
        { id: '1week', label: '1 Week' },
        { id: '1month', label: '1 Month' },
        { id: 'all', label: 'All Time' },
    ];

    return (
        <div className="filter-tabs">
            {filters.map(f => (
                <button
                    key={f.id}
                    className={`filter-tab ${value === f.id ? 'active' : ''}`}
                    onClick={() => onChange(f.id)}
                >
                    {f.label}
                </button>
            ))}
        </div>
    );
}
