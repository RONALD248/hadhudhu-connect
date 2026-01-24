import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Smartphone,
  Monitor,
  CheckCircle2,
  Share,
  PlusSquare,
  Wifi,
  Bell,
  Zap,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Install() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      console.log('App installed successfully');
    }
  };

  const features = [
    {
      icon: Wifi,
      title: 'Works Offline',
      description: 'Access your data even without internet connection',
    },
    {
      icon: Zap,
      title: 'Fast & Responsive',
      description: 'Lightning-fast performance like a native app',
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Stay updated with important church announcements',
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Your data is encrypted and protected',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Badge variant="secondary">Free Download</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="mb-6 flex justify-center">
            <div className="h-24 w-24 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <img src="/pwa-192x192.png" alt="App Icon" className="h-20 w-20 rounded-xl" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Hadhudhu SDA Church
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Download our app for quick access to all church management features
          </p>
          
          {isInstalled ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-6 w-6" />
                <span className="text-lg font-medium">App Already Installed!</span>
              </div>
              <p className="text-muted-foreground">
                You can find the app on your home screen or app drawer
              </p>
              <Link to="/dashboard">
                <Button size="lg">
                  Open Dashboard
                </Button>
              </Link>
            </div>
          ) : isInstallable ? (
            <Button size="lg" onClick={handleInstall} className="gap-2 text-lg px-8">
              <Download className="h-5 w-5" />
              Install App
            </Button>
          ) : isIOS ? (
            <Card className="text-left max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Install on iOS
                </CardTitle>
                <CardDescription>
                  Follow these steps to install the app on your iPhone or iPad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Tap the Share button</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Look for the <Share className="h-4 w-4" /> icon at the bottom of Safari
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Scroll down and tap "Add to Home Screen"</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Look for the <PlusSquare className="h-4 w-4" /> icon
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Tap "Add" to confirm</p>
                    <p className="text-sm text-muted-foreground">
                      The app will appear on your home screen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-left max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Install on Desktop or Android
                </CardTitle>
                <CardDescription>
                  Follow these steps to install the app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Look for the install icon</p>
                    <p className="text-sm text-muted-foreground">
                      In Chrome, look for the install icon in the address bar (⊕)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Or use the browser menu</p>
                    <p className="text-sm text-muted-foreground">
                      Click the three dots (⋮) → "Install app" or "Add to Home screen"
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Confirm the installation</p>
                    <p className="text-sm text-muted-foreground">
                      The app will be added to your apps or home screen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features Grid */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Why Install the App?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Device Support */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Supported Devices</h2>
          <div className="flex justify-center gap-8 text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Smartphone className="h-8 w-8" />
              <span>iPhone & iPad</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Smartphone className="h-8 w-8" />
              <span>Android</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Monitor className="h-8 w-8" />
              <span>Desktop</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Hadhudhu SDA Church. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}