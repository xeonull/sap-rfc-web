import { SapBaseController } from "./base.controller.js";
import { normalizeSapTable, normalizeSapTableObj } from "../util/normalize.js";
import { parseXMLTable } from "../util/parse.js";

class SapScheduleController extends SapBaseController {
  getPlan = async (req) => {
    return await this.getTableData(
      req.query.host,
      "UJ0_PLAN",
      ["PLAN_ID", "PLAN_STATUS", "SCHEDULE_ID", "PLAN_PARA"],
      ["PLAN_STATUS IN (0,1) AND EXECUTE_CLASS EQ 'CL_UJD_EXECUTE_PACKAGE_TASK'"],
      req.query.delimeter,
      req.query.max_rows
    );
  };

  getPlanSchedule = async (req) => {
    return await this.getTableData(
      req.query.host,
      "UJ0_PLAN",
      ["SCHEDULE_ID"],
      ["PLAN_STATUS IN (0,1) AND EXECUTE_CLASS EQ 'CL_UJD_EXECUTE_PACKAGE_TASK'"],
      req.query.delimeter,
      req.query.max_rows
    );
  };

  getScheduleInfo = async (req, plan) => {
    let schedule_filter = [];
    plan.ET_DATA.forEach((row, i) => {
      let str = `'${row.LINE}'`;
      if (i === 0) str = `SCHEDULE_ID IN (${str}`;
      if (i === plan.ET_DATA.length - 1) str = `${str})`;
      else str = `${str},`;
      schedule_filter.push(str);
    });
    if (schedule_filter.length === 0) schedule_filter.push(`SCHEDULE_ID IN ('')`);

    return await this.getTableData(
      req.query.host,
      "UJ0_SCHEDULE",
      ["SCHEDULE_ID", "SCHEDULE_INFO"],
      schedule_filter,
      req.query.delimeter,
      req.query.max_rows
    );
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
      const { table: table_schedule, fields: fields_schedule } = normalizeSapTableObj(content, "SCHEDULE_ID");

      table.forEach((row) => {
        if (table_schedule[row["SCHEDULE_ID"]])
          row["SCHEDULE_INFO"] = table_schedule[row["SCHEDULE_ID"]]["SCHEDULE_INFO"];
      });

      fields.push(fields_schedule["SCHEDULE_INFO"]);

      parseXMLTable(fields, table);

      const fileds_param = [
        { key: "APPSET_ID", title: "Enviroment", align: "start" },
        { key: "APPL_ID", title: "Model", align: "start" },
        { key: "USER_ID", title: "User", align: "start" },
        { key: "GROUP_ID", title: "Group", align: "start" },
        { key: "PACKAGE_ID", title: "Package", align: "start" },
      ];
      const fileds_info = [
        { key: "SDLSTRTDT", title: "Date start", align: "start" },
        { key: "SDLSTRTTM", title: "Time start", align: "start" },
        { key: "LASTSTRTDT", title: "Date end", align: "start" },
        { key: "LASTSTRTTM", title: "Time end", align: "start" },
        // { key: "STARTDTTYP", title: "M/W/D", align: "start" },
        // { key: "PRDMINS", title: "min.", align: "start" },
        // { key: "PRDHOURS", title: "hrs.", align: "start" },
        { key: "PRDDAYS", title: "days", align: "start" },
        { key: "PRDWEEKS", title: "weeks", align: "start" },
        { key: "PRDMONTHS", title: "months", align: "start" },
        { key: "PERIODIC", title: "Periodic", align: "start" },
      ];
      const fileds_del = ["PLAN_ID", "PLAN_PARA", "SCHEDULE_ID", "SCHEDULE_INFO"];

      const copyFileld = (o, src, fld) => {
        if (o[src]) o[fld] = o[src][fld];
      };

      // console.log("table:", table);
      // console.log("fields:", fields);

      table.forEach((row) => {
        fileds_param.forEach((fld) => copyFileld(row, "PLAN_PARA", fld.key));
        fileds_info.forEach((fld) => {
          copyFileld(row, "SCHEDULE_INFO", fld.key);
          if (row[fld.key] == 0) row[fld.key] = "";
        });
        // Дополнительная проверка для поля SDLSTRTDT, т.к. в XML оно может встретиться 2 раза, т.е. будет массивом после parse
        if (Array.isArray(row["SDLSTRTDT"])) row["SDLSTRTDT"] = row["SDLSTRTDT"][0];
        fileds_del.forEach((fld) => delete row[fld]);
      });

      const fields_new = [];
      fields_new.push(...fileds_param);
      fields_new.push({ key: "PLAN_STATUS", title: "Status", align: "start" });
      fields_new.push(...fileds_info);

      // console.log("table_parse:", table);
      // console.log("fields_new:", fields_new);

      content = { table, fields: fields_new };
      this.sendWithCode(content, res);
    } catch (error) {
      console.log("error", error);

      this.sendError(error, res);
    }
  };
}

export default new SapScheduleController();
