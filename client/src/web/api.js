import axios from 'axios';
import { store } from '@/store/store.js';

class WebApi {
  WEB_SERVER = 'http://localhost:3000';
  DELIMETER = ';';
  SYS_MAX_ROWS = 999999;

  async #getSapData(route, params = { params: {} }) {
    try {
      params.params.delimeter = params.params.delimeter ?? this.DELIMETER;
      params.params.max_rows = params.params.max_rows ?? store.tableMaxRows;

      // console.log("params:", params);
      const response = await axios.get(`${this.WEB_SERVER}${route}`, params);
      // console.log("data:", response);
      return response.data;
    } catch (e) {
      if (e.response) {
        if (e.response.data?.name === 'ABAPError') {
          const message = e.response.data?.message
            ? e.response.data?.message
            : `${e.response.data?.abapMsgV1}${e.response.data?.abapMsgV2}${e.response.data?.abapMsgV3}${e.response.data?.abapMsgV4}`;
          throw new Error(`${e.response.data?.codeString}: "${message}" ${e.response.data?.key}`);
        } else throw new Error(`${e.response.data?.codeString}: "${e.response.data?.message}`);
      } else throw new Error(e.message);
    }
  }

  getDocument = async function (host, appset, doc_types) {
    return await this.#getSapData(`/api/document`, { params: { host, appset, doc_types } });
  };

  getDocumentTypes = async function (host) {
    return await this.#getSapData(`/api/document_type`, { params: { host } });
  };

  getEnvironment = async function (host) {
    return await this.#getSapData(`/api/environment`, { params: { host, max_rows: this.SYS_MAX_ROWS } });
  };

  getPlanStatusList = async function (host) {
    return await this.#getSapData(`/api/plan_status`, { params: { host } });
  };

  getSchedule = async function (host, statuses) {
    return await this.#getSapData(`/api/schedule`, { params: { host, statuses } });
  };

  getTable = async function (host, table_name, filter) {
    return await this.#getSapData(`/api/table`, {
      params: { host, tab: table_name, filter },
    });
  };

  getTableList = async function (host) {
    return await this.#getSapData(`/api/table_list`, { params: { host, max_rows: this.SYS_MAX_ROWS } });
  };

  getTableFieldList = async function (host, table_name) {
    return await this.#getSapData(`/api/table_field_list`, {
      params: { host, tab: table_name, max_rows: this.SYS_MAX_ROWS },
    });
  };

  getPackage = async function (host, appset, appl, package_name) {
    return await this.#getSapData(`/api/package`, { params: { host, package: package_name, appset, appl } });
  };

  getPackageList = async function (host) {
    return await this.#getSapData(`/api/package_list`, { params: { host, max_rows: this.SYS_MAX_ROWS } });
  };

  getSystemList = async function () {
    return await this.#getSapData(`/api/system_list`);
  };
}

export default new WebApi();
