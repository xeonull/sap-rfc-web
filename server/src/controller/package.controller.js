import { SapBaseController } from "./base.controller.js";

class SapPackageController extends SapBaseController {
  /* Get table with all packages in system*/
  getPackages = async (req, res) => {
    try {
      let host = req.query.host;
      let delimeter = req.query.delimeter;
      let max_rows = req.query.max_rows;
      const content = await this.getTableData(
        host,
        "UJD_PACKAGES2",
        ["APPSET_ID", "APP_ID", "PACKAGE_ID", "GROUP_ID", "TEAM_ID"],
        ["PACKAGE_ID NE ''"],
        delimeter,
        max_rows
      );
      this.sendWithCode(content, res);
    } catch (error) {
      this.sendWithCode(error, res);
    }
  };
  /* Get table with package statuses*/
  getPackageStatuses = async (req, res) => {
    try {
      let host = req.query.host;
      let packageName = req.query.package;
      let appset = req.query.appset;
      let appl = req.query.appl;
      let delimeter = req.query.delimeter;
      let max_rows = req.query.max_rows;
      const content = await this.getTableData(
        host,
        "UJD_STATUS",
        ["PACKAGE_ID", "USER_ID", "STATUS", "TIMESTAMP", "TIMESTAMP_END"],
        ["PACKAGE_ID EQ '" + packageName + "' ", "AND APPLICATION_ID EQ '" + appl + "'", "AND APPSET_ID EQ '" + appset + "'"],
        delimeter,
        max_rows
      );
      this.sendWithCode(content, res);
    } catch (error) {
      this.sendWithCode(error, res);
    }
  };
}

export default new SapPackageController();
