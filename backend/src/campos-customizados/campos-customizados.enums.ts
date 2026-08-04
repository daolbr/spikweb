// Este é o motor de metadados do sistema — equivalente moderno e seguro
// do antigo SPM_DICTAB/SPM_DICCAMPO/SPM_RESTRITAB do Spik legado.
// Em vez de montar SQL dinamicamente (como o VB6 fazia, com risco de
// SQL Injection), os campos customizados vivem em uma tabela de valores
// separada (padrão Entity-Attribute-Value) e as permissões são checadas
// no backend antes de qualquer leitura/escrita.

export enum EntidadeCustomizavel {
  EMPRESA = 'EMPRESA',
  CONTATO = 'CONTATO',
  OPORTUNIDADE = 'OPORTUNIDADE',
  ATIVIDADE = 'ATIVIDADE',
  PROPOSTA = 'PROPOSTA',
}

export enum TipoCampoCustomizado {
  TEXTO = 'TEXTO',
  NUMERO = 'NUMERO',
  DATA = 'DATA',
  LISTA = 'LISTA',
  BOOLEANO = 'BOOLEANO',
}
