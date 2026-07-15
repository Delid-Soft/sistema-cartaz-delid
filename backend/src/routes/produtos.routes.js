const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { listar, criar, remover } = require('../controllers/produtos.controller');

router.use(autenticar);
router.get('/', listar);
router.post('/', upload.single('foto'), criar);
router.delete('/:id', remover);

module.exports = router;
