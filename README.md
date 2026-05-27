# 🍃 Calculadora de Emissão de CO₂

Uma aplicação web estática que estima a emissão de CO₂ de viagens entre cidades brasileiras, comparando diferentes meios de transporte, calculando créditos de carbono e o impacto acumulado por frequência de uso.

![Deploy Status](https://img.shields.io/badge/deploy-GitHub%20Pages-222222?logo=github)
![Status](https://img.shields.io/badge/status-ativo-10b981)
![Linguagem](https://img.shields.io/badge/linguagem-JavaScript-f7df1e?logo=javascript)

---

## 📋 Índice

- [🍃 Calculadora de Emissão de CO₂](#-calculadora-de-emissão-de-co)
  - [📋 Índice](#-índice)
  - [Sobre o Projeto](#sobre-o-projeto)
  - [Funcionalidades](#funcionalidades)
  - [🚀 Status Final do Projeto](#-status-final-do-projeto)
  - [Estrutura do Projeto](#estrutura-do-projeto)
    - [Responsabilidades de cada arquivo](#responsabilidades-de-cada-arquivo)
  - [Como Usar](#como-usar)
    - [Localmente](#localmente)
    - [Via GitHub Pages](#via-github-pages)
  - [Meios de Transporte e Fatores de Emissão](#meios-de-transporte-e-fatores-de-emissão)
  - [API OpenRouteService](#api-openrouteservice)
    - [Configurar sua chave](#configurar-sua-chave)
    - [Em produção (GitHub Pages)](#em-produção-github-pages)
  - [Deploy](#deploy)
- [Imagens](#imagens)
    - [Tela de cálculo de distância  utilizando Geocodificação](#tela-de-cálculo-de-distância--utilizando-geocodificação)
    - [Tela de resultados de emissão e emissão de frequência](#tela-de-resultados-de-emissão-e-emissão-de-frequência)
    - [Tela de comparação de emissão de C02 entre meios de transporte](#tela-de-comparação-de-emissão-de-c02-entre-meios-de-transporte)
    - [Tela de histórico de consultas de viagem e de créditos de carbono](#tela-de-histórico-de-consultas-de-viagem-e-de-créditos-de-carbono)
  - [Contribuindo](#contribuindo)
  - [Autor](#autor)

---

## Sobre o Projeto

A **Calculadora de Emissão de CO₂** permite estimar a quantidade de CO₂ emitida em viagens entre quaisquer cidades, com distâncias calculadas em tempo real via API. A aplicação compara os modais disponíveis, calcula créditos de carbono para compensação e projeta o impacto acumulado de acordo com a frequência de uso da rota.

O projeto é 100% front-end, sem dependências de frameworks ou build tools — apenas HTML, CSS e JavaScript vanilla.

---

## Funcionalidades

- **Autocomplete de cidades** com busca em tempo real via API OpenRouteService (debounce de 350ms, navegação por teclado)
- **Cálculo de distância via API** para qualquer cidade brasileira, com entrada manual como fallback
- **5 modais de transporte**: bicicleta, carro, ônibus, caminhão e avião doméstico
- **Comparação visual** entre todos os modais com barras de progresso coloridas e percentual vs. carro
- **Cálculo de frequência semanal** — projeta emissões por viagem, semana, mês e ano com suporte a ida e volta
- **Créditos de carbono** — quantidade necessária para offset e estimativa de custo em BRL
- **Histórico com localStorage** — salva as últimas 5 consultas, persiste entre sessões, com opção de limpar
- **Validação inline** — erros exibidos abaixo de cada campo sem uso de `alert()`
- **Interface responsiva** para desktop e mobile
- **Deploy automatizado** via GitHub Actions para GitHub Pages

---

## 🚀 Status Final do Projeto

| Feature | Status |
|---|---|
| API OpenRouteService | ✅ |
| Cálculo de distância via API | ✅ |
| Autocomplete de cidades | ✅ |
| Validação inline | ✅ |
| Favicon 🌿 | ✅ |
| Histórico com localStorage | ✅ |
| Modal avião doméstico | ✅ |
| Cálculo por frequência semanal | ✅ |
| Deploy GitHub Pages + Node 24 | ✅ |
| README atualizado | ✅ |
| Comparação visual | ✅ |
| Interface responsiva | ✅ |


---

## Estrutura do Projeto

```
/
├── index.html              # Estrutura semântica da página
├── README.md
├── css/
│   └── style.css           # Design system, variáveis CSS, responsividade
├── images                  # Imagens das telas do aplicativo
├── js/
│   ├── app.js              # Inicialização, validação e handler do formulário (async)
│   ├── calculator.js       # Funções puras de cálculo (emissão, frequência, créditos)
│   ├── config.js           # Configuração, integração ORS, autocomplete e autofill
│   └── ui.js               # Renderização de resultados, histórico e DOM utils
└── .github/
    └── workflows/
        └── deploy.yml      # Pipeline de deploy para GitHub Pages (Node.js 24)
```

### Responsabilidades de cada arquivo

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura semântica (HTML5), formulário e seções de resultado |
| `css/style.css` | Design system com CSS custom properties, layout, animações |
| `js/app.js` | Orquestra inicialização, validação inline e fluxo de submit assíncrono |
| `js/calculator.js` | Funções puras: emissão, comparação, créditos e frequência |
| `js/config.js` | Chave ORS, fatores de emissão, geocodificação, autocomplete e distância |
| `js/ui.js` | Renderização de resultados, frequência, histórico e utilitários de DOM |

---

## Como Usar

### Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/calculadora-co2.git
   cd calculadora-co2
   ```

2. Abra com um servidor local (necessário para as chamadas de API funcionarem):
   ```bash
   # VS Code — extensão Live Server (recomendado)
   # Clique com botão direito no index.html → Open with Live Server

   # Ou via terminal
   npx serve .
   ```

> Abrir o `index.html` diretamente pelo sistema de arquivos (`file://`) pode bloquear as requisições de API por CORS.

### Via GitHub Pages

Acesse a URL gerada pelo GitHub Pages após o deploy.

---

## Meios de Transporte e Fatores de Emissão

| Modal | Fator (kg CO₂/km) | Referência |
|---|---|---|
| 🚲 Bicicleta | 0,000 | Emissão zero |
| 🚌 Ônibus | 0,089 | Média por passageiro |
| 🚗 Carro | 0,120 | Veículo a combustão, médio porte |
| ✈️ Avião (dom.) | 0,180 | Voo doméstico, média por passageiro |
| 🚚 Caminhão | 0,960 | Veículo de carga |

**Créditos de carbono:** 1 crédito = 1.000 kg CO₂ | Preço de referência: R$ 50 – R$ 150 por crédito.

---

## API OpenRouteService

O projeto utiliza a [OpenRouteService API](https://openrouteservice.org) (gratuita) para:

- **Geocodificação** — converte nomes de cidades em coordenadas `[lng, lat]`
- **Autocomplete** — sugere cidades enquanto o usuário digita (endpoint `/geocode/autocomplete`)
- **Distância de rota** — calcula a distância real entre dois pontos (endpoint `/v2/directions/driving-car`)

### Configurar sua chave

1. Crie uma conta em [openrouteservice.org](https://openrouteservice.org/dev/#/signup)
2. Gere um token gratuito no Dashboard
3. Substitua a chave em `js/config.js`:
   ```javascript
   ORS_API_KEY: 'sua-chave-aqui'
   ```

**Limites do plano gratuito:** 2.000 requisições/dia · sem cartão de crédito.

### Em produção (GitHub Pages)

Adicione o domínio do GitHub Pages nas configurações do token no painel ORS para evitar bloqueios por CORS.

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

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true  # compatibilidade Node.js 24
```

# Imagens

### Tela de cálculo de distância  utilizando Geocodificação

![Logo do Projeto](/images/Calculadora%20de%20CO2%20-%20Tela%201.png)

### Tela de resultados de emissão e emissão de frequência

![Logo do Projeto](/images/Calculadora%20CO2%20Emissao.png)

### Tela de comparação de emissão de C02 entre meios de transporte

![Logo do Projeto](/images/Calculadora%20de%20CO2%20Meios%20de%20Transporte.png)

### Tela de histórico de consultas de viagem e de créditos de carbono

![Logo do Projeto](/images/Calculadora%20de%20CO2%20Histórico%20de%20consultas.png)

## Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/minha-melhoria`
3. Commit suas mudanças: `git commit -m 'feat: descrição da melhoria'`
4. Push para a branch: `git push origin feature/minha-melhoria`
5. Abra um Pull Request

---

## Autor

Ademar Silva Barreto Junior

LinkedIn: https://www.linkedin.com/in/ademarsilvabarretojunior/
