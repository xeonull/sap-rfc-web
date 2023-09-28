import noderfc from "node-rfc";

export class SapBaseController {
  sendWithCode(content, res) {
    if (
      content &&
      (content.name === "ABAPError" || content.name === "RfcLibError" || content.name === "WebServerError")
    ) {
      switch (content.key) {
        case "NOT_AUTHORIZED":
          res.status(403).send(content);
          break;
        case "TABLE_NOT_AVAILABLE":
          res.status(406).send(content);
          break;
        case "RFC_INVALID_PARAMETER":
          res.status(406).send(content);
          break;
        default:
          res.status(400).send(content);
          break;
      }
    } else {
      res.send(content);
    }
  }
  sendError(error, res) {
    res.status(400).send(error);
  }

  async getTableData(system_host, table_name, headers = [], filter = [], delimeter = ";", max_rows = 1000000) {
    const client = new noderfc.Client({ DEST: system_host });
    max_rows = parseInt(max_rows);

    try {
      await client.open();

      const rowskips = 0;
      const options = [];
      const fields = [];

      if (filter instanceof Array)
        filter.forEach((line) => {
          options.push({ TEXT: line });
        });

      if (headers instanceof Array)
        headers.forEach((f) => {
          fields.push({ FIELDNAME: f });
        });

      const result = await client.call("RFC_READ_TABLE", {
        QUERY_TABLE: table_name,
        OPTIONS: options,
        USE_ET_DATA_4_RETURN: "X",
        FIELDS: fields,
        ROWSKIPS: rowskips,
        DELIMITER: delimeter,
        ROWCOUNT: max_rows,
      });
      return result;
    } catch (err) {
      console.error(err);
      return err;
    }
  }
}
