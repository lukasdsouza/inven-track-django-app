export interface ItemInventario {
  id: string;
  categoria: string;
  material: string;
  quantidade: number;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Movimento {
  id: string;
  itemId: string;
  material: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  horario: string;
  observacoes?: string;
}

export interface EstoqueStats {
  totalItens: number;
  totalMovimentacoes: number;
  itensEstoqueBaixo: number;
  valorTotalEstoque: number;
}

export interface MovimentoForm {
  itemId: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  observacoes?: string;
}

export interface ItemForm {
  categoria: string;
  material: string;
  quantidade: number;
  observacoes?: string;
}