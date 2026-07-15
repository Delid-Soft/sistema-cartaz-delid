const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { criar, obter, listar } = require('../controllers/campanhas.controller');

router.use(autenticar);
router.get('/', listar);
router.get('/:id', obter);
router.post('/', upload.fields([{ name: 'fundo', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), criar);

module.exports = router;
