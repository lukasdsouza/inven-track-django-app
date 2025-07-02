import { useState } from 'react';
import { useEstoque } from '@/hooks/useEstoque';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Package, 
  Edit, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ItemInventario } from '@/types/estoque';

export function Inventario() {
  const { items, removerItem } = useEstoque();
  const { canAdd, canDelete } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Filtrar itens
  const filteredItems = items.filter(item => {
    const matchesSearch = item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || item.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obter categorias únicas
  const categories = Array.from(new Set(items.map(item => item.categoria))).filter(Boolean);

  const handleRemoverItem = (item: ItemInventario) => {
    if (window.confirm(`Tem certeza que deseja remover "${item.material}"?`)) {
      removerItem(item.id);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventário</h1>
          <p className="text-muted-foreground">Gerencie todos os itens do estoque</p>
        </div>
        {canAdd() && (
          <Link to="/inventario/adicionar">
            <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </Link>
        )}
      </div>

      {/* Filtros */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por material ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
              >
                Todas
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <div className="grid gap-4">
        {filteredItems.length === 0 ? (
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
              {items.length === 0 && (
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
          filteredItems.map((item) => (
            <Card key={item.id} className="border-border bg-card hover:shadow-card transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{item.material}</h3>
                      <Badge variant="outline">{item.categoria}</Badge>
                      {item.quantidade <= 5 && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Estoque Baixo
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>Quantidade: <span className="font-medium text-foreground">{item.quantidade}</span></span>
                      <span>Atualizado: {new Date(item.updatedAt).toLocaleDateString('pt-BR')}</span>
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
          ))
        )}
      </div>
      
      {/* Resumo */}
      {filteredItems.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Mostrando {filteredItems.length} de {items.length} itens
              </span>
              <span className="text-muted-foreground">
                Total em estoque: {filteredItems.reduce((sum, item) => sum + item.quantidade, 0)} unidades
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}