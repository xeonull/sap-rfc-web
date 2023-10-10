import { Router } from 'express';
import sapTableController from '../controller/table.controller.js';
import sapPackageController from '../controller/package.controller.js';
import sapSystemController from '../controller/system.controller.js';
import SapScheduleController from '../controller/schedule.controller.js';
import SapDocumentController from '../controller/document.controller.js';

const router = new Router();

router.get('/system_list', sapSystemController.getSystemCodes);

router.get('/table', sapTableController.getTableContent);
router.get('/table_list', sapTableController.getTableList);
router.get('/table_field_list', sapTableController.getFieldList);

router.get('/package', sapPackageController.getPackageStatuses);
router.get('/package_list', sapPackageController.getPackages);

router.get('/plan_status', SapScheduleController.getPlanStatuses);
router.get('/schedule', SapScheduleController.getSchedule);

router.get('/environment', SapDocumentController.getEnvironments);
router.get('/document_type', SapDocumentController.getDocumentTypeList);
router.get('/document', SapDocumentController.getDocuments);

export default router;
