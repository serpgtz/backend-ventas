const express = require('express');
const upload = require('../middlewares/upload.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const prospectController = require('../controllers/prospect.controller');
const {
  listProspectsSchema,
  idParamSchema,
  searchProspectsSchema,
  createProspectSchema,
  updateProspectSchema,
  filePathQuerySchema,
} = require('../validators/prospect.validator');

const router = express.Router();

const uploadFields = upload.fields([
  { name: 'comprobante', maxCount: 1 },
  { name: 'identificacion', maxCount: 1 },
]);

router.use(authMiddleware);

router.post('/', uploadFields, validate(createProspectSchema), prospectController.createProspect);
router.get('/', validate(listProspectsSchema, 'query'), prospectController.getAllProspects);
router.get('/search', validate(searchProspectsSchema, 'query'), prospectController.searchProspectsByName);
router.get('/file', validate(filePathQuerySchema, 'query'), prospectController.getProspectFile);
router.get('/:id', validate(idParamSchema, 'params'), prospectController.getProspectById);
router.put('/:id', uploadFields, validate(idParamSchema, 'params'), validate(updateProspectSchema), prospectController.updateProspect);
router.delete('/:id', validate(idParamSchema, 'params'), prospectController.deleteProspect);

module.exports = router;
