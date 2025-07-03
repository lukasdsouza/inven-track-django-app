import { useState, useMemo } from 'react';
import { useEstoque } from '@/hooks/useEstoque';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Package, 
  Edit, 
  Trash2,
  AlertTriangle,
  Filter,
  X,
  SortAsc,
  SortDesc,
  Grid,
  List
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ItemInventario } from '@/types/estoque';

type SortOption = 'material' | 'categoria' | 'quantidade' | 'updated';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export function Inventario() {
  const { items, removerItem } = useEstoque();
  const { canAdd, canDelete } = useAuth();
  
  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'normal'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('material');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Obter categorias únicas
  const categories = useMemo(() => 
    Array.from(new Set(items.map(item => item.categoria))).filter(Boolean).sort(),
    [items]
  );

  // Filtrar e ordenar itens
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item => {
      const matchesSearch = item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.observacoes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || item.categoria === selectedCategory;
      
      const matchesStock = stockFilter === 'all' || 
                          (stockFilter === 'low' && item.quantidade <= 5) ||
                          (stockFilter === 'normal' && item.quantidade > 5);
      
      return matchesSearch && matchesCategory && matchesStock;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'material':
          aValue = a.material.toLowerCase();
          bValue = b.material.toLowerCase();
          break;
        case 'categoria':
          aValue = a.categoria.toLowerCase();
          bValue = b.categoria.toLowerCase();
          break;
        case 'quantidade':
          aValue = a.quantidade;
          bValue = b.quantidade;
          break;
        case 'updated':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          aValue = a.material.toLowerCase();
          bValue = b.material.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [items, searchTerm, selectedCategory, stockFilter, sortBy, sortDirection]);

  const handleRemoverItem = (item: ItemInventario) => {
    if (window.confirm(`Tem certeza que deseja remover "${item.material}"?`)) {
      removerItem(item.id);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setStockFilter('all');
    setSortBy('material');
    setSortDirection('asc');
  };

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== '' || stockFilter !== 'all' || 
                          sortBy !== 'material' || sortDirection !== 'asc';

  const lowStockCount = items.filter(item => item.quantidade <= 5).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Inventário</h1>
          <p className="text-muted-foreground">
            Gerencie todos os itens do estoque
            {lowStockCount > 0 && (
              <span className="ml-2 text-destructive font-medium">
                • {lowStockCount} item{lowStockCount > 1 ? 'ns' : ''} com estoque baixo
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Toggle de visualização */}
          <div className="flex rounded-lg border border-border p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {canAdd() && (
            <Link to="/inventario/adicionar">
              <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Adicionar Item</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Busca principal */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por material, categoria ou observações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="whitespace-nowrap"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                      !
                    </Badge>
                  )}
                </Button>
                
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            {/* Filtros expandidos */}
            {showFilters && (
              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-border sm:grid-cols-2 lg:grid-cols-4">
                {/* Categoria */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Categoria</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status do estoque */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status do Estoque</label>
                  <Select value={stockFilter} onValueChange={(value: 'all' | 'low' | 'normal') => setStockFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="low">Estoque Baixo (≤5)</SelectItem>
                      <SelectItem value="normal">Estoque Normal (&gt;5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordenar por */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Ordenar por</label>
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="categoria">Categoria</SelectItem>
                      <SelectItem value="quantidade">Quantidade</SelectItem>
                      <SelectItem value="updated">Última Atualização</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Direção da ordenação */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Direção</label>
                  <Button
                    variant="outline"
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                    className="w-full justify-start"
                  >
                    {sortDirection === 'asc' ? (
                      <><SortAsc className="h-4 w-4 mr-2" />Crescente</>
                    ) : (
                      <><SortDesc className="h-4 w-4 mr-2" />Decrescente</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <div className="space-y-4">
        {filteredAndSortedItems.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {items.length === 0 ? 'Nenhum item cadastrado' : 'Nenhum item encontrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {items.length === 0 
                  ? 'Comece adicionando o primeiro item ao seu inventário'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
              {items.length === 0 && canAdd() && (
                <Link to="/inventario/adicionar">
                  <Button className="bg-gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Item
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedItems.map((item) => (
                  <Card key={item.id} className="border-border bg-card hover:shadow-card transition-all duration-300 h-fit">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-foreground truncate">
                              {item.material}
                            </h3>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {item.categoria}
                            </Badge>
                          </div>
                          {item.quantidade <= 5 && (
                            <Badge variant="destructive" className="flex items-center gap-1 ml-2">
                              <AlertTriangle className="h-3 w-3" />
                              Baixo
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Quantidade:</span>
                            <span className="font-medium text-foreground">{item.quantidade}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Atualizado:</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        
                        {item.observacoes && (
                          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                            <strong>Obs:</strong> {item.observacoes}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-end gap-2 pt-2">
                          {canAdd() && (
                            <Link to={`/inventario/${item.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {canDelete() && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoverItem(item)}
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAndSortedItems.map((item) => (
                  <Card key={item.id} className="border-border bg-card hover:shadow-card transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-base font-semibold text-foreground truncate">
                              {item.material}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {item.categoria}
                            </Badge>
                            {item.quantidade <= 5 && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Estoque Baixo
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span>
                              Quantidade: <span className="font-medium text-foreground">{item.quantidade}</span>
                            </span>
                            <span>
                              Atualizado: {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          
                          {item.observacoes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Obs:</strong> {item.observacoes}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {canAdd() && (
                            <Link to={`/inventario/${item.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {canDelete() && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoverItem(item)}
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Resumo */}
      {filteredAndSortedItems.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:justify-between sm:items-center">
              <span className="text-muted-foreground">
                Mostrando {filteredAndSortedItems.length} de {items.length} itens
              </span>
              <span className="text-muted-foreground">
                Total em estoque: {filteredAndSortedItems.reduce((sum, item) => sum + item.quantidade, 0)} unidades
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}