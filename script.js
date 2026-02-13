// CONFIGURAÇÃO FIREBASE REAL
const firebaseConfig = {
    apiKey: "AIzaSyDh_PUYhiH59KiW--1c0lLpddGxwgjJGT8",
    authDomain: "suportedosuporte-37ddc.firebaseapp.com",
    databaseURL: "https://suportedosuporte-37ddc-default-rtdb.firebaseio.com",
    projectId: "suportedosuporte-37ddc",
    storageBucket: "suportedosuporte-37ddc.firebasestorage.app",
    messagingSenderId: "491968501139",
    appId: "1:491968501139:web:da63c20e1651fad1f30466"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// --- LÓGICA DE LOGIN ---
function handleLogin() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    if (!user || pass.length < 6) return alert("Preencha o usuário e senha (mín. 6 dígitos)");
    
    const email = user + "@suporte.com";
    auth.signInWithEmailAndPassword(email, pass).catch(() => {
        return auth.createUserWithEmailAndPassword(email, pass);
    });
}

auth.onAuthStateChanged(user => {
    if (user) {
        const nome = user.email.split('@')[0];
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        document.getElementById('display-name').innerText = nome;
        document.getElementById('mobile-user-name').innerText = nome;
        
        db.ref('status/' + user.uid).set({ nome: nome, state: 'online' });
        db.ref('status/' + user.uid).onDisconnect().set({ nome: nome, state: 'offline' });
        carregarUsuariosOnline();
        addMsg(`Olá <b>${nome}</b>, como posso ajudar hoje?`, 'bot');
    } else {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }
});

function carregarUsuariosOnline() {
    db.ref('status').on('value', snapshot => {
        const list = document.getElementById('users-list');
        list.innerHTML = "";
        snapshot.forEach(child => {
            const data = child.val();
            if (data.state === 'online') {
                list.innerHTML += `<div style="display:flex; align-items:center; gap:5px; margin-bottom:4px; color:white; font-size:13px;">
                    <span class="dot" style="background:#4ade80; height:8px; width:8px; border-radius:50%; display:inline-block;"></span> ${data.nome}</div>`;
            }
        });
    });
}

// --- BANCO DE DADOS DE RESPOSTAS E RAMAIS ---
const listaRamais = [
    { ramal: "1046", setor: "Diretoria" }, { ramal: "1026", setor: "RecreioCoordPedagInfant" },
    { ramal: "1020", setor: "TaquaraComercial1" }, { ramal: "1021", setor: "RecreioComercial1" },
    { ramal: "1022", setor: "RecreioPedago" }, { ramal: "1023", setor: "MeierRecep1" },
    { ramal: "1024", setor: "TaquaraRecep1" }, { ramal: "1025", setor: "TaquaraRecep2" },
    { ramal: "1027", setor: "TaquaraTI" }, { ramal: "1028", setor: "TaquaraSecretaria" },
    { ramal: "1029", setor: "TaquaraDeparPessoal" }, { ramal: "1030", setor: "MeierRecep2" },
    { ramal: "1031", setor: "MeierDaltrinho" }, { ramal: "1032", setor: "TaquaraPortaria" },
    { ramal: "1033", setor: "TaquaraCoordAdm" }, { ramal: "1034", setor: "FINANCEIRO" },
    { ramal: "1048", setor: "TIMeier" }, { ramal: "1058", setor: "RH" }
];

// Novos fluxos com múltiplas opções
const fluxosSuporte = {
    impressora: {
        pergunta: "O que está acontecendo com a 🖨️ Impressora?",
        opcoes: [
            { texto: "Instalar via IP", resposta: "<b>IP:</b> Vá em Dispositivos > Adicionar Impressora > IP TCP/IP > Digite o IP da máquina." },
            { texto: "Atolamento", resposta: "<b>Papel:</b> Remova o toner, limpe os roletes e verifique a bandeja traseira." },
            { texto: "Toner", resposta: "<b>Toner:</b> Se estiver fraco, balance o cartucho. Se houver manchas, verifique o cilindro." }
        ]
    },
    internet: {
        pergunta: "Qual o problema na 🌐 Rede?",
        opcoes: [
            { texto: "Sem Wi-Fi", resposta: "Verifique se o roteador/AP está ligado e se o cabo de rede está firme na porta POE." },
            { texto: "Cabo de Rede", resposta: "Teste o cabo com um testador ou troque o patch cord do computador." },
            { texto: "Lentidão", resposta: "Verifique se há downloads pesados ou se o switch do setor precisa ser reiniciado." }
        ]
    },
    projetor: {
        pergunta: "Problema no 📽️ Projetor?",
        opcoes: [
            { texto: "Sem Sinal", resposta: "Aperte 'Win+P' no PC e escolha 'Duplicar'. Verifique se o cabo HDMI está bem encaixado." },
            { texto: "Imagem Ruim", resposta: "Ajuste o foco na lente ou verifique se o cabo VGA/HDMI não está com pinos tortos." }
        ]
    }
    // Você pode adicionar mais seguindo o padrão acima
};

// --- FUNÇÕES DO CHAT ---
function addMsg(content, type) {
    const win = document.getElementById('chatWindow');
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerHTML = content;
    win.appendChild(div);
    win.scrollTop = win.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('userInput');
    const texto = input.value.toLowerCase().trim();
    if (!texto) return;

    addMsg(input.value, 'user');
    input.value = "";

    setTimeout(() => {
        const buscaRamal = listaRamais.filter(r => r.ramal.includes(texto) || r.setor.toLowerCase().includes(texto));
        if (buscaRamal.length > 0) {
            let res = "<b>🔎 Ramais encontrados:</b><br>";
            buscaRamal.forEach(r => res += `${r.setor}: <b>${r.ramal}</b><br>`);
            addMsg(res, "bot");
        } else {
            // Verifica se a palavra digitada bate com algum protocolo
            const chave = Object.keys(fluxosSuporte).find(k => texto.includes(k));
            if (chave) {
                autoReply(chave);
            } else {
                addMsg("Não encontrei uma resposta exata. Tente termos como 'internet', 'impressora' ou o nome do setor.", 'bot');
            }
        }
    }, 500);
}

function autoReply(key) {
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
        document.getElementById('menuOverlay').classList.remove('active');
    }

    const fluxo = fluxosSuporte[key];
    if (fluxo) {
        addMsg(`Protocolo de ${key.toUpperCase()} iniciado.`, 'user');
        setTimeout(() => {
            addMsg(fluxo.pergunta, 'bot');
            
            // Criar botões de opções no chat
            const win = document.getElementById('chatWindow');
            const container = document.createElement('div');
            container.className = 'options-container';

            fluxo.opcoes.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'opt-btn';
                btn.innerText = opt.texto;
                btn.onclick = () => {
                    addMsg(opt.texto, 'user');
                    container.remove(); // Remove os botões após clicar
                    setTimeout(() => addMsg(opt.resposta, 'bot'), 500);
                };
                container.appendChild(btn);
            });
            win.appendChild(container);
            win.scrollTop = win.scrollHeight;
        }, 600);
    }
}

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('menuOverlay').classList.toggle('active');
}

function mostrarRamais() {
    if (window.innerWidth <= 768) toggleMenu();
    let lista = "<b>📞 Lista Completa de Ramais:</b><br>";
    listaRamais.forEach(r => lista += `${r.setor}: <b>${r.ramal}</b><br>`);
    addMsg(lista, "bot");
}

function logout() {
    auth.signOut();
}

document.getElementById("userInput").addEventListener("keyup", (e) => { if (e.key === "Enter") sendMessage(); });
