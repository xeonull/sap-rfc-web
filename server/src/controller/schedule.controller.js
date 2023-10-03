import { SapBaseController } from './base.controller.js';
import { normalizeSapTable, normalizeSapTableObj } from '../util/normalize.js';
import { parseXMLTable } from '../util/parse.js';
import { UTCtoLocal } from '../util/datetime.js';

class SapScheduleController extends SapBaseController {
  planStatuses = null;
  /* Get plan table*/
  getPlan = async (req) => {
    if (!req.query.statuses || !req.query.statuses.length) return;
    let str_stat = req.query.statuses.join(',');
    return await this.getTableData(
      req.query.host,
      'UJ0_PLAN',
      ['PLAN_ID', 'PLAN_STATUS', 'SCHEDULE_ID', 'PLAN_PARA'],
      [`PLAN_STATUS IN (${str_stat})`, ` AND EXECUTE_CLASS EQ 'CL_UJD_EXECUTE_PACKAGE_TASK'`],
      req.query.delimeter,
      req.query.max_rows
    );
  };

  /* Get schedules from plan table*/
  getPlanSchedule = async (req) => {
    // console.log("2req.query.statuses:", req.query.statuses);
    if (!req.query.statuses || !req.query.statuses.length) return;
    let str_stat = req.query.statuses.join(',');
    return await this.getTableData(
      req.query.host,
      'UJ0_PLAN',
      ['SCHEDULE_ID'],
      [`PLAN_STATUS IN (${str_stat})`, ` AND EXECUTE_CLASS EQ 'CL_UJD_EXECUTE_PACKAGE_TASK'`],
      req.query.delimeter,
      req.query.max_rows
    );
  };

  _getPlanStatuses = async (req) => {
    const res = await this.getDomainValues(req.query.host, 'UJ_PLAN_STATUS', 'E', req.query.delimeter, req.query.max_rows);
    return res;
  };

  /* Get plan statuses*/
  getPlanStatuses = async (req, res) => {
    try {
      this.planStatuses = await this._getPlanStatuses(req);
      this.sendWithCode(this.planStatuses, res);
    } catch (error) {
      this.sendWithCode(error, res);
    }
  };

  /* Get schedules info for existing plan*/
  getScheduleInfo = async (req, plan) => {
    let schedule_filter = [];
    if (!plan || !plan.ET_DATA) return;
    plan.ET_DATA.forEach((row, i) => {
      let str = `'${row.LINE}'`;
      if (i === 0) str = `SCHEDULE_ID IN (${str}`;
      if (i === plan.ET_DATA.length - 1) str = `${str})`;
      else str = `${str},`;
      schedule_filter.push(str);
    });
    if (schedule_filter.length === 0) schedule_filter.push(`SCHEDULE_ID IN ('')`);

    return await this.getTableData(req.query.host, 'UJ0_SCHEDULE', ['SCHEDULE_ID', 'SCHEDULE_INFO'], schedule_filter, req.query.delimeter, req.query.max_rows);
  };

  /* Get table with planning packages*/
  getSchedule = async (req, res) => {
    try {
      // Получаем данные из таблицы UJ0_PLAN для статусов PLAN_STATUS = 0 и 1
      let content = await this.getPlan(req);

      const { table, fields } = normalizeSapTable(content);

      // Получаем список SCHEDULE_ID из таблицы UJ0_PLAN для статусов PLAN_STATUS = 0 и 1
      content = await this.getPlanSchedule(req);

      // Получаем список SCHEDULE_INFO из таблицы UJ0_SCHEDULE для полученных SCHEDULE_ID
      content = await this.getScheduleInfo(req, content);
      const { table: table_schedule, fields: fields_schedule } = normalizeSapTableObj(content, 'SCHEDULE_ID');

      // Добавляем поле SCHEDULE_INFO в основную таблицу
      if (table) {
        table.forEach((row) => {
          if (table_schedule[row['SCHEDULE_ID']]) row['SCHEDULE_INFO'] = table_schedule[row['SCHEDULE_ID']]['SCHEDULE_INFO'];
        });

        fields.push(fields_schedule['SCHEDULE_INFO']);

        // Конвертируем xml значения в объектный вид
        parseXMLTable(fields, table);

        // Список полей из xml (для параметров пакета), которые оставляем в конечной таблице:
        const fileds_param = [
          { key: 'APPSET_ID', title: 'Enviroment', align: 'start' },
          { key: 'APPL_ID', title: 'Model', align: 'start' },
          { key: 'USER_ID', title: 'User', align: 'start' },
          { key: 'GROUP_ID', title: 'Group', align: 'start' },
          { key: 'PACKAGE_ID', title: 'Package', align: 'start' },
        ];
        // Список полей из xml (для расписания), которые оставляем в конечной таблице:
        const fileds_info = [
          // { key: 'SDLSTRTDT', title: 'Date Start', align: 'start' },
          // { key: 'SDLSTRTTM', title: 'Time Start', align: 'start' },
          // { key: 'LASTSTRTDT', title: 'Date End', align: 'start' },
          // { key: 'LASTSTRTTM', title: 'Time End', align: 'start' },
          // { key: "STARTDTTYP", title: "M/W/D", align: "start" },
          // { key: "PRDMINS", title: "min.", align: "start" },
          // { key: "PRDHOURS", title: "hrs.", align: "start" },
          { key: 'PRDDAYS', title: 'Days', align: 'center' },
          { key: 'PRDWEEKS', title: 'Weeks', align: 'center' },
          { key: 'PRDMONTHS', title: 'Months', align: 'center' },
          { key: 'PERIODIC', title: 'Periodic', align: 'center' },
        ];
        // Список полей, которые не требуются в конечной таблицы:
        const fileds_del = ['PLAN_ID', 'PLAN_PARA', 'SCHEDULE_ID', 'SCHEDULE_INFO'];

        const copyFileld = (o, src, fld) => {
          if (o[src]) o[fld] = o[src][fld];
        };

        // console.log("table:", table);
        // console.log("fields:", fields);

        if (!this.planStatuses) this.planStatuses = await this._getPlanStatuses(req);

        // Выравниваем и корректируем значения в строках таблицы
        table.forEach((row) => {
          fileds_param.forEach((fld) => copyFileld(row, 'PLAN_PARA', fld.key));
          fileds_info.forEach((fld) => {
            copyFileld(row, 'SCHEDULE_INFO', fld.key);
            if (row[fld.key] == 0) row[fld.key] = '';
          });
          if (row['SCHEDULE_INFO']) {
            // Дополнительная проверка для поля SDLSTRTDT, т.к. в XML оно может встретиться 2 раза, т.е. будет массивом после parse
            if (row['SCHEDULE_INFO'] && Array.isArray(row['SCHEDULE_INFO']['SDLSTRTDT'])) row['SCHEDULE_INFO']['SDLSTRTDT'] = row['SCHEDULE_INFO']['SDLSTRTDT'][0];

            // Объединияем дату и время в один столбец и переводим из UTC в Local
            row['DATETIME_START'] = UTCtoLocal(row['SCHEDULE_INFO']['SDLSTRTDT'], row['SCHEDULE_INFO']['SDLSTRTTM']);
            row['DATETIME_END'] = UTCtoLocal(row['SCHEDULE_INFO']['LASTSTRTDT'], row['SCHEDULE_INFO']['LASTSTRTTM']);
          }
          // Подставляем вместо кодов текстовые значения статусов
          row['PLAN_STATUS'] = this.planStatuses[row['PLAN_STATUS']];

          fileds_del.forEach((fld) => delete row[fld]);
        });

        const fields_new = [];
        fields_new.push(...fileds_param);
        fields_new.push({ key: 'PLAN_STATUS', title: 'Status', align: 'start' });
        fields_new.push({ key: 'DATETIME_START', title: 'Start', align: 'start' });
        fields_new.push({ key: 'DATETIME_END', title: 'End', align: 'start' });
        fields_new.push(...fileds_info);

        // console.log("table_parse:", table);
        // console.log("fields_new:", fields_new);

        content = { table, fields: fields_new };
      } else content = { table: null, fields: null };
      this.sendWithCode(content, res);
    } catch (error) {
      console.log('error', error);

      this.sendError(error, res);
    }
  };
}

export default new SapScheduleController();
