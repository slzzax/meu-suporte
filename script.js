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
                list.innerHTML += `<div style="display:flex; align-items:center; gap:5px; margin-bottom:4px;">
                    <span class="dot"></span> ${data.nome}</div>`;
            }
        });
    });
}

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
            const chave = Object.keys(respostasSuporte).find(k => texto.includes(k));
            addMsg(chave ? respostasSuporte[chave] : "Não encontrei uma resposta exata. Tente termos como 'internet', 'impressora' ou o nome do setor.", 'bot');
        }
    }, 500);
}

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('menuOverlay').classList.toggle('active');
}

function autoReply(key) {
    if (window.innerWidth <= 768) toggleMenu();
    addMsg(`Solicitando suporte para: ${key.toUpperCase()}`, 'user');
    setTimeout(() => addMsg(respostasSuporte[key], 'bot'), 600);
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
