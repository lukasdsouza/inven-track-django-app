import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstoque } from '@/hooks/useEstoque';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Save,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Movimentacao() {
  const { items, registrarMovimento } = useEstoque();
  const { canAdd } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirecionar se não pode adicionar
  if (!canAdd()) {
    return (
      <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para registrar movimentações.
          </p>
          <Link to="/">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const [formData, setFormData] = useState({
    itemId: '',
    tipo: 'entrada' as 'entrada' | 'saida',
    quantidade: '',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);

  const selectedItem = items.find(item => item.id === formData.itemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.itemId || !formData.quantidade) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const quantidade = parseInt(formData.quantidade);
    if (quantidade <= 0) {
      toast({
        title: "Erro",
        description: "A quantidade deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      await registrarMovimento({
        itemId: formData.itemId,
        material: selectedItem?.material || '',
        tipo: formData.tipo,
        quantidade,
        observacoes: formData.observacoes || undefined
      });

      toast({
        title: "Sucesso!",
        description: `Movimentação de ${formData.tipo} registrada com sucesso.`,
      });

      // Reset form
      setFormData({
        itemId: '',
        tipo: 'entrada',
        quantidade: '',
        observacoes: ''
      });

      // Redirect to dashboard
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao registrar movimentação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nova Movimentação</h1>
          <p className="text-muted-foreground">Registre entradas e saídas de materiais</p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Dados da Movimentação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Movimentação */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Tipo de Movimentação</Label>
              <RadioGroup
                value={formData.tipo}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as 'entrada' | 'saida' }))}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="entrada" id="entrada" />
                  <Label htmlFor="entrada" className="flex items-center gap-2 cursor-pointer">
                    <TrendingUp className="h-4 w-4 text-success" />
                    Entrada
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="saida" id="saida" />
                  <Label htmlFor="saida" className="flex items-center gap-2 cursor-pointer">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    Saída
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Seleção do Item */}
            <div className="space-y-2">
              <Label htmlFor="item">Material *</Label>
              {items.length === 0 ? (
                <div className="p-4 border border-dashed border-border rounded-lg text-center">
                  <p className="text-muted-foreground mb-2">Nenhum item cadastrado</p>
                  <Link to="/inventario/adicionar">
                    <Button variant="outline" size="sm">
                      Cadastrar Primeiro Item
                    </Button>
                  </Link>
                </div>
              ) : (
                <Select value={formData.itemId} onValueChange={(value) => setFormData(prev => ({ ...prev, itemId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um material" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{item.material}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({item.quantidade} em estoque)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Informações do Item Selecionado */}
            {selectedItem && (
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Categoria:</span>
                    <p className="font-medium">{selectedItem.categoria}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estoque Atual:</span>
                    <p className="font-medium">{selectedItem.quantidade} unidades</p>
                  </div>
                </div>
                {formData.tipo === 'saida' && selectedItem.quantidade <= 5 && (
                  <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded text-sm text-warning">
                    ⚠️ Atenção: Este item está com estoque baixo
                  </div>
                )}
              </div>
            )}

            {/* Quantidade */}
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={formData.quantidade}
                onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
                placeholder="Digite a quantidade"
              />
              {formData.tipo === 'saida' && selectedItem && formData.quantidade && 
               parseInt(formData.quantidade) > selectedItem.quantidade && (
                <p className="text-sm text-destructive">
                  Quantidade maior que o estoque disponível ({selectedItem.quantidade})
                </p>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações opcionais sobre a movimentação..."
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading || items.length === 0}
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Registrando...' : 'Registrar Movimentação'}
              </Button>
              <Link to="/">
                <Button variant="outline" disabled={loading}>
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}