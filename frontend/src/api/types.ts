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

export type PorteEmpresa = 'MEI' | 'MICRO' | 'PEQUENA' | 'MEDIA' | 'GRANDE';

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string | null;
  segmento: string | null;
  porte: PorteEmpresa | null;
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
  valor: number | string | null;
  confiabilidade: number | null;
  previsaoFechamento: string | null;
  classificacao: 'A' | 'B' | 'C' | null;
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
  atualizadoEm: string;
  confiabilidade: number | null;
  classificacao: 'A' | 'B' | 'C' | null;
  vendedorId: string | null;
  vendedor?: { id: string; nome: string } | null;
  especialistaId: string | null;
  especialista?: { id: string; nome: string } | null;
  vertical: string | null;
  propostaArquivoNome: string | null;
  propostaArquivoTipo: string | null;
}

export type FunilAgrupado = Record<EstagioFunil, Oportunidade[]>;

export type TipoAtividade = 'LIGACAO' | 'REUNIAO' | 'EMAIL' | 'VISITA' | 'TAREFA' | 'PROSPECCAO' | 'FIDELIZACAO';
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

export interface ResumoIndicadores {
  pipeline: {
    valorAtivo: number;
    quantidadeAtiva: number;
    porEstagio: Record<EstagioFunil, { total: number; quantidade: number }>;
  };
  conversao: { ganhas: number; perdidas: number; taxa: number | null };
  atividades: { pendentes: number; concluidas: number; atrasadas: number };
}

export type EntidadeCustomizavel = 'EMPRESA' | 'CONTATO' | 'OPORTUNIDADE' | 'ATIVIDADE' | 'PROPOSTA';
export type TipoCampoCustomizado = 'TEXTO' | 'NUMERO' | 'DATA' | 'LISTA' | 'BOOLEANO';

export interface PermissaoCampo {
  id?: string;
  papel: 'ADMIN' | 'GESTOR' | 'VENDEDOR';
  podeVer: boolean;
  podeEditar: boolean;
}

export interface CampoCustomizado {
  id: string;
  entidade: EntidadeCustomizavel;
  nome: string;
  rotulo: string;
  tipo: TipoCampoCustomizado;
  opcoesLista: string | null;
  obrigatorio: boolean;
  ordem: number;
  ativo: boolean;
  permissoes?: PermissaoCampo[];
  criadoEm: string;
}

export interface CampoComValor {
  id: string;
  nome: string;
  rotulo: string;
  tipo: TipoCampoCustomizado;
  opcoesLista: string | null;
  obrigatorio: boolean;
  ordem: number;
  podeEditar: boolean;
  valor: string | null;
}

export interface UsuarioResumo {
  id: string;
  nome: string;
  email: string;
  papel: 'ADMIN' | 'GESTOR' | 'VENDEDOR';
}

export interface QuadroTotais {
  geral: { total: number; valorTotal: number };
  porClasse: Record<'A' | 'B' | 'C' | 'SEM_CLASSE', { total: number; valorTotal: number; confiabilidadeMedia: number }>;
}

export interface BaseInstaladaItem {
  id: string;
  produtoServico: string;
  empresaId: string;
  empresa?: Empresa;
  oportunidadeId: string | null;
  oportunidade?: { id: string; titulo: string } | null;
  dataVenda: string;
  dataRenovacao: string | null;
  valor: number | string | null;
  observacoes: string | null;
  criadoEm: string;
}

export interface RankingAtributo {
  valor: string;
  vitorias: number;
  valorTotal: number;
}

export interface PerfilIdeal {
  porPorte: RankingAtributo[];
  porSegmento: RankingAtributo[];
  porUf: RankingAtributo[];
}

export interface ProspectSugerido {
  empresa: Empresa;
  pontuacao: number;
  atributosCompativeis: string[];
}
