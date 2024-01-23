const buildInsertQuery = (table, columns) => {
    const columnNames = Object.keys(columns);
    const values = Object.values(columns);

    const query = `
        INSERT INTO ${table} (${columnNames.join(', ')})
        VALUES (${Array.from({ length: columnNames.length }, (_, i) => `$${i + 1}`).join(', ')})
        RETURNING *
    `;

    return { query, values };
};
export { buildInsertQuery };