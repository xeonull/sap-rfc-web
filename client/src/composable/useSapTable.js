export function useSapTable(rawTable, isUseDesciptions = false) {
  const table = [];
  const fields = [];

  rawTable.FIELDS.forEach((field) => {
    fields.push({ title: isUseDesciptions ? field.FIELDTEXT : field.FIELDNAME, align: "start", key: field.FIELDNAME });
  });
  rawTable.ET_DATA.forEach((line) => {
    table.push(
      line.LINE.split(rawTable.DELIMITER).reduce((a, v, i) => {
        return { ...a, [fields[i]?.key]: v };
      }, {})
    );
  });

  return { table, fields };
}

export function useSapTableList(rawList) {
  const list = [];

  rawList.ET_DATA.forEach((line) => {
    list.push(line.LINE);
  });

  return list;
}

export function useSapPackageList(rawTable) {
  const packages = [];
  const fields = [];

  rawTable.FIELDS.forEach((field) => {
    fields.push({ title: field.FIELDNAME, align: "start", key: field.FIELDNAME });
  });

  rawTable.ET_DATA.forEach((line) => {
    const o = line.LINE.split(rawTable.DELIMITER).reduce((a, v, i) => {
      return { ...a, [fields[i]?.key]: v };
    }, {});
    packages.push(o);
  });

  return { packages, fields };
}

/*
  Converts an array of objects { FIELDNAME: VALUE: }
  to SAP Option structure
*/
export function useSapOption(rawFieldValues) {

  const filter = []; // Условия фильтрации для всех полей

  rawFieldValues.forEach((e) => {
    const fieldValues = e.VALUE.split(",");
    const filterOne = []; // Условия фильтрации для одного поля
    fieldValues.forEach((ee) => {
      if (ee) {
        if (ee.indexOf("*") > -1)
          filterOne.push(
            `${filterOne.length > 0 ? `OR ` : ``}${e.FIELDNAME} LIKE '${ee.replaceAll("*", "%").trim()}'`
          );
        else filterOne.push(`${filterOne.length > 0 ? `OR ` : ``}${e.FIELDNAME} EQ '${ee.trim()}'`);
      }
    });
    if (filterOne.length > 0) {
      filterOne[0] = filter.length > 0 ? `AND ( ${filterOne[0]}` : `( ${filterOne[0]}`; // Добавляем в начало 'AND', если ранее уже были добавлены другие поля в фильтр и '( '
      filterOne.push(`${filterOne.pop()} )`); // Добавляем в конец ' )'
    }
    filter.push(...filterOne);
  });

  return { filter };
}
