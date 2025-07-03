import { useEffect } from 'react';
import { useEstoque } from '@/hooks/useEstoque';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  BarChart3,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { items, movimentos, getEstatisticas, adicionarItem } = useEstoque();
  const stats = getEstatisticas();

  // Importar dados iniciais se o estoque estiver vazio
  useEffect(() => {
    const importarDados = async () => {
      if (items.length === 0) {
        try {
          const { estoqueInicial } = await import('@/data/estoque-inicial');
          estoqueInicial.forEach(item => {
            adicionarItem(item);
          });
        } catch (error) {
          console.error('Erro ao importar dados iniciais:', error);
        }
      }
    };
    importarDados();
  }, [items.length, adicionarItem]);

  const movimentosRecentes = movimentos.slice(0, 5);
  const itensEstoqueBaixo = items.filter(item => item.quantidade <= 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema de estoque</p>
        </div>
        <Link to="/movimentacao">
          <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nova Movimentação</span>
            <span className="sm:hidden">Nova Mov.</span>
          </Button>
        </Link>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card hover:shadow-card transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Itens
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalItens}</div>
            <p className="text-xs text-muted-foreground">
              {items.length} tipos de materiais
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-card transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Movimentações
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalMovimentacoes}</div>
            <p className="text-xs text-muted-foreground">
              Total de transações
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-card transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estoque Baixo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.itensEstoqueBaixo}</div>
            <p className="text-xs text-muted-foreground">
              Itens com ≤ 5 unidades
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-card transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Materiais Únicos
            </CardTitle>
            <Package className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{items.length}</div>
            <p className="text-xs text-muted-foreground">
              Tipos cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Movimentações Recentes */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Movimentações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {movimentosRecentes.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma movimentação registrada
                </p>
              ) : (
                movimentosRecentes.map((movimento) => (
                  <div key={movimento.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {movimento.tipo === 'entrada' ? (
                        <TrendingUp className="h-4 w-4 text-success flex-shrink-0" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{movimento.material}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(movimento.horario).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={movimento.tipo === 'entrada' ? 'default' : 'destructive'}>
                        {movimento.tipo === 'entrada' ? '+' : '-'}{movimento.quantidade}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
              {movimentos.length > 5 && (
                <Link to="/historico">
                  <Button variant="outline" className="w-full">
                    Ver Todo Histórico
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Itens com Estoque Baixo */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {itensEstoqueBaixo.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Todos os itens estão com estoque adequado
                </p>
              ) : (
                itensEstoqueBaixo.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20 min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{item.material}</p>
                      <p className="text-sm text-muted-foreground">{item.categoria}</p>
                    </div>
                    <Badge variant="outline" className="text-warning border-warning">
                      {item.quantidade} unidades
                    </Badge>
                  </div>
                ))
              )}
              {itensEstoqueBaixo.length > 0 && (
                <Link to="/inventario">
                  <Button variant="outline" className="w-full">
                    Gerenciar Inventário
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}