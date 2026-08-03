// Corresponde, de forma simplificada, aos LOVs lov_atvtip/lov_atvstat do legado.
export enum TipoAtividade {
  LIGACAO = 'LIGACAO',
  REUNIAO = 'REUNIAO',
  EMAIL = 'EMAIL',
  VISITA = 'VISITA',
  TAREFA = 'TAREFA',
}

export enum StatusAtividade {
  PENDENTE = 'PENDENTE',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}
