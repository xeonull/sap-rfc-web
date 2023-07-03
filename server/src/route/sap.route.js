import { Router } from "express";
import sapTableController from "../controller/table.controller.js";
import sapPackageController from "../controller/package.controller.js";
import sapSystemController from "../controller/system.controller.js";

const router = new Router();

router.get("/table", sapTableController.getTableContent);
router.get("/table_list", sapTableController.getTableList);
router.get("/table_field_list", sapTableController.getFieldList);
router.get("/package", sapPackageController.getPackageStatuses);
router.get("/package_list", sapPackageController.getPackages);
router.get("/system_list", sapSystemController.getSystemCodes);

export default router;
