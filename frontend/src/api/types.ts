export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: 'ADMIN' | 'GESTOR' | 'VENDEDOR';
}

export interface Contato {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  cargo: string | null;
  empresaId: string;
  criadoEm: string;
}

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string | null;
  segmento: string | null;
  cidade: string | null;
  uf: string | null;
  telefone: string | null;
  site: string | null;
  observacoes: string | null;
  contatos?: Contato[];
  criadoEm: string;
}

export interface ListaEmpresas {
  dados: Empresa[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
}

export type EstagioFunil =
  | 'PROSPECCAO'
  | 'QUALIFICACAO'
  | 'PROPOSTA'
  | 'NEGOCIACAO'
  | 'GANHA'
  | 'PERDIDA';

export interface HistoricoOportunidade {
  id: string;
  anotacao: string;
  estagioNoMomento: string | null;
  criadoEm: string;
}

export interface Oportunidade {
  id: string;
  titulo: string;
  empresaId: string;
  empresa?: Empresa;
  contatoId: string | null;
  contato?: Contato | null;
  estagio: EstagioFunil;
  valor: number | string;
  previsaoFechamento: string | null;
  origem: string | null;
  motivoPerda: string | null;
  historico?: HistoricoOportunidade[];
  criadoEm: string;
}

export type FunilAgrupado = Record<EstagioFunil, Oportunidade[]>;

export type TipoAtividade = 'LIGACAO' | 'REUNIAO' | 'EMAIL' | 'VISITA' | 'TAREFA';
export type StatusAtividade = 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA';

export interface Atividade {
  id: string;
  titulo: string;
  tipo: TipoAtividade;
  status: StatusAtividade;
  empresaId: string;
  empresa?: Empresa;
  contatoId: string | null;
  contato?: Contato | null;
  oportunidadeId: string | null;
  oportunidade?: Oportunidade | null;
  dataInicio: string;
  dataFim: string | null;
  dataConclusao: string | null;
  notas: string | null;
  criadoEm: string;
}

export type StatusProposta = 'RASCUNHO' | 'ENVIADA' | 'APROVADA' | 'RECUSADA';

export interface ItemProposta {
  id: string;
  descricao: string;
  quantidade: number | string;
  valorUnitario: number | string;
}

export interface Proposta {
  id: string;
  titulo: string;
  empresaId: string;
  empresa?: Empresa;
  status: StatusProposta;
  validade: string | null;
  valorTotal: number | string;
  observacoes: string | null;
  itens?: ItemProposta[];
  criadoEm: string;
}

export type StatusCampanha = 'PLANEJADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';

export interface Campanha {
  id: string;
  nome: string;
  status: StatusCampanha;
  dataInicio: string | null;
  dataFim: string | null;
  orcamento: number | string | null;
  descricao: string | null;
  criadoEm: string;
}

export type StatusProjeto = 'PLANEJADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';

export interface Projeto {
  id: string;
  nome: string;
  empresaId: string;
  empresa?: Empresa;
  status: StatusProjeto;
  dataInicio: string | null;
  dataFim: string | null;
  descricao: string | null;
  criadoEm: string;
}

export interface ResumoIndicadores {
  pipeline: {
    valorAtivo: number;
    quantidadeAtiva: number;
    porEstagio: Record<EstagioFunil, { total: number; quantidade: number }>;
  };
  conversao: { ganhas: number; perdidas: number; taxa: number | null };
  atividades: { pendentes: number; concluidas: number; atrasadas: number };
  receita: { propostasAprovadas: number; valorAprovado: number };
}
