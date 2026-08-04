import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
// A sintaxe acima cobre a interop CJS/ESM da lib pdfkit sem exigir
// esModuleInterop no tsconfig do projeto.
import { Proposta } from './proposta.entity';

function formatarMoeda(valor: number | string) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(valor: string | Date | null) {
  if (!valor) return '—';
  return new Date(valor).toLocaleDateString('pt-BR');
}

@Injectable()
export class PropostaPdfService {
  // Monta um PDF de proposta comercial pronto para envio ao cliente —
  // o equivalente direto ao relatório de Crystal Reports do sistema legado.
  gerar(proposta: Proposta): PDFKit.PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc
      .fontSize(20)
      .fillColor('#17594A')
      .text('Proposta Comercial', { align: 'left' })
      .moveDown(0.2);

    doc
      .fontSize(10)
      .fillColor('#56534A')
      .text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`)
      .moveDown(1);

    doc
      .fontSize(14)
      .fillColor('#1C1B18')
      .text(proposta.titulo)
      .moveDown(0.5);

    doc.fontSize(10).fillColor('#56534A');
    doc.text(`Cliente: ${proposta.empresa?.nome ?? '—'}`);
    if (proposta.contato) doc.text(`Contato: ${proposta.contato.nome}`);
    doc.text(`Status: ${proposta.status}`);
    doc.text(`Validade: ${formatarData(proposta.validade)}`);
    doc.moveDown(1);

    // Cabeçalho da tabela de itens
    const colDescricao = 50;
    const colQtd = 320;
    const colUnit = 390;
    const colSubtotal = 470;
    let y = doc.y;

    doc.fontSize(10).fillColor('#1C1B18');
    doc.text('Descrição', colDescricao, y);
    doc.text('Qtd.', colQtd, y);
    doc.text('Valor unit.', colUnit, y);
    doc.text('Subtotal', colSubtotal, y);
    y += 18;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#E3DFD2').stroke();
    y += 8;

    doc.fontSize(10).fillColor('#3D3D3A');
    for (const item of proposta.itens ?? []) {
      const subtotal = Number(item.quantidade) * Number(item.valorUnitario);
      doc.text(item.descricao, colDescricao, y, { width: 260 });
      doc.text(String(item.quantidade), colQtd, y);
      doc.text(formatarMoeda(item.valorUnitario), colUnit, y);
      doc.text(formatarMoeda(subtotal), colSubtotal, y);
      y += 20;
    }

    y += 10;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#E3DFD2').stroke();
    y += 12;

    doc
      .fontSize(12)
      .fillColor('#17594A')
      .text(`Total: ${formatarMoeda(proposta.valorTotal)}`, colUnit, y);

    if (proposta.observacoes) {
      doc.moveDown(3);
      doc.fontSize(10).fillColor('#1C1B18').text('Observações', { underline: true });
      doc.fontSize(10).fillColor('#56534A').text(proposta.observacoes);
    }

    doc.end();
    return doc;
  }
}
