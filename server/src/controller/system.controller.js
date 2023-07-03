import * as fs from "fs";
import { join } from "path";

class SapSystemController {
  getSystemCodes = (req, res) => {
    try {
      const sys_list = [];
      const filePath = join(process.cwd(), "sapnwrfc.ini");
      const data = fs.readFileSync(filePath, { encoding: "utf-8" });
      const lines = data.split("\n");
      lines.forEach((line) => {
        if (line.startsWith("DEST=")) {
          sys_list.push(line.slice(5).trim());
        }
      });

      res.send(JSON.stringify(sys_list));
    } catch (error) {
      res.status(418).send('No available systems');
    }
  };
}

export default new SapSystemController();
