function getDateFilter(filter, column = 'created_at') {
    if (filter === 'today') {
        return `AND DATE(${column}) = CURDATE()`;
    } else if (filter === 'yesterday') {
        return `AND DATE(${column}) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
    } else if (filter === '1week') {
        return `AND ${column} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    } else if (filter === '1month') {
        return `AND ${column} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
    }
    return '';
}

function getPagination(page = 1, limit = 20) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const offset = (p - 1) * l;
    return { limit: l, offset, page: p };
}

module.exports = { getDateFilter, getPagination };
