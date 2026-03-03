import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Monitor,
  Share,
  PlusSquare,
  ArrowLeft,
  Chrome,
  MoreVertical,
} from 'lucide-react';

export default function Install() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Badge variant="secondary">Installation Guide</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <img src="/pwa-192x192.png" alt="App Icon" className="h-16 w-16 rounded-xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">How to Install the App</h1>
          <p className="text-muted-foreground">
            Follow the instructions below for your device to add Hadhudhu SDA Church to your home screen.
          </p>
        </div>

        <div className="space-y-6">
          {/* iOS Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                iPhone &amp; iPad (Safari)
              </CardTitle>
              <CardDescription>Use Safari browser for installation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Step number={1} title="Open in Safari" description="Make sure you're viewing this site in Safari, not another browser." />
              <Step number={2} title="Tap the Share button">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Tap the <Share className="h-4 w-4 inline" /> icon at the bottom of the screen
                </p>
              </Step>
              <Step number={3} title='Tap "Add to Home Screen"'>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Scroll down and tap <PlusSquare className="h-4 w-4 inline" /> Add to Home Screen
                </p>
              </Step>
              <Step number={4} title='Tap "Add"' description="The app icon will appear on your home screen." />
            </CardContent>
          </Card>

          {/* Android Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Android (Chrome)
              </CardTitle>
              <CardDescription>Use Chrome browser for the best experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Step number={1} title="Open in Chrome" description="Make sure you're viewing this site in Google Chrome." />
              <Step number={2} title="Tap the menu">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Tap the <MoreVertical className="h-4 w-4 inline" /> three dots in the top-right corner
                </p>
              </Step>
              <Step number={3} title='Tap "Add to Home screen"' description='Select "Add to Home screen" or "Install app" from the menu.' />
              <Step number={4} title="Confirm" description="Tap Add or Install. The app will appear in your app drawer." />
            </CardContent>
          </Card>

          {/* Desktop Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Desktop (Chrome / Edge)
              </CardTitle>
              <CardDescription>Works on Windows, Mac, and Linux</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Step number={1} title="Look for the install icon">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Click the <Chrome className="h-4 w-4 inline" /> install icon (⊕) in the address bar
                </p>
              </Step>
              <Step number={2} title="Or use the browser menu" description='Click ⋮ → "Install Hadhudhu SDA Church…"' />
              <Step number={3} title="Click Install" description="The app will open in its own window and be added to your apps." />
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Hadhudhu SDA Church. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function Step({ number, title, description, children }: { number: number; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-primary font-semibold text-sm">{number}</span>
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {children}
      </div>
    </div>
  );
}
