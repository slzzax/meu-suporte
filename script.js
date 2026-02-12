// CONFIGURAÇÃO FIREBASE REAL (Dados da sua imagem)
const firebaseConfig = {
    apiKey: "AIzaSyDh_PUYhiH59KiW--1c0lLpddGxwgjJGT8",
    authDomain: "suportedosuporte-37ddc.firebaseapp.com",
    databaseURL: "https://suportedosuporte-37ddc-default-rtdb.firebaseio.com",
    projectId: "suportedosuporte-37ddc",
    storageBucket: "suportedosuporte-37ddc.firebasestorage.app",
    messagingSenderId: "491968501139",
    appId: "1:491968501139:web:da63c20e1651fad1f30466"
};

// Inicialização
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// LOGIN E REGISTRO AUTOMÁTICO
function handleLogin() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    const email = user + "@suporte.com";

    if (user === "" || pass.length < 6) {
        alert("A senha precisa ter no mínimo 6 dígitos (Ex: 123456).");
        return;
    }

    // Tenta logar. Se não existir, ele cria a conta na hora.
    auth.signInWithEmailAndPassword(email, pass).catch(error => {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-login-credentials') {
            return auth.createUserWithEmailAndPassword(email, pass);
        } else {
            alert("Erro: " + error.message);
        }
    });
}

// STATUS ONLINE E PAINEL (MANTENDO SUA LÓGICA)
auth.onAuthStateChanged(user => {
    if (user) {
        const nome = user.email.split('@')[0];
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        document.getElementById('display-name').innerText = nome;
        if(document.getElementById('mobile-user-name')) document.getElementById('mobile-user-name').innerText = nome;
        
        const myStatusRef = db.ref('status/' + user.uid);
        myStatusRef.set({ nome: nome, state: 'online' });
        myStatusRef.onDisconnect().set({ nome: nome, state: 'offline' });

        addMsg(`Conectado como <b>${nome}</b>.`, 'bot');
        carregarUsuariosOnline();
    } else {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }
});

function carregarUsuariosOnline() {
    db.ref('status').on('value', snapshot => {
        const listDiv = document.getElementById('users-list');
        if(listDiv) {
            listDiv.innerHTML = "";
            snapshot.forEach(child => {
                const data = child.val();
                const cor = data.state === 'online' ? '#4ade80' : '#64748b';
                listDiv.innerHTML += `
                    <div style="margin-bottom: 5px; display: flex; align-items: center; gap: 8px; color: white; font-size: 13px;">
                        <span style="height: 8px; width: 8px; background: ${cor}; border-radius: 50%;"></span>
                        <span>${data.nome}</span>
                    </div>`;
            });
        }
    });
}

function logout() {
    const user = auth.currentUser;
    if (user) db.ref('status/' + user.uid).set({ nome: user.email.split('@')[0], state: 'offline' });
    auth.signOut();
}

// --- SEUS DADOS ORIGINAIS (MANTIDOS) ---
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

const respostasSuporte = {
    impressora: "<b>🖨️ SUPORTE IMPRESSORA:</b> Verifique o IP ou Toner.",
    internet: "<b>🌐 REDE:</b> Reinicie o roteador ou AP.",
    projetor: "<b>📽️ PROJETOR:</b> Verifique o cabo HDMI.",
    tablet: "<b>📱 TABLET:</b> Segure Power + Volume Down.",
    som: "<b>🔊 ÁUDIO:</b> Verifique os cabos P2.",
    google: "<b>📧 GOOGLE:</b> Reset via painel Admin."
};

const chatWin = document.getElementById('chatWindow');
function addMsg(content, type) {
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerHTML = content;
    chatWin.appendChild(div);
    chatWin.scrollTop = chatWin.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('userInput');
    const texto = input.value.toLowerCase().trim();
    if(texto) {
        addMsg(input.value, 'user');
        input.value = "";
        const buscaRamal = listaRamais.filter(r => r.ramal.includes(texto) || r.setor.toLowerCase().includes(texto));
        setTimeout(() => {
            if (buscaRamal.length > 0) {
                let res = "<b>🔎 Ramais:</b><br>";
                buscaRamal.forEach(r => res += `${r.setor}: <b>${r.ramal}</b><br>`);
                addMsg(res, "bot");
            } else {
                const chave = Object.keys(respostasSuporte).find(k => texto.includes(k));
                addMsg(chave ? respostasSuporte[chave] : "Não entendi.", 'bot');
            }
        }, 500);
    }
}

function toggleMenu() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

function autoReply(key) {
    addMsg(`Protocolo ${key.toUpperCase()} solicitado.`, 'user');
    setTimeout(() => addMsg(respostasSuporte[key], 'bot'), 500);
}

function mostrarRamais() {
    let lista = "<b>📞 Ramais:</b><br>";
    listaRamais.forEach(r => lista += `${r.setor}: <b>${r.ramal}</b><br>`);
    addMsg(lista, "bot");
}

document.getElementById("userInput").addEventListener("keyup", (e) => { if (e.key === "Enter") sendMessage(); });
