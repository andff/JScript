# 🖥️ SocialGrid — Painel de Redes Sociais

Visualize X, Facebook, Instagram e Reddit em **4 painéis lado a lado**, em tela cheia.

---

## ✅ Pré-requisitos

- **Node.js** (v18 ou superior) → https://nodejs.org

---

## 🚀 Como usar

### 1. Instalar dependências
Abra o terminal na pasta do projeto e rode:

```bash
npm install
```

### 2. Iniciar o app
```bash
npm start
```

O app vai abrir em tela cheia com os 4 painéis. Faça login normalmente em cada um — **os logins ficam salvos** entre sessões (cada rede tem sua própria sessão de navegador isolada).

---

## 🎛️ Controles

| Botão na barra | Função |
|---|---|
| **X / Facebook / Instagram / Reddit** | Ir para a página inicial da rede |
| **⟳** | Recarregar todos os 4 painéis |
| Botões de janela (● ● ●) | Fechar / Minimizar / Maximizar |

---

## 📦 Gerar instalador (opcional)

Para criar um `.exe` (Windows), `.dmg` (Mac) ou `.AppImage` (Linux):

```bash
# Windows
npm run build-win

# Mac
npm run build-mac

# Linux
npm run build-linux
```

O instalador ficará na pasta `dist/`.

---

## 🔒 Privacidade

- Cada rede social tem uma **sessão separada e persistente** (`partition: persist:nome`)
- Nenhum dado é enviado a terceiros — tudo roda localmente
- Os cookies de login ficam salvos no seu computador

---

## 📁 Estrutura do projeto

```
social-dashboard/
├── main.js        ← lógica principal (Electron)
├── preload.js     ← ponte entre UI e sistema
├── index.html     ← barra de controle no topo
├── package.json   ← dependências e scripts
└── README.md      ← este arquivo
```
