# Arquitetura da Aplicação

## Introdução
Este documento descreve de forma clara e objetiva as principais decisões arquiteturais adotadas na implementação da aplicação de votação de ideias, destacando estratégias de renderização, fluxo de dados, autenticação e otimizações de performance.

---

## 1. Estratégia de Renderização no Front-end
**Escolha adotada:** renderização no lado do cliente com carregamento assíncrono.

**Por que essa abordagem?**
- A autenticação por tokens armazenados localmente depende de execução no navegador.
- As votações ocorrem em tempo real e exigem atualizações imediatas da interface.
- A lista de ideias apresenta alterações constantes conforme novos votos são registrados.
- Estados de carregamento mais granulares garantem melhor experiência ao usuário.

**Outras abordagens rejeitadas:**
- Renderização no servidor: ineficaz para dados que mudam a cada voto.
- Geração estática: não permite exibir informações dinâmicas.
- Revalidação frequente: perde benefícios de desempenho.

---

## 2. Fluxo Completo de Votação
1. **Ação do usuário**  
   Verifica sessão ativa ao clicar em votar; caso não autenticado, exibe diálogo de login.

2. **Atualização otimista**  
   A interface exibe imediatamente o incremento de votos para dar sensação de rapidez.

3. **Chamada ao backend**  
   Envio da requisição de voto com token de autenticação.

4. **Reconciliação de dados**  
   Ajuste dos votos conforme valor real retornado pelo servidor.

5. **Tratamento de erros**  
   Rollback em falhas ou conflito, informando o usuário sobre o problema.

---

## 3. Invalidação e Sincronia de Cache
- **Atualizações imediatas** garantem feedback instantâneo.
- **Rollback automático** corrige inconsistências em falhas de rede ou votos duplicados.
- **Sincronização periódica** com o servidor mantém a lista de votações alinhada ao estado real.

---

## 4. Persistência de Votos no Cliente
Os registros de votação são salvos localmente (localStorage) para impedir votos duplicados. No login, ocorre reconciliação com as votações oficiais do servidor.

---

## 5. Estado de Autenticação
**Desafio:** manter o estado de login sincronizado entre componentes e abas.

**Solução escolhida:** polling leve a cada segundo para verificar validade do token e atualizações de logout, sem dependências externas, garantindo simplicidade e robustez.

---

## 6. Otimizações de Performance
1. **Carregamento Sob Demanda**  
   Componentes não críticos são carregados apenas quando necessários.

2. **Debounce em Ações Rápidas**  
   Previne requisições duplicadas causadas por múltiplos cliques.

3. **Interceptors de HTTP**  
   Tratamento centralizado de autenticação e tentativas de retry em falhas de rede.

4. **Fallbacks e Tratamento de Erros**  
   Estados de carregamento específicos com notificações em caso de falhas, garantindo maior resiliência.

---

## Conclusão
As decisões arquiteturais priorizam simplicidade, performance e experiência do usuário, assegurando que a aplicação de votação de ideias seja ágil, responsiva e escalável.
