// Configuração do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_DOMINIO.firebaseapp.com",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_BUCKET.appspot.com",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let vendas = [];
let gastos = [];
let fiados = [];

// Função para adicionar uma venda ou gasto
async function adicionarRegistro(usuarioId, tipo, descricao, valor) {
    const registro = { descricao, valor, data: new Date() };
    if (tipo === 'venda') {
        await db.collection('usuarios').doc(usuarioId).collection('vendas').add(registro);
        vendas.push(registro);
    } else {
        await db.collection('usuarios').doc(usuarioId).collection('gastos').add(registro);
        gastos.push(registro);
    }
    atualizarRelatorios();
}

// Função para adicionar um fiado
async function adicionarFiado(usuarioId, nome, valor) {
    const fiado = { nome, valor, data: new Date() };
    await db.collection('usuarios').doc(usuarioId).collection('fiados').add(fiado);
    fiados.push(fiado);
    atualizarRelatorios();
}

// Evento para o formulário de registro de vendas e gastos
document.getElementById('form-registro').addEventListener('submit', async function (event) {
    event.preventDefault();
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const tipo = document.getElementById('tipo').value;

    if (!descricao || isNaN(valor) || valor <= 0) {
        alert('Preencha todos os campos corretamente!');
        return;
    }

    const usuarioId = document.getElementById('input-usuario').value.trim(); // Obter ID do usuário
    await adicionarRegistro(usuarioId, tipo, descricao, valor);
    this.reset();
});

// Evento para o formulário de registro de fiados
document.getElementById('form-fiado').addEventListener('submit', async function (event) {
    event.preventDefault();
    const nome = document.getElementById('nome-fiado').value;
    const valor = parseFloat(document.getElementById('valor-fiado').value);

    if (!nome || isNaN(valor) || valor <= 0) {
        alert('Preencha os campos do fiado corretamente!');
        return;
    }

    const usuarioId = document.getElementById('input-usuario').value.trim(); // Obter ID do usuário
    await adicionarFiado(usuarioId, nome, valor);
    this.reset();
});

// Função para atualizar relatórios
function atualizarRelatorios() {
    const totalVendas = vendas.reduce((acc, v) => acc + v.valor, 0);
    const totalGastos = gastos.reduce((acc, g) => acc + g.valor, 0);
    const lucro = totalVendas - totalGastos;

    document.getElementById('relatorio-vendas').innerText = `Total de Vendas: R$ ${totalVendas.toFixed(2)}`;
    document.getElementById('relatorio-gastos').innerText = `Total de Gastos: R$ ${totalGastos.toFixed(2)}`;
    document.getElementById('relatorio-lucro').innerText = `Lucro: R$ ${lucro.toFixed(2)}`;
}

// Função para carregar dados do usuário
async function carregarDados(usuarioId) {
    const vendasRef = db.collection('usuarios').doc(usuarioId).collection('vendas');
    const gastosRef = db.collection('usuarios').doc(usuarioId).collection('gastos');
    const fiadosRef = db.collection('usuarios').doc(usuarioId).collection('fiados');

    const vendasSnapshot = await vendasRef.get();
    vendasSnapshot.forEach(doc => {
        vendas.push({ ...doc.data(), id: doc.id });
    });

    const gastosSnapshot = await gastosRef.get();
    gastosSnapshot.forEach(doc => {
        gastos.push({ ...doc.data(), id: doc.id });
    });

    const fiadosSnapshot = await fiadosRef.get();
    fiadosSnapshot.forEach(doc => {
        fiados.push({ ...doc.data(), id: doc.id });
    });

    atualizarRelatorios();
}
