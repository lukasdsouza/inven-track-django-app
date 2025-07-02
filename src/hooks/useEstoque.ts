import { useState, useEffect } from 'react';
import { ItemInventario, Movimento, EstoqueStats } from '@/types/estoque';

const STORAGE_KEY_ITEMS = 'estoque_items';
const STORAGE_KEY_MOVIMENTOS = 'estoque_movimentos';

export function useEstoque() {
  const [items, setItems] = useState<ItemInventario[]>([]);
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do localStorage
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(STORAGE_KEY_ITEMS);
      const savedMovimentos = localStorage.getItem(STORAGE_KEY_MOVIMENTOS);

      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
      if (savedMovimentos) {
        setMovimentos(JSON.parse(savedMovimentos));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar items no localStorage
  const saveItems = (newItems: ItemInventario[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(newItems));
      setItems(newItems);
    } catch (error) {
      console.error('Erro ao salvar items:', error);
    }
  };

  // Salvar movimentos no localStorage
  const saveMovimentos = (newMovimentos: Movimento[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_MOVIMENTOS, JSON.stringify(newMovimentos));
      setMovimentos(newMovimentos);
    } catch (error) {
      console.error('Erro ao salvar movimentos:', error);
    }
  };

  // Adicionar item
  const adicionarItem = (itemData: Omit<ItemInventario, 'id' | 'createdAt' | 'updatedAt'>) => {
    const novoItem: ItemInventario = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const newItems = [...items, novoItem];
    saveItems(newItems);
    return novoItem;
  };

  // Atualizar item
  const atualizarItem = (id: string, itemData: Partial<ItemInventario>) => {
    const newItems = items.map(item => 
      item.id === id 
        ? { ...item, ...itemData, updatedAt: new Date().toISOString() }
        : item
    );
    saveItems(newItems);
  };

  // Remover item
  const removerItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    const newMovimentos = movimentos.filter(movimento => movimento.itemId !== id);
    
    saveItems(newItems);
    saveMovimentos(newMovimentos);
  };

  // Registrar movimento
  const registrarMovimento = (movimentoData: Omit<Movimento, 'id' | 'horario'>) => {
    const item = items.find(i => i.id === movimentoData.itemId);
    if (!item) {
      throw new Error('Item não encontrado');
    }

    // Validar quantidade para saída
    if (movimentoData.tipo === 'saida' && item.quantidade < movimentoData.quantidade) {
      throw new Error(`Quantidade insuficiente. Disponível: ${item.quantidade}`);
    }

    const novoMovimento: Movimento = {
      ...movimentoData,
      id: Date.now().toString(),
      horario: new Date().toISOString(),
    };

    // Atualizar quantidade do item
    const novaQuantidade = movimentoData.tipo === 'entrada' 
      ? item.quantidade + movimentoData.quantidade
      : item.quantidade - movimentoData.quantidade;

    atualizarItem(movimentoData.itemId, { quantidade: novaQuantidade });

    const newMovimentos = [novoMovimento, ...movimentos];
    saveMovimentos(newMovimentos);
    
    return novoMovimento;
  };

  // Obter estatísticas
  const getEstatisticas = (): EstoqueStats => {
    const totalItens = items.reduce((sum, item) => sum + item.quantidade, 0);
    const itensEstoqueBaixo = items.filter(item => item.quantidade <= 5).length;
    
    return {
      totalItens,
      totalMovimentacoes: movimentos.length,
      itensEstoqueBaixo,
      valorTotalEstoque: items.length,
    };
  };

  // Limpar todos os dados
  const limparEstoque = () => {
    localStorage.removeItem(STORAGE_KEY_ITEMS);
    localStorage.removeItem(STORAGE_KEY_MOVIMENTOS);
    setItems([]);
    setMovimentos([]);
  };

  return {
    items,
    movimentos,
    loading,
    adicionarItem,
    atualizarItem,
    removerItem,
    registrarMovimento,
    getEstatisticas,
    limparEstoque,
  };
}