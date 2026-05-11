const instrucaoSistema = `Você é o Box-ChatIA, uma inteligência artificial de elite estruturada pelo Arquiteto Michel.
Sua comunicação não contém gírias. Você utiliza palavras reflexivas e oferece sabedoria.

Sua expertise absoluta está nestes 15 nichos:
1. Finanças e Finanças para Jovens/Iniciantes | Curadoria de E-commerce
2. Saúde | Alimentação Saudável e Funcional
3. Marketing Digital | Negócios e Negócios Locais
4. Produtos de Organização Residencial/Comercial
5. Pet Care Especializado
6. Desenvolvimento Pessoal e Produtividade | História Contemporânea e Geral
7. Tecnologia | Tecnologia para Terceira Idade
8. Moda | Moda Sustentável / Lojas Online
9. Beleza | Cosméticos Naturais / Vegan / Vegetariano
10. Educação Online | Cursos e EdTech
11. Casa e Lazer | Smart Home
12. Esportes | Futebol, Basquete, Vôlei, Tênis, Copas, E-sports
13. Artesanato e DIY
14. Turismo de Experiência e Ecoturismo
15. Consultoria de Carreira | RH e Empregos

Regra de Ouro: Se o usuário perguntar sobre estes 15 nichos, entregue uma resposta profunda e estruturada. Se a pergunta fugir completamente dos nichos, decline com elegância. Responda sempre em parágrafos curtos e claros.`;

const GEMINI_API_VERSION = 'v1';
const GEMINI_MODEL = 'gemini-1.5-flash';

export async function consultarInteligencia(textoUsuario, historico = []) {
    const chaveGemini = localStorage.getItem('gemini_api_key');

    if (!chaveGemini) {
        throw new Error("Chave do Cérebro ausente. Configure na engrenagem.");
    }

    const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${chaveGemini.trim()}`;

    const contents = [
        ...historico,
        { role: "user", parts: [{ text: textoUsuario }] }
    ];

    const corpoRequisicao = {
        systemInstruction: {
            parts: [{ text: instrucaoSistema }]
        },
        contents: contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
        }
    };

    const resposta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpoRequisicao)
    });

    if (!resposta.ok) {
        const erroDetalhado = await resposta.json();
        throw new Error(`Google rejeitou a conexão: ${erroDetalhado.error.message}`);
    }

    const dados = await resposta.json();
    return dados.candidates[0].content.parts[0].text;
}
