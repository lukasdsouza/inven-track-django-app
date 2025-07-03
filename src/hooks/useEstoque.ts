import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ItemInventario, Movimento, EstoqueStats } from '@/types/estoque';

export function useEstoque() {
  const [items, setItems] = useState<ItemInventario[]>([]);
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do Supabase
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar items
      const { data: itemsData, error: itemsError } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (itemsError) throw itemsError;
      
      // Carregar movimentos
      const { data: movimentosData, error: movimentosError } = await supabase
        .from('inventory_movements')
        .select('*')
        .order('horario', { ascending: false });
      
      if (movimentosError) throw movimentosError;
      
      // Mapear dados do Supabase para o formato da aplicação
      const mappedItems: ItemInventario[] = (itemsData || []).map(item => ({
        id: item.id,
        categoria: item.categoria,
        material: item.material,
        quantidade: item.quantidade,
        observacoes: item.observacoes,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      const mappedMovimentos: Movimento[] = (movimentosData || []).map(movimento => ({
        id: movimento.id,
        itemId: movimento.item_id,
        material: movimento.material,
        tipo: movimento.tipo as 'entrada' | 'saida',
        quantidade: movimento.quantidade,
        horario: movimento.horario,
        observacoes: movimento.observacoes
      }));
      
      setItems(mappedItems);
      setMovimentos(mappedMovimentos);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Adicionar item
  const adicionarItem = async (itemData: Omit<ItemInventario, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          categoria: itemData.categoria,
          material: itemData.material,
          quantidade: itemData.quantidade,
          observacoes: itemData.observacoes
        })
        .select()
        .single();

      if (error) throw error;

      const novoItem: ItemInventario = {
        id: data.id,
        categoria: data.categoria,
        material: data.material,
        quantidade: data.quantidade,
        observacoes: data.observacoes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setItems(prev => [novoItem, ...prev]);
      return novoItem;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      throw error;
    }
  };

  // Atualizar item
  const atualizarItem = async (id: string, itemData: Partial<ItemInventario>) => {
    try {
      const updateData: any = {};
      if (itemData.categoria !== undefined) updateData.categoria = itemData.categoria;
      if (itemData.material !== undefined) updateData.material = itemData.material;
      if (itemData.quantidade !== undefined) updateData.quantidade = itemData.quantidade;
      if (itemData.observacoes !== undefined) updateData.observacoes = itemData.observacoes;

      const { data, error } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const itemAtualizado: ItemInventario = {
        id: data.id,
        categoria: data.categoria,
        material: data.material,
        quantidade: data.quantidade,
        observacoes: data.observacoes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setItems(prev => prev.map(item => 
        item.id === id ? itemAtualizado : item
      ));
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      throw error;
    }
  };

  // Remover item
  const removerItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      setMovimentos(prev => prev.filter(movimento => movimento.itemId !== id));
    } catch (error) {
      console.error('Erro ao remover item:', error);
      throw error;
    }
  };

  // Registrar movimento
  const registrarMovimento = async (movimentoData: Omit<Movimento, 'id' | 'horario'>) => {
    try {
      const item = items.find(i => i.id === movimentoData.itemId);
      if (!item) {
        throw new Error('Item não encontrado');
      }

      // Validar quantidade para saída
      if (movimentoData.tipo === 'saida' && item.quantidade < movimentoData.quantidade) {
        throw new Error(`Quantidade insuficiente. Disponível: ${item.quantidade}`);
      }

      // Calcular nova quantidade
      const novaQuantidade = movimentoData.tipo === 'entrada' 
        ? item.quantidade + movimentoData.quantidade
        : item.quantidade - movimentoData.quantidade;

      // Inserir movimento
      const { data: movimentoInsert, error: movimentoError } = await supabase
        .from('inventory_movements')
        .insert({
          item_id: movimentoData.itemId,
          material: movimentoData.material,
          tipo: movimentoData.tipo,
          quantidade: movimentoData.quantidade,
          observacoes: movimentoData.observacoes
        })
        .select()
        .single();

      if (movimentoError) throw movimentoError;

      // Atualizar quantidade do item
      await atualizarItem(movimentoData.itemId, { quantidade: novaQuantidade });

      const novoMovimento: Movimento = {
        id: movimentoInsert.id,
        itemId: movimentoInsert.item_id,
        material: movimentoInsert.material,
        tipo: movimentoInsert.tipo as 'entrada' | 'saida',
        quantidade: movimentoInsert.quantidade,
        horario: movimentoInsert.horario,
        observacoes: movimentoInsert.observacoes
      };

      setMovimentos(prev => [novoMovimento, ...prev]);
      return novoMovimento;
    } catch (error) {
      console.error('Erro ao registrar movimento:', error);
      throw error;
    }
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
  const limparEstoque = async () => {
    try {
      // Limpar movimentos primeiro devido à foreign key
      await supabase.from('inventory_movements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('inventory_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      setItems([]);
      setMovimentos([]);
    } catch (error) {
      console.error('Erro ao limpar estoque:', error);
      throw error;
    }
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
    loadData,
  };
}