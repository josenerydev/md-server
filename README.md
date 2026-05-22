# md-server

CLI em TypeScript que serve arquivos Markdown como HTML no navegador. Aponte para qualquer pasta com arquivos `.md` e acesse um índice navegável em `localhost`.

## O que faz

- Varre recursivamente uma pasta em busca de arquivos `.md`
- Exibe um índice no navegador com os arquivos agrupados por subdiretório
- Renderiza cada `.md` como HTML ao clicar no link (GitHub Flavored Markdown)
- Abre o navegador automaticamente ao iniciar
- Sem build step — roda TypeScript diretamente via `tsx`

## Instalação

### Pré-requisito: nvm + Node 22

O projeto usa [nvm](https://github.com/nvm-sh/nvm) para gerenciar a versão do Node no WSL/Linux.

```bash
# 1. Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# 2. Recarregar o shell
source ~/.bashrc

# 3. Instalar Node 22 e definir como padrão
nvm install 22
nvm alias default 22
```

### Instalar dependências e registrar o comando globalmente

```bash
cd ~/repos/ws-ia/md-server
nvm use           # usa a versão do .nvmrc (Node 22)
npm install
npm link          # registra "md-server" como comando global
```

Após `npm link`, o comando `md-server` fica disponível em qualquer pasta nos terminais onde o nvm estiver carregado.

> **Nota WSL:** o `nvm` é carregado automaticamente em novos terminais após a instalação (o instalador adiciona as linhas necessárias no `~/.bashrc`). Se o comando não for encontrado, execute `source ~/.bashrc` ou abra um novo terminal.

## Uso

```bash
# Serve a pasta atual (todos os *.md recursivamente)
md-server

# Serve uma pasta específica
md-server ./guidelines
md-server ../docs

# Serve um único arquivo diretamente
md-server ./guidelines/criar-endpoint-fastendpoints.md

# Porta customizada
md-server ./guidelines --port 4000

# Modo leitura (speech-friendly para Speechify e leitores TTS)
md-server ./guidelines --speech
md-server "arquivo.md" --speech

# Informações
md-server --help
md-server --version
```

### Caso de uso principal

```bash
# Navegar pelos guidelines do projeto ftc
cd ~/repos/ws-ia/ftc
md-server
# → abre http://localhost:3000 com todos os .md do projeto
```

## Interface

**Índice (`/`):** lista todos os arquivos `.md` encontrados, agrupados por subdiretório, com link para cada um.

**Página de arquivo (`/file/<path>`):** renderiza o Markdown como HTML com:
- GitHub Flavored Markdown (tabelas, task lists, strikethrough)
- Syntax highlighting via [highlight.js](https://highlightjs.org/) (requer conexão com a internet)
- Link de volta ao índice

**Modo `--speech`:** renderização otimizada para leitores TTS como [Speechify](https://speechify.com/):
- Blocos de código viram `<p>` (lidos pelo TTS, separados por `<hr>`)
- Tabelas sem zebra e sem destaque no header (lidas sem pular)
- Blockquotes em `<div>` (não ignorados pelo leitor)

## Desenvolvimento

```bash
# Rodar sem instalar globalmente
npm start -- ./alguma-pasta
npm start -- ./alguma-pasta --port 4000
```

## Estrutura do projeto

```
md-server/
├── bin/
│   └── md-server       # shell wrapper executável (entry point do npm link)
└── src/
    ├── index.ts         # parse de args e validação
    ├── server.ts        # Express app e rotas
    ├── scanner.ts       # varredura recursiva de *.md
    ├── renderer.ts      # marked: markdown → HTML
    └── templates.ts     # templates HTML com CSS inline
```

## Dependências

| Pacote | Uso |
|--------|-----|
| `express` | servidor HTTP |
| `marked` | renderização de Markdown (GFM) |
| `open` | abre o navegador automaticamente |
| `tsx` | executa TypeScript diretamente (sem compilação) |
