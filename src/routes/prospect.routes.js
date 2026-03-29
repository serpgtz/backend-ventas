const express = require('express');
const upload = require('../middlewares/upload.middleware');
const prospectController = require('../controllers/prospect.controller');

const router = express.Router();

const uploadFields = upload.fields([
  { name: 'comprobante', maxCount: 1 },
  { name: 'identificacion', maxCount: 1 },
]);

router.post('/', uploadFields, prospectController.createProspect);
router.get('/', prospectController.getAllProspects);
router.get('/search', prospectController.searchProspectsByName);
router.get('/file', prospectController.getProspectFile);
router.get('/:id', prospectController.getProspectById);
router.put('/:id', uploadFields, prospectController.updateProspect);
router.delete('/:id', prospectController.deleteProspect);

module.exports = router;
