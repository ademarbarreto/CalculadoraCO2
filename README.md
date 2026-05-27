# 🍃 Calculadora de Emissão de CO₂

Uma aplicação web estática que estima a emissão de CO₂ de viagens entre cidades brasileiras, comparando diferentes meios de transporte e calculando créditos de carbono necessários para compensação.

![Deploy Status](https://img.shields.io/badge/deploy-GitHub%20Pages-222222?logo=github)
![Status](https://img.shields.io/badge/status-ativo-10b981)
![Linguagem](https://img.shields.io/badge/linguagem-JavaScript-f7df1e?logo=javascript)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Usar](#como-usar)
- [Meios de Transporte e Fatores de Emissão](#meios-de-transporte-e-fatores-de-emissão)
- [Deploy](#deploy)
- [Sugestões de Melhoria](#sugestões-de-melhoria)

---

## Sobre o Projeto

A **Calculadora de Emissão de CO₂** permite ao usuário estimar a quantidade de CO₂ emitida em uma viagem entre duas cidades brasileiras, escolhendo entre quatro meios de transporte. A aplicação também compara as emissões entre todos os modais disponíveis e calcula o custo de créditos de carbono para compensar o impacto ambiental.

O projeto é 100% front-end, sem dependências de frameworks ou build tools — apenas HTML, CSS e JavaScript vanilla.

---

## Funcionalidades

- **Cálculo de emissão** por rota e meio de transporte (bicicleta, carro, ônibus, caminhão)
- **Autopreenchimento de distância** entre cidades cadastradas no banco de rotas
- **Entrada manual de distância** para rotas não cadastradas
- **Comparação visual** entre todos os meios de transporte com barras de progresso coloridas
- **Cálculo de créditos de carbono** necessários para offset, com estimativa de custo em BRL
- **Interface responsiva** para desktop e mobile
- **Deploy automatizado** via GitHub Actions para GitHub Pages

---

## Estrutura do Projeto

```
/
├── index.html              # Estrutura semântica da página
├── README.md
├── css/
│   └── style.css           # Estilos, variáveis CSS e responsividade
├── js/
│   ├── app.js              # Inicialização e handler do formulário
│   ├── calculator.js       # Lógica de cálculo de emissões e créditos
│   ├── config.js           # Fatores de emissão, metadados e autofill de distância
│   ├── routes-data.js      # Banco de dados de rotas entre cidades brasileiras
│   └── ui.js               # Renderização de resultados e manipulação do DOM
└── .github/
    └── workflows/
        └── deploy.yml      # Pipeline de deploy para GitHub Pages
```

### Responsabilidades de cada arquivo

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura semântica (HTML5), formulário e seções de resultado |
| `css/style.css` | Design system com CSS custom properties, layout, animações |
| `js/app.js` | Orquestra inicialização, validação e fluxo de submit |
| `js/calculator.js` | Funções puras de cálculo (emissão, comparação, créditos) |
| `js/config.js` | Constantes de configuração e lógica de autofill |
| `js/routes-data.js` | Banco estático de ~45 rotas entre cidades brasileiras |
| `js/ui.js` | Funções de renderização de HTML e utilitários de DOM |

---

## Como Usar

### Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/calculadora-co2.git
   cd calculadora-co2
   ```

2. Abra o arquivo diretamente no navegador:
   ```bash
   # Linux / macOS
   open index.html

   # Ou use um servidor local simples
   npx serve .
   ```

> Não é necessário instalar dependências — o projeto não usa npm ou build tools.

### Via GitHub Pages

Acesse a URL gerada pelo GitHub Pages após o deploy (configurada no workflow).

---

## Meios de Transporte e Fatores de Emissão

| Modal | Fator (kg CO₂/km) | Referência |
|---|---|---|
| 🚲 Bicicleta | 0,000 | Emissão zero |
| 🚌 Ônibus | 0,089 | Média por passageiro |
| 🚗 Carro | 0,120 | Veículo a combustão, médio porte |
| 🚚 Caminhão | 0,960 | Veículo de carga |

**Créditos de carbono:** 1 crédito = 1.000 kg CO₂ | Preço de referência: R$ 50 – R$ 150 por crédito.

---

## Deploy

O projeto usa **GitHub Actions** para deploy automático no **GitHub Pages**.

O pipeline é acionado:
- A cada push na branch `main`
- Manualmente via `workflow_dispatch` no GitHub

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

---

## Sugestões de Melhoria

### 🔴 Alta Prioridade

#### 1. Integração com API de Distâncias/Geocodificação
Atualmente as distâncias são **fixas e limitadas** (~45 rotas cadastradas). A principal melhoria é substituir o banco estático por uma API real:

- **Google Maps Distance Matrix API** — retorna distância real de rota por modal
- **OpenRouteService API** (gratuita/open source) — suporta rotas para carro, bicicleta e pedestres
- **OSRM (Open Source Routing Machine)** — pode ser self-hosted, sem custo de API

**Como implementaria:**
```javascript
// Exemplo com OpenRouteService
async function getDistanceFromAPI(origin, destination) {
  const geoCode = async (city) => {
    const res = await fetch(
      `https://api.openrouteservice.org/geocode/search?text=${encodeURIComponent(city)}&api_key=SUA_CHAVE`
    );
    const data = await res.json();
    return data.features[0].geometry.coordinates; // [lng, lat]
  };

  const [originCoords, destCoords] = await Promise.all([
    geoCode(origin),
    geoCode(destination)
  ]);

  const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
    method: 'POST',
    headers: { 'Authorization': 'SUA_CHAVE', 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates: [originCoords, destCoords] })
  });

  const data = await res.json();
  return data.routes[0].summary.distance / 1000; // metros → km
}
```

> Com isso, qualquer cidade do mundo pode ser usada como origem/destino, sem manutenção manual de rotas.

#### 2. Fatores de Emissão Mais Precisos
Os fatores atuais são fixos e genéricos. Melhorias possíveis:
- Diferenciar **carro por tipo de combustível** (gasolina, etanol, elétrico, híbrido)
- Adicionar **avião** como modal (alto impacto em viagens longas)
- Considerar **ocupação do veículo** (ex.: carro com 4 passageiros vs. 1)
- Usar fatores regionais do Brasil (a matriz elétrica brasileira é majoritariamente renovável, o que afeta veículos elétricos)

---

### 🟡 Média Prioridade

#### 3. Gráfico Visual de Comparação
Substituir as barras CSS por um gráfico interativo com **Chart.js** ou **D3.js**, mostrando comparações em formato de gráfico de barras ou radar.

#### 4. Persistência de Histórico
Salvar as últimas N consultas no `localStorage` para o usuário consultar seu histórico de rotas e emissões acumuladas.

#### 5. Modo de Cálculo Mensal / Anual
Adicionar um campo de **frequência** (ex.: "faço esse trajeto 5x por semana") para calcular a emissão acumulada mensal e anual, com uma meta de redução personalizada.

#### 6. Compartilhamento de Resultado
Botão para gerar um link único com os parâmetros da rota (via query string na URL), permitindo compartilhar resultados.

---

### 🟢 Baixa Prioridade / Nice-to-have

#### 7. Internacionalização (i18n)
O projeto mistura português e inglês (labels em inglês no HTML, UI em português). Padronizar e adicionar suporte a múltiplos idiomas.

#### 8. Modo Escuro
Adicionar suporte a `prefers-color-scheme: dark` com um toggle manual.

#### 9. Testes Automatizados
As funções em `calculator.js` são puras e fáceis de testar — adicionar uma suíte com **Vitest** ou **Jest** aumentaria a confiabilidade.

#### 10. PWA (Progressive Web App)
Adicionar um `manifest.json` e um service worker para permitir instalação como app mobile e funcionamento offline.

---

## Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/minha-melhoria`
3. Commit suas mudanças: `git commit -m 'feat: adiciona integração com API de geocodificação'`
4. Push para a branch: `git push origin feature/minha-melhoria`
5. Abra um Pull Request

---

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
