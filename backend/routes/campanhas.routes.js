
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/campanhas.controller');
const { autenticar } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(autenticar);
router.get('/', ctrl.listar);
router.post('/', upload.fields([{ name: 'fundo', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), ctrl.criar);
router.delete('/:id', ctrl.remover);

module.exports = router;
