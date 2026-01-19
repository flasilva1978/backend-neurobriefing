const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Módulo do Banco de Dados
const path = require('path');
const bodyParser = require('body-parser'); // Importante para dados grandes

const app = express();

// Aumenta o limite para aceitar fotos/dados grandes (10mb)
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Configura a pasta 'public' para servir o Dashboard e a Logo
app.use(express.static(path.join(__dirname, 'public')));

// --- 1. CONEXÃO COM O MONGODB ---
const MONGO_URI = "mongodb+srv://admin:Igds1978@cluster0.xcjgegm.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Conectado ao MongoDB com sucesso!"))
    .catch(err => console.error("❌ Erro ao conectar no Mongo:", err));

// --- 2. DEFINIÇÃO DOS DADOS (SCHEMA) ---
const RelatorioSchema = new mongoose.Schema({
    cliente: String,
    contato: Object, 
    respostas: Object,
    data: { type: Date, default: Date.now },
    duracao: Number, 
    dataLegivel: String
});

const Relatorio = mongoose.model('Relatorio', RelatorioSchema);

// --- 3. ROTAS DA API ---

// ROTA DE SALVAR (CORRIGIDA PARA ACEITAR OS DOIS NOMES)
// Aceita tanto /api/relatorios quanto /api/salvar-teste ou /salvar-teste
app.post(['/api/relatorios', '/api/salvar-teste', '/salvar-teste'], async (req, res) => {
    try {
        const dados = req.body;
        console.log(`Recebendo dados de: ${dados.cliente}`);
        
        const novoRelatorio = new Relatorio({
            ...dados,
            data: new Date(),
            dataLegivel: new Date().toLocaleString('pt-BR')
        });

        await novoRelatorio.save(); // Salva de verdade na nuvem
        
        console.log(`💾 Salvo no MongoDB: ${dados.cliente}`);
        res.json({ success: true, message: 'Salvo no MongoDB!' });

    } catch (error) {
        console.error("Erro ao salvar:", error);
        res.status(500).json({ error: 'Erro ao salvar no banco.' });
    }
});

// Rota de Listar (Para o Dashboard)
app.get('/api/relatorios', async (req, res) => {
    try {
        const todos = await Relatorio.find().sort({ data: -1 }); 
        res.json(todos);
    } catch (error) {
        console.error("Erro ao buscar:", error);
        res.status(500).json({ error: 'Erro ao buscar dados.' });
    }
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});