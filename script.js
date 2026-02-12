// CONFIGURAÇÃO FIREBASE (Atualizado com as chaves da sua imagem)
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
        alert("Digite um usuário e uma senha de no mínimo 6 dígitos.");
        return;
    }

    auth.signInWithEmailAndPassword(email, pass).catch(error => {
        if (error.code === 'auth/user-not-found') {
            return auth.createUserWithEmailAndPassword(email, pass);
        } else {
            alert("Erro: " + error.message);
        }
    });
}

// STATUS ONLINE E INTERFACE
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
        listDiv.innerHTML = "";
        snapshot.forEach(child => {
            const data = child.val();
            const cor = data.state === 'online' ? '#4ade80' : '#64748b';
            listDiv.innerHTML += `
                <div style="margin-bottom: 5px; display: flex; align-items: center; gap: 8px;">
                    <span style="height: 8px; width: 8px; background: ${cor}; border-radius: 50%;"></span>
                    <span>${data.nome}</span>
                </div>`;
        });
    });
}

function logout() {
    const user = auth.currentUser;
    if (user) db.ref('status/' + user.uid).set({ nome: user.email.split('@')[0], state: 'offline' });
    auth.signOut();
}

// --- DADOS E LÓGICA MANTIDOS DO SEU ORIGINAL ---
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

const respostasIA = [
    { keys: ["ip"], resp: "<b>🌐 VERIFICAÇÃO DE IP:</b><br>1. Vá na impressora: Ajustes > Rede > Exibir IPv4.<br>2. No PC: Tente dar ping no IP.<br>3. Verifique o cabo ou porta no Switch." },
    { keys: ["toner"], resp: "<b>🔋 PROTOCOLO TONER:</b><br>1. Pegue a chave no ADM.<br>2. Pegue o novo no almoxarifado.<br>3. Remova as travas e coloque o velho na caixa." },
    { keys: ["scanner"], resp: "<b>📂 PROTOCOLO SCANNER:</b><br>1. Verifique o compartilhamento da pasta.<br>2. Confira usuário/senha SMB na página da impressora." }
];

const respostasSuporte = {
    impressora: "<b>🖨️ SUPORTE IMPRESSORA:</b><br>Deseja verificar <b>IP</b>, <b>TONER</b> ou <b>SCANNER</b>?<br><i>Digite para continuar.</i>",
    internet: "<b>🌐 REDE:</b> Reinicie o Access Point ou use ipconfig /renew.",
    projetor: "<b>📽️ PROJETOR:</b> Win+P e verifique o HDMI.",
    tablet: "<b>📱 TABLET:</b> Segure Power + Volume Down para reiniciar.",
    som: "<b>🔊 ÁUDIO:</b> Verifique cabos P2 e energia.",
    google: "<b>📧 GOOGLE:</b> Reset de senha via painel Admin."
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
        
        const buscaIA = respostasIA.find(item => item.keys.every(k => texto.includes(k)));
        const buscaRamal = listaRamais.filter(r => r.ramal.includes(texto) || r.setor.toLowerCase().includes(texto));

        setTimeout(() => {
            if (buscaIA) { addMsg(buscaIA.resp, "bot"); } 
            else if (buscaRamal.length > 0) {
                let res = "<b>🔎 Ramais:</b><br>";
                buscaRamal.forEach(r => res += `${r.setor}: <b>${r.ramal}</b><br>`);
                addMsg(res, "bot");
            } else {
                const chave = Object.keys(respostasSuporte).find(k => texto.includes(k));
                addMsg(chave ? respostasSuporte[chave] : "Não entendi. Escolha uma opção acima.", 'bot');
            }
        }, 500);
    }
}

function toggleMenu() {
    const sidebar = document.querySelector('.sidebar');
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.onclick = toggleMenu;
        document.body.appendChild(overlay);
    }
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function autoReply(key) {
    if (window.innerWidth <= 768) toggleMenu();
    addMsg(`Protocolo ${key.toUpperCase()} solicitado.`, 'user');
    setTimeout(() => addMsg(respostasSuporte[key], 'bot'), 500);
}

function mostrarRamais() {
    if (window.innerWidth <= 768) toggleMenu();
    addMsg("Solicitando ramais...", "user");
    setTimeout(() => {
        let lista = "<b>📞 Ramais Principais:</b><br>";
        listaRamais.forEach(r => lista += `${r.setor}: <b>${r.ramal}</b><br>`);
        addMsg(lista, "bot");
    }, 500);
}

document.getElementById("userInput").addEventListener("keyup", (e) => { if (e.key === "Enter") sendMessage(); });