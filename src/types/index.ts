export interface User {
  id: number;
  nome: string;
  nick: string;
  email: string;
  nivel: number;
  CDEMP?: string;
}

export interface Empresa {
  cdemp: string;
  nomeEmpresa: string;
  token: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  empresas: Empresa[];
  decodedToken: User;
}

export interface CartItem {
  uuid: string;
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  quantidade: number;
  observacao?: string;
  codm?: string;
  pv?: number;
  codm_status?: string;
  codm_relacional?: string;
  uuid_principal?: string;
  relacionais?: CartItem[];
  fractionQty?: number;
  fractionLabel?: string;
  quantity?: number;
}

export interface Table {
  id: number;
  numero: string;
  nome?: string;
  status?: string;
}

export interface Product {
  id?: number;
  codm?: string;
  nome?: string;
  des1?: string;
  des2?: string;
  descricao?: string;
  preco?: number;
  pv?: number;
  grupo?: string;
  grupoId?: number;
  status?: string;
}

export interface ProductGroup {
  id: number;
  id_hostlocal?: number;
  cod_gp: string;
  nome: string;
  tipo?: string;
  quantidadeItens?: number;
  imagem?: string;
}

