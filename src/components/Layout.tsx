import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  BarChart3, 
  Plus, 
  Menu, 
  X,
  Home,
  TrendingUp,
  TrendingDown,
  LogOut,
  User
} from 'lucide-react';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout, canAdd } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Inventário', href: '/inventario', icon: Package },
    ...(canAdd() ? [{ name: 'Nova Movimentação', href: '/movimentacao', icon: Plus }] : []),
    { name: 'Histórico', href: '/historico', icon: BarChart3 },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'gestor': return 'default';
      case 'visualizador': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-subtle border-r border-border px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Vivere Estoque</h1>
                <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
              </div>
            </div>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={cn(
                            isActive
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                            'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium border border-transparent transition-all duration-200'
                          )}
                        >
                          <item.icon className={cn(
                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                            'h-5 w-5 shrink-0'
                          )} />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
               </li>
            </ul>
          </nav>
          
          {/* User info */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center gap-3 px-2 py-3 mb-2">
              <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getRoleBadgeColor(user?.role || '')} className="text-xs">
                    {user?.role === 'admin' ? 'Admin' : 
                     user?.role === 'gestor' ? 'Gestor' : 'Visualizador'}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar móvel */}
      <div className={cn(
        "relative z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-foreground"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-subtle px-6 pb-4 border-r border-border">
              <div className="flex h-16 shrink-0 items-center">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                    <Package className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-foreground">Vivere Estoque</h1>
                    <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
                  </div>
                </div>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                isActive
                                  ? 'bg-primary/10 text-primary border-primary/20'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                                'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium border border-transparent transition-all duration-200'
                              )}
                            >
                              <item.icon className={cn(
                                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                                'h-5 w-5 shrink-0'
                              )} />
                              {item.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="lg:pl-72">
        {/* Header móvel */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-foreground lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />
            </div>
          </div>
        </div>

        {/* Conteúdo da página */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}