import { consultarInteligencia } from '../services/agente.js';

document.addEventListener('DOMContentLoaded', () => {
    const btnConfig    = document.getElementById('btn-config');
    const configModal  = document.getElementById('config-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveKeyBtn   = document.getElementById('save-key-btn');
    const apiKeyInput  = document.getElementById('api-key-input');
    const elevenLabsKeyInput = document.getElementById('elevenlabs-key-input');

    const addBtn    = document.getElementById('add-btn');
    const tuneBtn   = document.getElementById('tune-btn');
    const micBtn    = document.getElementById('mic-btn');
    const sendBtn   = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const outputArea = document.getElementById('output-area');

    // Histórico de conversa para o Gemini lembrar o contexto
    let historico = [];

    // Mostra se as chaves já estão salvas
    if (localStorage.getItem('gemini_api_key'))
        apiKeyInput.placeholder = "Chave do Cérebro (Gemini) ✓";
    if (localStorage.getItem('elevenlabs_api_key'))
        elevenLabsKeyInput.placeholder = "Chave da Voz (ElevenLabs) ✓";

    // --- Modal de configuração ---
    btnConfig.addEventListener('click', () => configModal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => configModal.classList.add('hidden'));

    saveKeyBtn.addEventListener('click', () => {
        const inputGemini = apiKeyInput.value.trim();
        const inputEleven = elevenLabsKeyInput.value.trim();

        if (inputGemini) localStorage.setItem('gemini_api_key', inputGemini);
        if (inputEleven) localStorage.setItem('elevenlabs_api_key', inputEleven);

        apiKeyInput.value = '';
        elevenLabsKeyInput.value = '';

        if (inputGemini || inputEleven) {
            adicionarMensagem('sistema', 'Chaves salvas com sucesso. O Cérebro está pronto.');
            setTimeout(() => configModal.classList.add('hidden'), 1500);
        }
    });

    // --- Botões laterais ---
    addBtn.addEventListener('click', () => {
        adicionarMensagem('sistema', 'Módulo de ferramentas (+) em desenvolvimento.');
    });

    tuneBtn.addEventListener('click', () => {
        // Limpa o histórico e reinicia a conversa
        historico = [];
        outputArea.innerHTML = '';
        adicionarMensagem('sistema', 'Conversa reiniciada. Memória limpa. Pronto para nova sessão.');
    });

    micBtn.addEventListener('click', () => {
        micBtn.classList.toggle('gravando');
        userInput.placeholder = micBtn.classList.contains('gravando')
            ? "A escutar..."
            : "Explore a sabedoria...";
    });

    // --- Envio de mensagem ---
    async function enviarMensagem() {
        const texto = userInput.value.trim();
        if (!texto) return;

        adicionarMensagem('usuario', texto);
        userInput.value = '';

        const statusDiv = adicionarMensagem('sistema', 'Refletindo...');

        try {
            const resposta = await consultarInteligencia(texto, historico);

            // Adiciona ao histórico para manter contexto
            historico.push({ role: "user",  parts: [{ text: texto }] });
            historico.push({ role: "model", parts: [{ text: resposta }] });

            // Mantém histórico enxuto (últimas 10 trocas = 20 entradas)
            if (historico.length > 20) historico = historico.slice(-20);

            statusDiv.remove();
            adicionarMensagem('ia', resposta);

        } catch (erro) {
            statusDiv.remove();
            adicionarMensagem('erro', `Erro: ${erro.message}`);
        }
    }

    sendBtn.addEventListener('click', enviarMensagem);
    userInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') enviarMensagem();
    });

    // --- Função auxiliar para criar mensagens ---
    function adicionarMensagem(tipo, texto) {
        const div = document.createElement('div');
        div.className = 'mensagem-sistema';

        const estilos = {
            usuario: 'color: var(--google-blue); font-weight: 600; text-align: right;',
            ia:      'color: var(--text-primary); text-align: left;',
            sistema: 'color: var(--text-secondary); text-align: center; font-style: italic;',
            erro:    'color: #e53e3e; text-align: center;'
        };

        const prefixos = {
            usuario: 'Você: ',
            ia:      'Box-IA: ',
            sistema: '',
            erro:    '⚠ '
        };

        div.innerHTML = `<p style="${estilos[tipo] || ''}">${(prefixos[tipo] || '') + texto.replace(/\n/g, '<br>')}</p>`;
        outputArea.appendChild(div);
        rolarChat();
        return div;
    }

    function rolarChat() {
        document.getElementById('chat-display').scrollTop = 99999;
    }
});
