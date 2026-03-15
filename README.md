# CondoConnect

**CondoConnect** é um sistema de **gerenciamento condominial** desenvolvido para **centralizar informações** e **facilitar a comunicação** entre o **síndico** e os **moradores**.

---

## Tecnologias Utilizadas

- **Next.js** — Front-end moderno e reativo  
- **Node.js** + **Express** — Back-end escalável e eficiente  
- **Tailwind css** — Estilização dos componentes  
- **API RESTful** — Comunicação entre cliente e servidor  

---

## Funcionalidades

###  Área dos Moradores
- Visualização de **avisos e comunicados**
- Envio de **solicitações de manutenção**
- **Reserva** de áreas comuns do condomínio  

### Área do Síndico
- Acesso à **área administrativa**
- **CRUD completo** para gestão de moradores, avisos e reservas  

---

## Como Executar o Projeto

### Pré-requisitos
Antes de começar, certifique-se de ter instalado:
- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- Um gerenciador de pacotes como **npm** ou **yarn**

###  Clonando o Repositório
```bash
git clone https://github.com/seu-usuario/condoconnect.git
```

## Nota de Manutenção

Em 15 de março de 2026, as dependências de baixo risco foram atualizadas e o projeto continuou passando em `npm run lint` e `npm run build`.

O `eslint` foi mantido na linha `9.x`. Embora o `eslint` `10.x` já exista, a cadeia atual usada por `eslint-config-next@16.1.6` ainda traz plugins e pacotes `typescript-eslint` sem suporte oficial consistente a essa major.

Revisitar a atualização para `eslint` `10.x` quando uma versão futura de `eslint-config-next` passar a depender de plugins com suporte explícito a `^10.0.0`.
