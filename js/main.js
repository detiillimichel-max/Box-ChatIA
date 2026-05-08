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
            outputArea.innerHTML += `<div class="mensagem-sistema"><p>Identidade azul confirmada. Chaves salvas.</p></div>`;
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

    sendBtn.addEventListener('click', () => {
        const texto = userInput.value.trim();
        if (texto) {
            outputArea.innerHTML += `<div class="mensagem-sistema"><p>Processando: "${texto}"</p></div>`;
            userInput.value = ''; 
            rolarChat();
        }
    });

    function rolarChat() {
        const chat = document.getElementById('chat-display');
        chat.scrollTop = chat.scrollHeight;
    }
});

