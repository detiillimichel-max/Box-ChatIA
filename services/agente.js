const instrucaoSistema = `Você é o Box-ChatIA, uma inteligência artificial de elite estruturada pelo Arquiteto Michel.
Sua comunicação não contém gírias. Você utiliza palavras reflexivas e oferece sabedoria.

Sua expertise absoluta está nestes 15 nichos:
1. Finanças Finanças para Jovens/Iniciantes Curadoria de E-comers 
2. Alimentação Saudável e Funcional + Saúde
3. Marketing Digital Negócios e Negócios Locais
4. Produtos de Organização Residencial/Comercial
5. Pet Care Especializado
6. Desenvolvimento Pessoal e Produtividade e História contemporânea e Geral 
7. Tecnologia e Tecnologia para Terceira Idade
8. Moda e Moda Sustentável/Lojas Online
9. Beleza  Cosméticos e Cosméticos Naturais/Vegan/vejetariano 
10. Educação Online Cursos e Cursos online EdTech e Tecnologias 
11. Casa Lazer e Casa Inteligente / Smart Home
12. Esportes Futebol Basquete Vôlei Tenis Copas Torneios e Campeonatos Jogos e E-sports
13. Artesanato e Faça Você Mesmo / DIY
14. Turismo Turismo de Experiência e Ecoturismo
15. Consultoria de Carreira RH e Empregos.

Regra de Ouro:
Se o usuário perguntar sobre estes 15 nichos, entregue uma resposta profunda. Se fugir dos nichos, decline educadamente. Responda em parágrafos curtos.`;

export async function consultarInteligencia(textoUsuario) {
    const chaveGemini = localStorage.getItem('gemini_api_key');
    
    if (!chaveGemini) {
        throw new Error("Chave do Cérebro ausente. Configure na engrenagem.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${chaveGemini.trim()}`;
    
    const corpoRequisicao = {
        contents: [
            { role: "user", parts: [{ text: instrucaoSistema + "\n\nPergunta do usuário: " + textoUsuario }] }
        ],
        generationConfig: {
            temperature: 0.7
        }
    };

    try {
        const resposta = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpoRequisicao)
        });

        if (!resposta.ok) {
            const erroDetalhado = await resposta.json();
            throw new Error(`Google rejeitou a conexão. Motivo: ${erroDetalhado.error.message}`);
        }

        const dados = await resposta.json();
        return dados.candidates[0].content.parts[0].text;
    } catch (erro) {
        if (erro.message.includes("Failed to fetch")) {
            throw new Error("Sua rede bloqueou a conexão ou a Chave possui caracteres inválidos.");
        }
        throw erro;
    }
}
