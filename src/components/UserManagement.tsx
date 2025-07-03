import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, USERS } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Edit, Trash2, Users } from 'lucide-react';

export function UserManagement() {
  const { user, canManageUsers } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(USERS);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'gestor' as 'admin' | 'visualizador' | 'gestor'
  });

  // Se não pode gerenciar usuários, não renderiza
  if (!canManageUsers()) {
    return null;
  }

  const handleSaveUser = () => {
    if (!formData.username || !formData.password || !formData.name) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (editingUser) {
      // Editando usuário existente
      const updatedUsers = users.map(u => 
        u.username === editingUser.username ? { ...formData } : u
      );
      setUsers(updatedUsers);
      // Aqui você salvaria no backend/localStorage
      localStorage.setItem('app_users', JSON.stringify(updatedUsers));
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso"
      });
    } else {
      // Adicionando novo usuário
      if (users.some(u => u.username === formData.username)) {
        toast({
          title: "Erro",
          description: "Nome de usuário já existe",
          variant: "destructive"
        });
        return;
      }
      
      const newUsers = [...users, { ...formData }];
      setUsers(newUsers);
      // Aqui você salvaria no backend/localStorage
      localStorage.setItem('app_users', JSON.stringify(newUsers));
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso"
      });
    }

    setEditingUser(null);
    setIsAddingUser(false);
    setFormData({ username: '', password: '', name: '', role: 'gestor' });
  };

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormData({
      username: userToEdit.username,
      password: userToEdit.password,
      name: userToEdit.name,
      role: userToEdit.role
    });
  };

  const handleDeleteUser = (userToDelete: User) => {
    if (userToDelete.username === user?.username) {
      toast({
        title: "Erro",
        description: "Você não pode excluir seu próprio usuário",
        variant: "destructive"
      });
      return;
    }

    if (userToDelete.role === 'admin' && user?.role !== 'admin') {
      toast({
        title: "Erro",
        description: "Apenas admins podem excluir outros admins",
        variant: "destructive"
      });
      return;
    }

    const updatedUsers = users.filter(u => u.username !== userToDelete.username);
    setUsers(updatedUsers);
    // Aqui você salvaria no backend/localStorage
    localStorage.setItem('app_users', JSON.stringify(updatedUsers));
    toast({
      title: "Sucesso",
      description: "Usuário excluído com sucesso"
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'gestor': return 'default';
      case 'visualizador': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'gestor': return 'Gestor';
      case 'visualizador': return 'Visualizador';
      default: return role;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, permissões e acessos do sistema
          </p>
        </div>
        <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsAddingUser(true);
              setEditingUser(null);
              setFormData({ username: '', password: '', name: '', role: 'gestor' });
            }} className="w-full sm:w-auto">
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Adicionar Usuário</span>
              <span className="sm:hidden">Novo Usuário</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Nome de usuário</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Digite o nome de usuário"
                  disabled={!!editingUser} // Não permite editar username
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Digite a senha"
                />
              </div>
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <Label htmlFor="role">Função</Label>
                <Select value={formData.role} onValueChange={(value: 'admin' | 'visualizador' | 'gestor') => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="visualizador">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveUser} className="flex-1">
                  {editingUser ? 'Atualizar' : 'Criar'} Usuário
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingUser(false);
                    setEditingUser(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários do Sistema ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((userItem) => (
                <div key={userItem.username} className="flex flex-col gap-3 p-4 border border-border rounded-lg sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-foreground truncate">{userItem.name}</h3>
                        <p className="text-sm text-muted-foreground">@{userItem.username}</p>
                      </div>
                      <Badge variant={getRoleBadgeColor(userItem.role)} className="self-start sm:self-center">
                        {getRoleLabel(userItem.role)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={editingUser?.username === userItem.username} onOpenChange={(open) => {
                      if (!open) {
                        setEditingUser(null);
                        setIsAddingUser(false);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(userItem)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Usuário</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-username">Nome de usuário</Label>
                            <Input
                              id="edit-username"
                              value={formData.username}
                              disabled
                              className="bg-muted"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-password">Senha</Label>
                            <Input
                              id="edit-password"
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              placeholder="Digite a nova senha"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-name">Nome completo</Label>
                            <Input
                              id="edit-name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Digite o nome completo"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-role">Função</Label>
                            <Select value={formData.role} onValueChange={(value: 'admin' | 'visualizador' | 'gestor') => setFormData({ ...formData, role: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a função" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="gestor">Gestor</SelectItem>
                                <SelectItem value="visualizador">Visualizador</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button onClick={handleSaveUser} className="flex-1">
                              Atualizar Usuário
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setEditingUser(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {userItem.username !== user?.username && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteUser(userItem)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}