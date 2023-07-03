import { SapBaseController } from "./base.controller.js";

class SapTableController extends SapBaseController {
  /* Get content of sap table*/
  getTableContent = async (req, res) => {
    try {
      let host = req.query.host;
      let table = req.query.tab;
      let headers = req.query.field;
      let filter = req.query.filter;
      let delimeter = req.query.delimeter;
      let max_rows = req.query.max_rows;
      const content = await this.getTableData(host, table, headers, filter, delimeter, max_rows);
      this.sendWithCode(content, res);
    } catch (error) {
      this.sendWithCode(error, res);
    }
  };

  /* Get list with names of all transparent tables in sap system*/
  getTableList = async (req, res) => {
    try {
      let host = req.query.host;
      let delimeter = ";";
      let max_rows = req.query.max_rows;
      const content = await this.getTableData(
        host,
        "DD02L",
        ["TABNAME"],
        ["TABCLASS EQ 'TRANSP'"],
        delimeter,
        max_rows
      );
      this.sendWithCode(content, res);
    } catch (error) {
      this.sendWithCode(error, res);
    }
  };

  /* Get list with fields of transparent table in sap system*/
  getFieldList = async (req, res) => {
    try {
      let host = req.query.host;
      let table = req.query.tab;
      let delimeter = ";";
      let max_rows = req.query.max_rows;
      const content = await this.getTableData(
        host,
        "DD03L",
        ["FIELDNAME", "POSITION", "LENG"],
        [`TABNAME EQ '${table}'`],
        delimeter,
        max_rows
      );
      this.sendWithCode(content, res);
    } catch (error) {
      this.sendWithCode(error, res);
    }
  };
}

export default new SapTableController();
