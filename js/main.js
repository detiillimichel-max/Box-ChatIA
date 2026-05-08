document.addEventListener('DOMContentLoaded', () => {
    // 1. Mapeamento dos elementos da Arquitetura Orbital
    const btnConfig = document.getElementById('btn-config');
    const configModal = document.getElementById('config-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveKeyBtn = document.getElementById('save-key-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const outputArea = document.getElementById('output-area');

    // 2. Inicialização Segura: Verifica a memória do telemóvel
    const chaveGuardada = localStorage.getItem('gemini_api_key');
    if (chaveGuardada) {
        // Se a chave já existe no cofre local, não precisamos exibi-la por segurança, 
        // mas sabemos que o motor está pronto para operar.
        apiKeyInput.placeholder = "Chave já configurada com segurança.";
    }

    // 3. Controle do Cofre (Abrir e Fechar)
    btnConfig.addEventListener('click', () => {
        configModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        configModal.classList.add('hidden');
    });

    // 4. Mecanismo de Salvamento Local (Isolado do GitHub)
    saveKeyBtn.addEventListener('click', () => {
        const chave = apiKeyInput.value.trim();
        
        if (chave) {
            localStorage.setItem('gemini_api_key', chave);
            apiKeyInput.value = ''; // Limpa o campo visualmente
            apiKeyInput.placeholder = "Chave guardada com sucesso.";
            
            // Feedback reflexivo no painel principal
            outputArea.innerHTML = `
                <div class="mensagem-sistema">
                    <p>A sabedoria foi ativada. O motor de inteligência está agora conectado de forma segura ao seu dispositivo.</p>
                </div>
            `;
            
            setTimeout(() => {
                configModal.classList.add('hidden');
            }, 1500);
            
        } else {
            apiKeyInput.placeholder = "Atenção: A chave não pode estar vazia.";
        }
    });

    // 5. Preparação da Navegação Orbital (Botão Azul do Google)
    sendBtn.addEventListener('click', () => {
        const textoUsuario = userInput.value.trim();
        if (textoUsuario) {
            // Em breve, esta função chamará o serviço da IA
            userInput.value = ''; 
        }
    });
});
