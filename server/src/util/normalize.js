/* Normalize SAP table as array */
export function normalizeSapTable(rawTable) {
  const table = [];
  const fields = [];

  if (!rawTable || !rawTable.FIELDS || !rawTable.ET_DATA) return { table: null, fields: null };

  rawTable.FIELDS.forEach((field) => {
    fields.push({ title: field.FIELDNAME, align: 'start', key: field.FIELDNAME, type: field.TYPE });
  });

  rawTable.ET_DATA.forEach((row) => {
    const o = row.LINE.split(rawTable.DELIMITER).reduce((a, v, i) => {
      return { ...a, [fields[i]?.key]: v };
    }, {});
    table.push(o);
  });

  return { table, fields };
}

/* Normalize SAP table as object */
export function normalizeSapTableObj(rawTable, keyField) {
  const table = {};
  const fields = {};

  if (!rawTable || !rawTable.FIELDS || !rawTable.ET_DATA) return { table: null, fields: null };

  rawTable.FIELDS.forEach((field) => {
    fields[field.FIELDNAME] = { title: field.FIELDNAME, align: 'start', key: field.FIELDNAME, type: field.TYPE };
  });

  const keys = Object.keys(fields);

  rawTable.ET_DATA.forEach((row) => {
    const o = row.LINE.split(rawTable.DELIMITER).reduce((a, v, i) => {
      return { ...a, [keys[i]]: v };
    }, {});
    const keyValue = o[keyField];
    table[keyValue] = o;
  });

  return { table, fields };
}
