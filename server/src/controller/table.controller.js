import { SapBaseController } from './base.controller.js';
import { normalizeSapTable, normalizeSapTableList } from '../util/normalize.js';

class SapTableController extends SapBaseController {
  /* Get content of sap table*/
  getTableContent = async (req, res) => {
    try {
      let host = req.query.host;
      let tab = req.query.tab;
      let headers = req.query.field;
      let filter = req.query.filter;
      let delimeter = req.query.delimeter;
      let max_rows = req.query.max_rows;
      const content = await this.pullTableData(host, tab, headers, filter, delimeter, max_rows);
      const table_and_fields = normalizeSapTable(content);
      this.sendWithCode(table_and_fields, res);
    } catch (error) {
      console.log('error', error);
      this.sendWithCode(error, res);
    }
  };

  /* Get list with names of all transparent tables in sap system*/
  getTableList = async (req, res) => {
    try {
      let host = req.query.host;
      let delimeter = ';';
      let max_rows = req.query.max_rows;
      const content = await this.pullTableData(host, 'DD02L', ['TABNAME'], ["TABCLASS EQ 'TRANSP'"], delimeter, max_rows);
      const list = normalizeSapTableList(content);
      this.sendWithCode(list, res);
    } catch (error) {
      console.log('error', error);
      this.sendWithCode(error, res);
    }
  };

  /* Get list with fields of transparent table in sap system*/
  getFieldList = async (req, res) => {
    try {
      let host = req.query.host;
      let tab = req.query.tab;
      let delimeter = ';';
      let max_rows = req.query.max_rows;
      const content = await this.pullTableData(host, 'DD03L', ['FIELDNAME', 'POSITION', 'LENG'], [`TABNAME EQ '${tab}'`], delimeter, max_rows);
      let { table } = normalizeSapTable(content);
      // Оставляем только поля, по которым можно фильтровать таблицу:
      table = table.filter((e) => e.LENG !== '000000');
      // Сортируем с учетом заданного в системе порядка:
      table.sort((a, b) => a.POSITION - b.POSITION);
      this.sendWithCode(table, res);
    } catch (error) {
      console.log('error', error);
      this.sendWithCode(error, res);
    }
  };
}

export default new SapTableController();
