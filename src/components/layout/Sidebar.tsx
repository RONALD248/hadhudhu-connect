import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  Settings,
  ChevronLeft,
  Church,
  PieChart,
  FolderOpen,
  UserCog,
  CreditCard,
  CalendarDays,
  Building2,
  ScrollText,
  ClipboardCheck,
  HandCoins,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['super_admin', 'treasurer', 'secretary', 'pastor', 'elder', 'member'],
  },
  {
    title: 'Members',
    href: '/dashboard/members',
    icon: Users,
    roles: ['super_admin', 'secretary', 'pastor', 'elder'],
  },
  {
    title: 'Contributions',
    href: '/dashboard/contributions',
    icon: Wallet,
    roles: ['super_admin', 'treasurer', 'pastor', 'elder', 'member'],
  },
  {
    title: 'Payment Categories',
    href: '/dashboard/categories',
    icon: CreditCard,
    roles: ['super_admin', 'treasurer'],
  },
  {
    title: 'Pledges',
    href: '/dashboard/pledges',
    icon: HandCoins,
    roles: ['super_admin', 'treasurer'],
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: PieChart,
    roles: ['super_admin', 'treasurer', 'secretary', 'pastor', 'elder'],
  },
  {
    title: 'Departments',
    href: '/dashboard/departments',
    icon: Building2,
    roles: ['super_admin', 'secretary'],
  },
  {
    title: 'Secretariat',
    href: '/dashboard/secretariat',
    icon: FolderOpen,
    roles: ['super_admin', 'secretary'],
  },
  {
    title: 'Events',
    href: '/dashboard/events',
    icon: CalendarDays,
    roles: ['super_admin', 'secretary', 'pastor'],
  },
  {
    title: 'Attendance',
    href: '/dashboard/attendance',
    icon: ClipboardCheck,
    roles: ['super_admin', 'secretary', 'pastor', 'elder'],
  },
  {
    title: 'User Management',
    href: '/dashboard/users',
    icon: UserCog,
    roles: ['super_admin'],
  },
  {
    title: 'Activity Logs',
    href: '/dashboard/activity-logs',
    icon: ScrollText,
    roles: ['super_admin'],
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['super_admin', 'treasurer', 'secretary', 'pastor', 'elder', 'member'],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const filteredItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-sidebar transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <Church className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground">Hadhudhu SDA</span>
              <span className="text-[10px] text-sidebar-foreground/60">Church Management</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={onClose}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      'nav-link',
                      isActive && 'nav-link-active'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent p-3">
            <p className="text-xs text-sidebar-foreground/80">
              Uranga District
            </p>
            <p className="text-[10px] text-sidebar-foreground/60 mt-1">
              © 2024 Hadhudhu SDA Church
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
