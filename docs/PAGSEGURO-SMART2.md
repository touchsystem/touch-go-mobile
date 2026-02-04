# Integração PagSeguro Smart 2 – touch-go-mobile

Este documento descreve como integrar o **PagSeguro Smart 2** (terminal de pagamento Android) ao app **touch-go-mobile**, para processar pagamentos direto na maquininha.

---

## 0. Implementação de referência (base)

A implementação neste projeto foi feita com base em um **sistema que já funciona** nos diretórios:

| Diretório | Conteúdo |
|-----------|----------|
| **docs/App** | `AppPagSeguro.java` – inicialização do app, ativação do Pinpad com token PagSeguro |
| **docs/pagamento** | `PagSeguroHelper.java` – singleton PlugPag; `PagamentoActivity.java` – fluxo de pagamento (CRÉDITO/DÉBITO/PIX), eventos do terminal; `MeioDePagamentoActivity.java` – escolha do meio; `ParcelamentoActivity.java` – parcelas; `PagamentoRealizadoActivity.java` – tela de sucesso |

Use esses arquivos como referência para entender o fluxo (ativar com token → obter PlugPag → `doPayment` com `PlugPagPaymentData` e `PlugPagEventListener`).

---

## 1. Visão geral

- **Smart 2** = terminal de pagamento PagSeguro (Moderninha Smart), baseado em Android.
- A integração é feita em **Android (Java/Kotlin)** via **SDK oficial** (PlugPagServiceWrapper).
- O **touch-go-mobile** (React Native/Expo) não fala com o Smart 2 diretamente; precisa de um **módulo nativo Android** que use o SDK e exponha funções para o JavaScript (ex.: iniciar pagamento, consultar resultado).

**Fluxo resumido:**

```
[React Native - tela de pagamento]
         ↓ chama módulo nativo
[Módulo nativo Android (Java/Kotlin)]
         ↓ usa
[PlugPagServiceWrapper / SDK PagSeguro]
         ↓ comunica com
[Serviços no Smart 2: PlugPagService, TerminalLib]
         ↓
[Terminal Smart 2: cartão, PIX, etc.]
```

---

## 2. O que precisa estar no terminal (Smart 2)

No **Smart 2** devem estar instalados e ativos:

| Serviço            | Função principal                          |
|--------------------|-------------------------------------------|
| **PlugPagService** | Ativação, transações, estornos            |
| **TerminalLib**    | Impressão, leitura de cartões MIFARE, etc.|

Geralmente já vêm configurados no aparelho. Em caso de dúvida, conferir com PagSeguro/PagBank.

---

## 3. SDK e documentação oficial

- **Biblioteca Android:** PlugPagServiceWrapper (PagSeguro/PagBank).
- **Documentação atual:** PagBank (sucessor PagSeguro) – [developer.pagbank.com.br](https://developer.pagbank.com.br).
- **Repositórios de referência:**
  - [pagseguro-sdk-plugpagservicewrapper](https://github.com/pagseguro/pagseguro-sdk-plugpagservicewrapper) – wrapper oficial.
  - [pagseguro-plugpagservicewrapper-smartcoffeedemo](https://github.com/pagseguro/pagseguro-plugpagservicewrapper-smartcoffeedemo) – exemplo de uso (café/demo).

---

## 4. Onde entra Java/Kotlin

A parte que usa o SDK do Smart 2 **tem que ser em código nativo Android**:

- **Opção A – Módulo nativo no próprio app (recomendado):**  
  Dentro do projeto Android do touch-go-mobile (`android/`), criar um módulo (Java ou Kotlin) que:
  - Adiciona a dependência do PlugPagServiceWrapper no `build.gradle`.
  - Implementa as chamadas ao SDK (iniciar pagamento, estorno, etc.).
  - Expõe essas funções para o React Native (bridge), para a tela de pagamento chamar em JS.

- **Opção B – App Android separado:**  
  App nativo que roda no tablet ou no próprio Smart 2 e usa o SDK; o touch-go-mobile se comunicaria com esse app (ex.: via intents, rede local ou backend). Mais complexo para manter.

Para o touch-go-mobile, a **Opção A** é a mais direta: um módulo nativo no `android/app/src/main/java/` que usa o PlugPagServiceWrapper e é chamado pelo JS.

---

## 5. O que já está implementado (baseado em docs/App e docs/pagamento)

| Item | Caminho |
|------|--------|
| Helper PlugPag (singleton) | `android/.../PagSeguroHelper.java` |
| Módulo nativo | `android/.../PagSeguroSmart2Module.java` (initialize, pay, refund, isAvailable) |
| Package | `android/.../PagSeguroSmart2Package.java` |
| Registro | `MainApplication.kt` → `add(PagSeguroSmart2Package())` |
| Permissão | `AndroidManifest.xml` → `MANAGE_PAYMENTS` |
| Dependência SDK | `android/app/build.gradle` → `br.com.uol.pagseguro.plugpagservice.wrapper:wrapper:1.27.2` |
| Repositório Maven | `android/build.gradle` → repo PlugPagServiceWrapper |
| Bridge TypeScript | `src/utils/pagseguroSmart2.ts` |

**Nota sobre o AAR do wrapper:** O AAR do PlugPagServiceWrapper expõe apenas o pacote `br.com.uol.pagseguro.plugpagservice.wrapper` (não o pacote `br.com.uol.pagseguro.plugpag`). O módulo usa apenas classes do wrapper (ex.: `PlugPag`, `PlugPagPaymentData`) e define localmente as constantes do SDK (RET_OK, TYPE_CREDITO, TYPE_DEBITO, TYPE_PIX, INSTALLMENT_TYPE_A_VISTA) para compilar sem o SDK completo.

Fluxo nativo (espelhando docs/App e docs/pagamento):

1. **initialize(token)** – ativa o Pinpad com o código PagSeguro (equivalente a `AppPagSeguro.ativar()`).
2. **pay(amountInCents, reference, paymentType, installments)** – monta `PlugPagPaymentData` e chama `doPayment()` (equivalente a `PagamentoActivity`).
3. **isAvailable()** – verifica se o PlugPag está pronto.

---

## 6. Uso no React Native

Bridge em `src/utils/pagseguroSmart2.ts`:

- **initializeSmart2(token)** – ativar Pinpad (chamar ao iniciar o app ou ao abrir configurações).
- **payWithSmart2(amountInCents, reference, paymentType?, installments?)** – pagar (CREDITO | DEBITO | PIX).
- **refundSmart2(transactionId, amountInCents)** – estorno (ainda stub no nativo).
- **isSmart2Available()** – verifica se o serviço está disponível.

Exemplo de uso na tela de pagamento:

```ts
import { initializeSmart2, payWithSmart2 } from '@/utils/pagseguroSmart2';

// Ao carregar o app ou ao ter o token (ex.: das configurações):
await initializeSmart2(codigoPagSeguro);

// Na tela de pagamento (valor em centavos, ref = ID do pedido):
const result = await payWithSmart2(
  1000,           // R$ 10,00
  String(pedidoId),
  'DEBITO',       // ou 'CREDITO' | 'PIX'
  1               // parcelas (1 = à vista)
);
if (result.success) {
  // result.transactionId, result.transactionCode → salvar no backend
} else {
  // result.code, result.message → mostrar erro
}
```

Se o repositório Maven do SDK não resolver no build, use o mesmo repositório do projeto que já funciona (docs/App, docs/pagamento) em `android/build.gradle`.

---

## 7. Conexão tablet ↔ Smart 2

- Se o **app roda no tablet** e o **Smart 2** é outro aparelho: a conexão entre tablet e Smart 2 (Bluetooth, USB ou rede) e o papel do PlugPagServiceWrapper dependem da documentação atual do PagBank (como o SDK descobre e se comunica com o terminal). A documentação oficial e o exemplo smartcoffeedemo costumam mostrar esse fluxo.
- Se o **app rodar no próprio Smart 2** (quando for permitido): o mesmo módulo nativo e o mesmo SDK são usados no mesmo dispositivo.

---

## 8. Referências rápidas

| Recurso | URL / observação |
|--------|-------------------|
| Documentação PagBank (PlugPag, providers) | https://developer.pagbank.com.br |
| PlugPagServiceWrapper (GitHub) | https://github.com/pagseguro/pagseguro-sdk-plugpagservicewrapper |
| Exemplo Smart (smartcoffeedemo) | https://github.com/pagseguro/pagseguro-plugpagservicewrapper-smartcoffeedemo |
| PlugPag Android Providers | https://developer.pagbank.com.br/docs/plugpag-android-providers |
| React Native Native Modules | Documentação oficial React Native – “Native Modules” (Android) |

---

## 9. Checklist

- [x] Dependência e repositório no `build.gradle` (ajustar repo se o build falhar; usar o do projeto que já funciona).
- [x] Permissão `MANAGE_PAYMENTS` no `AndroidManifest.xml`.
- [x] Módulo nativo (PagSeguroSmart2Module + PagSeguroHelper + Package) e registro no `MainApplication`.
- [x] Bridge em `src/utils/pagseguroSmart2.ts` com initialize, pay (tipo + parcelas), refund, isAvailable.
- [ ] Chamar `initializeSmart2(token)` ao ter o código PagSeguro (ex.: configurações do estabelecimento).
- [ ] Na tela de pagamento, chamar `payWithSmart2(amountInCents, reference, paymentType, installments)` e tratar sucesso/erro.

Com isso, você tem o caminho claro para colocar o pagamento no Smart 2 direto nas maquinas, via SDK em Java/Android e uso a partir do touch-go-mobile.
