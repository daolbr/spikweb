// Estágios do funil de vendas, correspondendo (de forma simplificada) à
// antiga SPM_FUNIL / lov_opostat do legado. GANHA e PERDIDA são estágios
// terminais: uma oportunidade não volta deles para os estágios ativos.
export enum EstagioFunil {
  PROSPECCAO = 'PROSPECCAO',
  QUALIFICACAO = 'QUALIFICACAO',
  PROPOSTA = 'PROPOSTA',
  NEGOCIACAO = 'NEGOCIACAO',
  GANHA = 'GANHA',
  PERDIDA = 'PERDIDA',
}

export const ESTAGIOS_ATIVOS = [
  EstagioFunil.PROSPECCAO,
  EstagioFunil.QUALIFICACAO,
  EstagioFunil.PROPOSTA,
  EstagioFunil.NEGOCIACAO,
];

export const ESTAGIOS_TERMINAIS = [EstagioFunil.GANHA, EstagioFunil.PERDIDA];
