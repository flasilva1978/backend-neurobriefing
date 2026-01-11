const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs'); // MÓDULO NOVO: File System (Para ler e escrever arquivos)

const app = express();
const PORTA = 3000;

app.use(cors());
app.use(bodyParser.json());

// Configura a pasta 'public' para servir o Dashboard e a Logo
app.use(express.static(path.join(__dirname, 'public')));

// --- CONFIGURAÇÃO DO "BANCO DE DADOS" (ARQUIVO) ---
const ARQUIVO_DB = path.join(__dirname, 'banco-dados.json');

// Função auxiliar para LER o arquivo
const lerBancoDeDados = () => {
  try {
    // Se o arquivo não existe ainda, retorna lista vazia
    if (!fs.existsSync(ARQUIVO_DB)) {
      return [];
    }
    // Lê o arquivo e transforma o texto em JSON
    const dadosBrutos = fs.readFileSync(ARQUIVO_DB, 'utf-8');
    return JSON.parse(dadosBrutos);
  } catch (erro) {
    console.error("Erro ao ler banco:", erro);
    return [];
  }
};

// Função auxiliar para SALVAR no arquivo
const salvarNoBancoDeDados = (dados) => {
  // Transforma o JSON em texto bonito (com indentação de 2 espaços)
  const dadosTexto = JSON.stringify(dados, null, 2);
  fs.writeFileSync(ARQUIVO_DB, dadosTexto);
};

// --- ROTAS DA API ---

// 1. Receber e Salvar o Teste (AGORA PERSISTENTE)
app.post('/api/salvar-teste', (req, res) => {
  const novoTeste = req.body;
  
  // Adiciona dados extras
  novoTeste.id = Date.now(); 
  novoTeste.dataLegivel = new Date().toLocaleString();
  
  console.log(`📥 Novo teste recebido de: ${novoTeste.cliente}`);

  // 1. Lê o que já existe
  const listaAtual = lerBancoDeDados();
  
  // 2. Adiciona o novo
  listaAtual.push(novoTeste);
  
  // 3. Salva tudo de volta no arquivo
  salvarNoBancoDeDados(listaAtual);

  res.status(200).json({ mensagem: 'Teste salvo e gravado em disco!' });
});

// 2. Listar testes (LÊ DO ARQUIVO)
app.get('/api/relatorios', (req, res) => {
  const dados = lerBancoDeDados();
  res.json(dados);
});

// --- INICIAR SERVIDOR ---
app.listen(PORTA, () => {
  console.log(`🧠 Servidor rodando na porta ${PORTA}`);
  console.log(`💾 Os dados serão salvos em: ${ARQUIVO_DB}`);
});