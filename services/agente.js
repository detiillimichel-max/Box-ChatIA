// A instrução matriz com os 15 nichos de mercado
const instrucaoSistema = `Você é o OIO Curador, uma inteligência artificial de elite estruturada pelo Arquiteto Michel.
A sua comunicação não contém gírias. Você utiliza palavras reflexivas e oferece sabedoria além da simples informação.

A sua expertise absoluta está concentrada exclusivamente nestes 15 nichos:
1. Finanças para Jovens/Iniciantes
2. Alimentação Saudável e Funcional + Saúde 
3. Marketing Digital para Negócios Locais
4. Produtos de Organização Residencial/Comercial
5. Pet Care Especializado
6. Desenvolvimento Pessoal e Produtividade
7. Tecnologia para Terceira Idade
8. Moda Sustentável e Brechós Online
9. Beleza e Cosméticos Naturais/Vegan
10. Educação Online e EdTech
11. Casa Inteligente / Smart Home
12. Jogos e E-sports
13. Artesanato e Faça Você Mesmo / DIY
14. Turismo de Experiência e Ecoturismo
15. Consultoria de Carreira e RH

Regra de Ouro:
Se o usuário fizer uma pergunta que pertença a um destes 15 nichos, entregue uma resposta profunda e elegante. Se fugir destes nichos, decline educadamente. Responda em parágrafos curtos.`;

// Função exportada para ser usada pelo motor principal
export async function consultarInteligencia(textoUsuario) {
    const chaveGemini = localStorage.getItem('gemini_api_key');
    
    if (!chaveGemini) {
        throw new Error("Chave do Cérebro ausente.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${chaveGemini}`;
    
    const corpoRequisicao = {
        contents: [
            { role: "user", parts: [{ text: instrucaoSistema + "\n\nPergunta do usuário: " + textoUsuario }] }
        ],
        generationConfig: {
            temperature: 0.7
        }
    };

    const resposta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpoRequisicao)
    });

    if (!resposta.ok) {
        throw new Error("Interferência na comunicação matriz.");
    }

    const dados = await resposta.json();
    return dados.candidates[0].content.parts[0].text;
}
