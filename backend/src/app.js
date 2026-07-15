const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/empresas', require('./routes/empresas.routes'));
app.use('/api/produtos', require('./routes/produtos.routes'));
app.use('/api/campanhas', require('./routes/campanhas.routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
