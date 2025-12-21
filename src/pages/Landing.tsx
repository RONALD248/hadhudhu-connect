import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Church, 
  Users, 
  Wallet, 
  FileText, 
  Shield, 
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Lock
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Users,
      title: 'Member Management',
      description: 'Complete member database with profiles, family records, and spiritual status tracking.',
    },
    {
      icon: Wallet,
      title: 'Financial Tracking',
      description: 'Record tithes, offerings, and special contributions with detailed payment tracking.',
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'Generate comprehensive financial and membership reports with visual insights.',
    },
    {
      icon: FileText,
      title: 'Secretariat Records',
      description: 'Manage church documents, meeting minutes, and official correspondence.',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure access control with distinct permissions for each church role.',
    },
    {
      icon: Lock,
      title: 'Data Security',
      description: 'Your church data is protected with enterprise-grade security measures.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Members Managed' },
    { value: 'KES 5M+', label: 'Contributions Tracked' },
    { value: '100%', label: 'Data Accuracy' },
    { value: '24/7', label: 'System Availability' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Church className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground">Hadhudhu SDA</span>
              <span className="text-[10px] text-muted-foreground">Church Management System</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth/register">
              <Button variant="gold">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm text-secondary">
              <span className="mr-2">✨</span>
              Uranga District • Seventh-day Adventist Church
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl animate-fade-in">
              Hadhudhu SDA Church
              <span className="block text-gradient mt-2">Management System</span>
            </h1>
            
            <p className="mb-8 text-lg text-primary-foreground/80 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              A comprehensive digital platform for transparent treasury management, 
              member administration, and church record-keeping. Built for the modern church.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/auth/register">
                <Button size="xl" variant="hero" className="group">
                  Start Managing Today
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="xl" variant="hero-outline">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L1440 120L1440 0C1440 0 1140 60 720 60C300 60 0 0 0 0L0 120Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl lg:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Everything Your Church Needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete solution designed specifically for Seventh-day Adventist church administration.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="stat-card group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Accounts Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground">Try Demo Accounts</h2>
              <p className="mt-4 text-muted-foreground">
                Experience the system with different role perspectives
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <div className="grid gap-4">
                {[
                  { email: 'admin@hadhudhu.org', role: 'Super Admin' },
                  { email: 'treasurer@hadhudhu.org', role: 'Treasurer' },
                  { email: 'secretary@hadhudhu.org', role: 'Secretary' },
                  { email: 'pastor@hadhudhu.org', role: 'Pastor' },
                  { email: 'member@hadhudhu.org', role: 'Member' },
                ].map((account, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span className="font-medium">{account.email}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{account.role}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Password for all demo accounts: <code className="bg-muted px-2 py-0.5 rounded">password123</code>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-hero relative overflow-hidden">
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
            Ready to Modernize Your Church Administration?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            Join Hadhudhu SDA Church in embracing digital transformation for transparent and efficient church management.
          </p>
          <div className="mt-8">
            <Link to="/auth/register">
              <Button size="xl" variant="hero" className="group">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Church className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">Hadhudhu SDA Church</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Hadhudhu SDA Church, Uranga District. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
