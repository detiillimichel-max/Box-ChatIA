// Importando o cérebro da pasta de serviços
import { consultarInteligencia } from '../services/agente.js';

document.addEventListener('DOMContentLoaded', () => {
    const btnConfig = document.getElementById('btn-config');
    const configModal = document.getElementById('config-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveKeyBtn = document.getElementById('save-key-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const elevenLabsKeyInput = document.getElementById('elevenlabs-key-input');
    
    const addBtn = document.getElementById('add-btn');
    const tuneBtn = document.getElementById('tune-btn');
    const micBtn = document.getElementById('mic-btn');
    const sendBtn = document.getElementById('send-btn');
    
    const userInput = document.getElementById('user-input');
    const outputArea = document.getElementById('output-area');

    const geminiKey = localStorage.getItem('gemini_api_key');
    const elevenKey = localStorage.getItem('elevenlabs_api_key');
    
    if (geminiKey) apiKeyInput.placeholder = "Chave do Cérebro (Gemini) OK.";
    if (elevenKey) elevenLabsKeyInput.placeholder = "Chave da Voz (ElevenLabs) OK.";

    btnConfig.addEventListener('click', () => configModal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => configModal.classList.add('hidden'));

    saveKeyBtn.addEventListener('click', () => {
        const inputGemini = apiKeyInput.value.trim();
        const inputEleven = elevenLabsKeyInput.value.trim();
        
        if (inputGemini) localStorage.setItem('gemini_api_key', inputGemini);
        if (inputEleven) localStorage.setItem('elevenlabs_api_key', inputEleven);
        
        apiKeyInput.value = '';
        elevenLabsKeyInput.value = '';
        
        if(inputGemini || inputEleven) {
            outputArea.innerHTML += `<div class="mensagem-sistema"><p>Identidade azul confirmada. Chaves salvas no cofre.</p></div>`;
            setTimeout(() => configModal.classList.add('hidden'), 1500);
        }
    });

    addBtn.addEventListener('click', () => {
        outputArea.innerHTML += `<div class="mensagem-sistema"><p>Módulo de ferramentas (+) ativado.</p></div>`;
        rolarChat();
    });

    tuneBtn.addEventListener('click', () => {
        outputArea.innerHTML += `<div class="mensagem-sistema"><p>Ajustes de sabedoria ativados.</p></div>`;
        rolarChat();
    });

    micBtn.addEventListener('click', () => {
        micBtn.classList.toggle('gravando');
        userInput.placeholder = micBtn.classList.contains('gravando') ? "A escutar..." : "Explore a sabedoria...";
    });

    // Evento atualizado para conectar com o agente.js com segurança
    sendBtn.addEventListener('click', async () => {
        const texto = userInput.value.trim();
        if (texto) {
            // Imprime a pergunta do usuário na tela
            outputArea.innerHTML += `<div class="mensagem-sistema"><p style="color: var(--google-blue); font-weight: 600;">Você: ${texto}</p></div>`;
            userInput.value = ''; 
            rolarChat();

            // Adiciona status de reflexão
            const statusDiv = document.createElement('div');
            statusDiv.className = 'mensagem-sistema';
            statusDiv.innerHTML = '<p>Refletindo...</p>';
            outputArea.appendChild(statusDiv);
            rolarChat();

            try {
                // Chama a inteligência do agente.js
                const resposta = await consultarInteligencia(texto);
                
                // Remove o aviso de "Refletindo..." e coloca a resposta real
                outputArea.removeChild(statusDiv);
                outputArea.innerHTML += `<div class="mensagem-sistema"><p style="color: var(--text-primary); text-align: left;">${resposta.replace(/\n/g, '<br>')}</p></div>`;
            } catch (erro) {
                outputArea.removeChild(statusDiv);
                outputArea.innerHTML += `<div class="mensagem-sistema"><p style="color: #e53e3e;">Atenção: Configure a chave do motor na engrenagem superior antes de prosseguir.</p></div>`;
            }
            rolarChat();
        }
    });

    // Permite enviar apertando a tecla Enter
    userInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            sendBtn.click();
        }
    });

    function rolarChat() {
        const chat = document.getElementById('chat-display');
        chat.scrollTop = chat.scrollHeight;
    }
});
