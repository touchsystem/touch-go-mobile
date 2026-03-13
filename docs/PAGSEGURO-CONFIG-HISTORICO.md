# Histórico da configuração PagSeguro (pagamentos Smart2)

## Resumo

Houve um `git reset --hard f7ffc03` que reverteu o commit `1d79ff0` (feat: mock API, banco local/offline, retry PagSeguro).  
**O código atual (main) já contém novamente essa configuração** — os commits posteriores a `1d79ff0` foram reaplicados.

---

## Estado "até aqui funcionando" (f7ffc03)

- **Commit:** `f7ffc035` — "feat: até aqui funcionando"
- **Data:** 29/12/2025
- **Conteúdo:** Estado anterior à integração completa de pagamento PagSeguro no `ViewBillModal` (sem botão Pagar, sem retry automático).

---

## Configuração que funcionava (1d79ff0)

- **Commit:** `1d79ff013` — "feat: mock API, banco local/offline, retry PagSeguro e dependencia @expo/server"
- **Data:** 20/02/2026

### Alterações principais

#### 1. `src/utils/pagseguroSmart2.ts` — Retry automático em timeout

- **`isTimeoutError(e)`** — Detecta timeout (nosso ou do SDK nativo):
  - `TIMEOUT`, `Tempo de resposta excedido`, `ESGOTADO O TEMPO MAXIMO`, etc.
- **`attemptPay()`** — Uma tentativa de pagamento com `Promise.race` contra timeout JS.
- **`payWithSmart2()`** — Loop de até 2 tentativas:
  - Se timeout na 1ª tentativa → retry automático com mensagem "Aproxime o cartão".
  - Se timeout na 2ª → retorna erro amigável.

#### 2. `src/components/ui/ViewBillModal.tsx` — Fluxo de pagamento

- **`handlePay()`** — Abre modal de método de pagamento (Crédito/Débito/Pix).
- **`processPayment(paymentType)`** — Chama `payWithSmart2()`, em caso de sucesso chama `closeMesaOnBackend()`.
- **`closeMesaOnBackend(paymentType)`** — Chama `imprimir-conta`, monta payload e usa `closeMesaSync()` para fechar mesa no backend.
- Botão **Pagar** visível quando `isPagSeguroModuleLoaded()`.
- Modal de seleção: Crédito, Débito, PIX.

#### 3. Outros arquivos do commit 1d79ff0

- `transaction-sync.ts` — Sincronização offline (submitOrder, closeMesa, syncPending).
- `local-db.ts` — SQLite para transações pendentes.
- `mock-api-data.ts` — Mock da API para desenvolvimento.
- `api.ts` — Interceptor e lógica de retry.
- `AuthContext.tsx`, `AppProviders.tsx`, `OrdersScreen.tsx` — Integração com sync/offline.

---

## Estado atual (main)

O código atual **já inclui** a configuração de pagamento PagSeguro:

- `pagseguroSmart2.ts` — Retry em 2 tentativas.
- `ViewBillModal.tsx` — Fluxo de pagamento (handlePay, processPayment, closeMesaOnBackend).
- `transaction-sync.ts` e `local-db.ts` — Sincronização offline.

---

## Como restaurar se precisar reverter o revert

Para restaurar a configuração do commit `1d79ff0` em um branch que esteja em `f7ffc03`:

```bash
# Opção 1: Cherry-pick do commit
git cherry-pick 1d79ff0

# Opção 2: Restaurar apenas os arquivos de PagSeguro
git checkout 1d79ff0 -- src/utils/pagseguroSmart2.ts
git checkout 1d79ff0 -- src/components/ui/ViewBillModal.tsx
# (+ transaction-sync, local-db, api, etc. se necessário)
```

---

## Dependências nativas (Android)

- PlugPag SDK: `br.com.uol.pagseguro.plugpagservice.wrapper:wrapper:1.33.0`
- Maven: `https://github.com/pagseguro/PlugPagServiceWrapper/raw/master`
- Plugin `with-smart2-print.js` — Injeta Maven + dependência no build.
- Token PagSeguro — Configurado nas configurações do app (código do estabelecimento).
