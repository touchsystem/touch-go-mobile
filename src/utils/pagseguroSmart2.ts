import { NativeModules, Platform } from 'react-native';

const { PagSeguroSmart2, Smart2Print, PagseguroPlugpag } = NativeModules;

export type PagSeguroPaymentType = 'CREDITO' | 'DEBITO' | 'PIX';

export interface PagSeguroPayResult {
  success: true;
  transactionId: string;
  transactionCode: string;
  /** Valor em centavos */
  amountInCents: number;
  /** Referência enviada (ex.: ID da venda) */
  reference?: string;
}

export interface PagSeguroPayError {
  success: false;
  code: string;
  message: string;
}

export type PagSeguroPayResponse = PagSeguroPayResult | PagSeguroPayError;

export interface NativePagSeguroSmart2 {
  initialize(token: string): Promise<boolean>;
  pay(
    amountInCents: number,
    reference: string,
    paymentType: string,
    installments: number
  ): Promise<PagSeguroPayResult>;
  refund(transactionId: string, amountInCents: number): Promise<void>;
  isAvailable(): Promise<boolean>;
  /** Imprime texto na impressora térmica da Smart2 (TerminalLib). Opcional no módulo nativo. */
  print?(text: string): Promise<{ success: boolean; message?: string }>;
}

/**
 * Módulo nativo PagSeguro Smart 2 (PlugPag).
 * Baseado em docs/App e docs/pagamento do sistema de referência.
 * Só existe no build Android; no Expo Go ou iOS retorna null.
 *
 * @see docs/PAGSEGURO-SMART2.md
 * @see docs/App/AppPagSeguro.java
 * @see docs/pagamento/PagamentoActivity.java
 */
const nativePagSeguro: NativePagSeguroSmart2 | null =
  Platform.OS === 'android' && PagSeguroSmart2 ? PagSeguroSmart2 : null;

/**
 * Inicializa e ativa o Pinpad com o token PagSeguro (código do estabelecimento).
 * Deve ser chamado antes de payWithSmart2(). Baseado em AppPagSeguro.ativar().
 *
 * @param token Código PagSeguro do estabelecimento (ex.: obtido das configurações)
 */
export async function initializeSmart2(token: string): Promise<{ success: boolean; message?: string }> {
  if (!nativePagSeguro) {
    return {
      success: false,
      message: 'PagSeguro Smart 2 não disponível (use build Android nativo)',
    };
  }

  try {
    await nativePagSeguro.initialize(token.trim());
    return { success: true };
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    return {
      success: false,
      message: err?.message ?? String(e),
    };
  }
}

/**
 * Inicia pagamento no terminal Smart 2.
 * Baseado em PagamentoActivity: CREDITO, DEBITO ou PIX.
 *
 * @param amountInCents Valor em centavos (ex.: 1000 = R$ 10,00)
 * @param reference Referência da venda (ex.: ID do pedido) para conciliação
 * @param paymentType "CREDITO" | "DEBITO" | "PIX" (default: "CREDITO")
 * @param installments Número de parcelas (1 = à vista; default: 1)
 * @param timeoutMs Timeout em milissegundos (default: 120000 = 2 minutos)
 * @returns Resultado com transactionId/transactionCode em sucesso, ou objeto de erro
 */
export async function payWithSmart2(
  amountInCents: number,
  reference: string = '',
  paymentType: PagSeguroPaymentType = 'CREDITO',
  installments: number = 1,
  timeoutMs: number = 120000 // 2 minutos padrão
): Promise<PagSeguroPayResponse> {
  if (!nativePagSeguro) {
    return {
      success: false,
      code: 'NOT_AVAILABLE',
      message: 'PagSeguro Smart 2 não disponível (use build Android nativo)',
    };
  }

  const startTime = Date.now();
  console.log(`[PagSeguro] payWithSmart2 iniciado: timeout=${timeoutMs}ms, amount=${amountInCents}, ref=${reference}`);

  try {
    // Cria uma Promise com timeout para evitar travamento indefinido
    const paymentPromise = nativePagSeguro.pay(
      amountInCents,
      reference,
      paymentType,
      installments > 0 ? installments : 1
    );

    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        const elapsed = Date.now() - startTime;
        console.warn(`[PagSeguro] Timeout após ${elapsed}ms (limite: ${timeoutMs}ms)`);
        reject(new Error('TIMEOUT'));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([paymentPromise, timeoutPromise]);
      // Se chegou aqui, o pagamento completou antes do timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const elapsed = Date.now() - startTime;
      console.log(`[PagSeguro] Pagamento concluído em ${elapsed}ms`);
      return { success: true, ...result };
    } catch (raceError) {
      // Se o timeout ganhou a race, limpa o timeout e rejeita
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      throw raceError;
    }
  } catch (e: unknown) {
    const elapsed = Date.now() - startTime;
    const err = e as { code?: string; message?: string };

    console.error(`[PagSeguro] Erro após ${elapsed}ms:`, err);

    // Trata timeout especificamente
    if (err?.message === 'TIMEOUT' || String(e).includes('TIMEOUT')) {
      return {
        success: false,
        code: 'TIMEOUT',
        message: 'Tempo máximo estipulado para a operação expirou. Por favor, tente novamente.',
      };
    }

    // Trata outros erros
    const errorMessage = err?.message ?? String(e);

    // Mensagens comuns do PagSeguro
    if (errorMessage.includes('ESGOTADO O TEMPO MAXIMO') ||
      errorMessage.includes('TEMPO MAXIMO ESTIPULADO') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('TIMEOUT')) {
      return {
        success: false,
        code: 'TIMEOUT',
        message: 'Tempo máximo estipulado para a operação expirou. Por favor, tente novamente.',
      };
    }

    return {
      success: false,
      code: err?.code ?? 'ERROR',
      message: errorMessage,
    };
  }
}

/**
 * Estorno (total ou parcial) no Smart 2.
 *
 * @param transactionId ID da transação original
 * @param amountInCents Valor em centavos a estornar (0 = estorno total)
 */
export async function refundSmart2(
  transactionId: string,
  amountInCents: number = 0
): Promise<{ success: boolean; code?: string; message?: string }> {
  if (!nativePagSeguro) {
    return {
      success: false,
      code: 'NOT_AVAILABLE',
      message: 'PagSeguro Smart 2 não disponível (use build Android nativo)',
    };
  }

  try {
    await nativePagSeguro.refund(transactionId, amountInCents);
    return { success: true };
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    return {
      success: false,
      code: err?.code ?? 'ERROR',
      message: err?.message ?? String(e),
    };
  }
}

/**
 * Verifica se o serviço PlugPag está disponível no dispositivo (Smart 2 ou tablet com serviço).
 */
export async function isSmart2Available(): Promise<boolean> {
  if (!nativePagSeguro) return false;
  try {
    return await nativePagSeguro.isAvailable();
  } catch {
    return false;
  }
}

/**
 * Verifica se o módulo nativo está carregado (build Android com o módulo registrado).
 */
export function isPagSeguroModuleLoaded(): boolean {
  return nativePagSeguro !== null;
}

/**
 * Módulo Smart2Print: impressão térmica na Smart2 (injetado pelo plugin with-smart2-print).
 * Usado quando PagSeguroSmart2 não implementa print(text).
 */
const nativeSmart2Print =
  Platform.OS === 'android' && Smart2Print && typeof Smart2Print.print === 'function'
    ? Smart2Print
    : null;

/**
 * Imprime texto na impressora térmica da Smart2 (a mesma do pagamento).
 * Usa PagSeguroSmart2.print se existir; senão usa o módulo Smart2Print (plugin with-smart2-print).
 * Se nenhum estiver disponível, retorna success: false (permite fallback para impressão no servidor).
 *
 * @param text Conteúdo em texto puro, com quebras de linha (\n). Ideal ~32 caracteres por linha para térmica.
 */
export async function printOnSmart2(text: string): Promise<{ success: boolean; message?: string }> {
  if (typeof nativePagSeguro?.print === 'function') {
    try {
      return await nativePagSeguro.print!(text);
    } catch (e: unknown) {
      const err = e as { message?: string };
      return {
        success: false,
        message: err?.message ?? String(e),
      };
    }
  }
  if (nativeSmart2Print) {
    try {
      return await nativeSmart2Print.print(text);
    } catch (e: unknown) {
      const err = e as { message?: string };
      return {
        success: false,
        message: err?.message ?? String(e),
      };
    }
  }
  return {
    success: false,
    message:
      nativePagSeguro && !nativeSmart2Print
        ? 'Impressão na Smart2 não implementada no módulo nativo'
        : 'PagSeguro Smart 2 não disponível',
  };
}

/** Verifica se o módulo nativo suporta impressão na térmica da Smart2 (texto). */
export function isSmart2PrintSupported(): boolean {
  return typeof nativePagSeguro?.print === 'function' || nativeSmart2Print !== null;
}

/**
 * Imprime na Smart2 usando arquivo de imagem (PNG/JPEG).
 * Usa o módulo PagseguroPlugpag quando disponível (react-native-pagseguro-plugpag).
 * Útil quando o módulo custom não implementa print(text).
 *
 * @param filePath Caminho do arquivo de imagem (ex.: retorno de captureRef com result: 'tmpfile')
 */
export async function printOnSmart2FromFile(
  filePath: string
): Promise<{ success: boolean; message?: string }> {
  const path = filePath?.replace?.('file://', '') ?? filePath;
  if (!path) {
    return { success: false, message: 'Caminho do arquivo inválido' };
  }
  const plugpag = Platform.OS === 'android' ? PagseguroPlugpag : null;
  if (!plugpag || typeof plugpag.print !== 'function') {
    return {
      success: false,
      message: 'Módulo de impressão PlugPag não disponível. Rode prebuild e use build Android.',
    };
  }
  try {
    const response = await plugpag.print(path);
    const retCode = response?.retCode ?? response?.result;
    if (retCode === 0 || retCode === '0') {
      return { success: true };
    }
    return {
      success: false,
      message: response?.message ?? 'Erro ao imprimir',
    };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return {
      success: false,
      message: err?.message ?? String(e),
    };
  }
}

/** Verifica se é possível imprimir por arquivo (lib react-native-pagseguro-plugpag). */
export function isPlugPagPrintFromFileAvailable(): boolean {
  return (
    Platform.OS === 'android' &&
    typeof (NativeModules.PagseguroPlugpag as any)?.print === 'function'
  );
}

/** Retorna true se qualquer forma de impressão na Smart2 estiver disponível. */
export function isSmart2PrintAvailable(): boolean {
  return isSmart2PrintSupported() || isPlugPagPrintFromFileAvailable();
}

export default {
  initializeSmart2,
  payWithSmart2,
  refundSmart2,
  isSmart2Available,
  isPagSeguroModuleLoaded,
  printOnSmart2,
  printOnSmart2FromFile,
  isSmart2PrintSupported,
  isPlugPagPrintFromFileAvailable,
  isSmart2PrintAvailable,
};
