/**
 * Mock de API para o usuário de teste Google: teste@eatzgo.com
 * Permite testar o fluxo completo no mobile sem backend:
 *   - Login (qualquer senha)
 *   - Grupos e produtos
 *   - Realizar pedidos (POST /vendas)
 *   - Ver conta, imprimir, fechar mesa (GET/POST caixa)
 *   - Logout
 * Para adicionar depois: fechar venda (endpoint específico do caixa).
 */

const MOCK_USER_EMAIL = 'teste@eatzgo.com';

export function isMockUser(email: string | undefined): boolean {
  return email?.toLowerCase() === MOCK_USER_EMAIL;
}

/** Gera um JWT mock válido para decode (header.payload.signature). Só ASCII no payload para btoa em RN. */
function createMockToken(): string {
  const payload = {
    id: 999,
    nome: 'Usuario Teste',
    nick: 'teste',
    email: MOCK_USER_EMAIL,
    nivel: 1,
    CDEMP: '1',
    exp: Math.floor(Date.now() / 1000) + 86400,
    iat: Math.floor(Date.now() / 1000),
  };
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadB64 = btoa(JSON.stringify(payload));
  const signature = btoa('mock-signature');
  return `${header}.${payloadB64}.${signature}`;
}

const MOCK_TOKEN = createMockToken();

const MOCK_EMPRESAS = [
  { cdemp: '1', nomeEmpresa: 'EatzGo Demo', token: MOCK_TOKEN },
];

const MOCK_MESAS = [
  { id: 1, mesa_cartao: 1, status: 'L' as const, nome: 'Mesa 1', cliente: '', obs: '' },
  { id: 2, mesa_cartao: 2, status: 'O' as const, nome: 'Mesa 2', cliente: 'Cliente A', obs: '' },
  { id: 3, mesa_cartao: 3, status: 'O' as const, nome: 'Mesa 3', cliente: '', obs: '' },
  { id: 4, mesa_cartao: 4, status: 'L' as const, nome: 'Mesa 4', cliente: '', obs: '' },
  { id: 5, mesa_cartao: 5, status: 'L' as const, nome: 'Mesa 5', cliente: '', obs: '' },
];

const MOCK_GRUPOS = [
  { id: 1, id_hostlocal: 1, cod_gp: 'BEB', nome: 'Bebidas', tipo: 'P', quantidadeItens: 4 },
  { id: 2, id_hostlocal: 2, cod_gp: 'LAN', nome: 'Lanches', tipo: 'P', quantidadeItens: 3 },
  { id: 3, id_hostlocal: 3, cod_gp: 'PIZ', nome: 'Pizzas', tipo: 'P', quantidadeItens: 2 },
];

const MOCK_PRODUTOS_BEB = [
  { id: 101, codm: '101', nome: 'Refrigerante Lata', des1: '350ml', pv: 5, preco: 5, status: 'C', grupoId: 1 },
  { id: 102, codm: '102', nome: 'Suco Natural', des1: '500ml', pv: 8, preco: 8, status: 'C', grupoId: 1 },
  { id: 103, codm: '103', nome: 'Água Mineral', des1: '500ml', pv: 3, preco: 3, status: 'C', grupoId: 1 },
  { id: 104, codm: '104', nome: 'Café Expresso', des1: '', pv: 4, preco: 4, status: 'C', grupoId: 1 },
];

const MOCK_PRODUTOS_LAN = [
  { id: 201, codm: '201', nome: 'X-Burger', des1: 'Pão, carne, queijo', pv: 18, preco: 18, status: 'C', grupoId: 2 },
  { id: 202, codm: '202', nome: 'X-Salada', des1: 'Pão, carne, queijo, salada', pv: 20, preco: 20, status: 'C', grupoId: 2 },
  { id: 203, codm: '203', nome: 'Batata Frita', des1: 'Porção 300g', pv: 12, preco: 12, status: 'C', grupoId: 2 },
];

const MOCK_PRODUTOS_PIZ = [
  { id: 301, codm: '301', nome: 'Pizza Margherita', des1: 'Molho, mussarela, tomate', pv: 45, preco: 45, status: 'C', grupoId: 3 },
  { id: 302, codm: '302', nome: 'Pizza Calabresa', des1: 'Molho, mussarela, calabresa', pv: 48, preco: 48, status: 'C', grupoId: 3 },
];

const PRODUTOS_POR_GRUPO: Record<string, typeof MOCK_PRODUTOS_BEB> = {
  BEB: MOCK_PRODUTOS_BEB,
  LAN: MOCK_PRODUTOS_LAN,
  PIZ: MOCK_PRODUTOS_PIZ,
};

const MOCK_USER_PROFILE = {
  id: 999,
  nome: 'Usuário Teste',
  nick: 'teste',
  email: MOCK_USER_EMAIL,
  nivel: 1,
  nivel_nome: 'Operador',
  CDEMP: '1',
};

const MOCK_PARAMETROS = [
  { id: 1, nome: 'Taxa de serviço permitida retirar', status: 'S' },
  { id: 2, nome: 'Permitir retirar taxa', status: 'S' },
];

/** Dados de conta por mesa (simplificado para mock). Mesa 2 e 3 podem ter itens. */
function getMockBillData(mesaCartao: number) {
  const vendas =
    mesaCartao === 2
      ? [
          {
            id_venda: 5001,
            produto: 'X-Burger',
            pv: 18,
            qtd: 1,
            totalItem: 18,
            codm: '201',
            codm_status: '',
            criadoem: '12:00',
            desconto: 0,
            id_user: 999,
            nick: 'teste',
          },
          {
            id_venda: 5002,
            produto: 'Refrigerante Lata',
            pv: 5,
            qtd: 2,
            totalItem: 10,
            codm: '101',
            codm_status: '',
            criadoem: '12:01',
            desconto: 0,
            id_user: 999,
            nick: 'teste',
          },
        ]
      : mesaCartao === 3
        ? [
            {
              id_venda: 5003,
              produto: 'Pizza Margherita',
              pv: 45,
              qtd: 1,
              totalItem: 45,
              codm: '301',
              codm_status: '',
              criadoem: '12:30',
              desconto: 0,
              id_user: 999,
              nick: 'teste',
            },
          ]
        : [];

  const soma = vendas.reduce((s, v) => s + (v.totalItem ?? 0), 0);
  const taxa_servico = 10; // 10%
  return {
    mesa: { mesa_numero: mesaCartao, qtd_pessoas: 0, id_cliente: 0, celular: '', obsmesa: '' },
    taxa_servico,
    vendas,
    antecipacoes: null as any,
  };
}

export interface MockResponse {
  data: any;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
}

/** Resposta de login mock (servidor 100% fake). Nunca chama o servidor real para teste@eatzgo.com. */
export function getMockLoginResponse(): MockResponse {
  return {
    data: {
      token: MOCK_TOKEN,
      empresas: MOCK_EMPRESAS,
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  };
}

/** Extrai o path da URL (relativo), aceitando baseURL completa (ex.: http://host:5001/login -> login). */
function getPathFromUrl(url: string): string {
  const withoutQuery = url?.split('?')[0] ?? '';
  if (withoutQuery.includes('://')) {
    const afterHost = withoutQuery.replace(/^[^:]+:\/\/[^/]+/, '');
    return afterHost.replace(/^\/+/, '').trim() || '';
  }
  return withoutQuery.replace(/^\/+/, '').trim() || '';
}

export async function getMockResponse(
  method: string,
  url: string,
  data?: any,
  userEmail?: string
): Promise<MockResponse | null> {
  const upperMethod = (method || 'get').toLowerCase();
  const path = getPathFromUrl(url ?? '');

  // Para login: email pode vir do body (userEmail é passado pelo adapter)
  const emailForMock = (userEmail ?? data?.email ?? '').toString().trim().toLowerCase();
  const isLoginPath = path === 'login' || path.endsWith('/login') || (path && path.includes('login'));
  if (isLoginPath && upperMethod === 'post') {
    if (emailForMock !== MOCK_USER_EMAIL) {
      if (__DEV__) console.log('[Mock] Login ignorado, email recebido:', emailForMock || '(vazio)');
      return null;
    }
    if (__DEV__) console.log('[Mock] Login OK para teste@eatzgo.com, retornando token mock');
    return {
      data: {
        token: MOCK_TOKEN,
        empresas: MOCK_EMPRESAS,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { method, url, data },
    };
  }

  if (!emailForMock || !isMockUser(emailForMock)) return null;

  const fakeConfig = { method, url, data };

  // GET /usuarios/:id
  if (upperMethod === 'get' && path.startsWith('usuarios/')) {
    return {
      data: MOCK_USER_PROFILE,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: fakeConfig,
    };
  }

  // GET /mesas
  if (upperMethod === 'get' && path === 'mesas') {
    const mesaCartao = url?.includes('mesa_cartao=')
      ? parseInt(url.split('mesa_cartao=')[1]?.split('&')[0] || '0', 10)
      : null;
    if (mesaCartao != null && !isNaN(mesaCartao)) {
      const mesa = MOCK_MESAS.find((m) => m.mesa_cartao === mesaCartao);
      return {
        data: mesa ? [mesa] : [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: fakeConfig,
      };
    }
    return {
      data: MOCK_MESAS,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: fakeConfig,
    };
  }

  // GET /grupos
  if (upperMethod === 'get' && path === 'grupos') {
    return {
      data: MOCK_GRUPOS,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: fakeConfig,
    };
  }

  // GET /produtos/grupopd/:codGp ou GET /produtos
  if (upperMethod === 'get') {
    if (path.startsWith('produtos/grupopd/')) {
      const codGp = path.replace('produtos/grupopd/', '').trim();
      const produtos = PRODUTOS_POR_GRUPO[codGp] || [];
      return {
        data: produtos,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: fakeConfig,
      };
    }
    if (path === 'produtos') {
      const all = [...MOCK_PRODUTOS_BEB, ...MOCK_PRODUTOS_LAN, ...MOCK_PRODUTOS_PIZ];
      return {
        data: all,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: fakeConfig,
      };
    }
    // GET /produtos/:codm/grupos-itens
    const matchRel = path.match(/^produtos\/([^/]+)\/grupos-itens$/);
    if (matchRel) {
      return {
        data: { grupos: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: fakeConfig,
      };
    }
  }

  // POST /vendas
  if (upperMethod === 'post' && path === 'vendas') {
    return {
      data: { ok: true, mensagem: 'Pedido registrado (mock)' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: fakeConfig,
    };
  }

  // GET /caixa/vendas/:mesaCartao
  if (upperMethod === 'get' && path.startsWith('caixa/vendas/')) {
    const mesaCartao = parseInt(path.replace('caixa/vendas/', ''), 10);
    if (!isNaN(mesaCartao)) {
      return {
        data: getMockBillData(mesaCartao),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: fakeConfig,
      };
    }
  }

  // POST /caixa/imprimir-conta
  if (upperMethod === 'post' && path === 'caixa/imprimir-conta') {
    return {
      data: { mensagem: 'Conta impressa (mock)' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: fakeConfig,
    };
  }

  // POST /caixa/fechar-mesa
  if (upperMethod === 'post' && path === 'caixa/fechar-mesa') {
    return {
      data: { ok: true, mensagem: 'Mesa fechada (mock)' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: fakeConfig,
    };
  }

  // GET /parametros
  if (upperMethod === 'get' && path === 'parametros') {
    return {
      data: MOCK_PARAMETROS,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: fakeConfig,
    };
  }

  // POST /logout
  if (upperMethod === 'post' && path === 'logout') {
    return {
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: fakeConfig,
    };
  }

  // GET /usuarios (lista - ex: ChangeWaiterModal)
  if (upperMethod === 'get' && path === 'usuarios') {
    return {
      data: [MOCK_USER_PROFILE],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: fakeConfig,
    };
  }

  return null;
}
