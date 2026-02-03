import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { X, Download, Share, PlusSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const DISMISS_KEY = 'pwa-install-banner-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function InstallPromptBanner() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isInstalled) return;

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissTime < DISMISS_DURATION) {
        return;
      }
    }

    // Show banner if installable or on iOS (which needs manual instructions)
    if (isInstallable || isIOS) {
      // Delay showing to avoid flash on page load
      const timer = setTimeout(() => {
        setIsAnimating(true);
        setTimeout(() => setIsVisible(true), 50);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isIOS]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => setIsAnimating(false), 300);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      handleDismiss();
    }
  };

  if (!isAnimating) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 p-4 transition-transform duration-300 ease-out',
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="mx-auto max-w-lg rounded-xl bg-card border border-border shadow-lg overflow-hidden">
        <div className="relative p-4">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            {/* App Icon */}
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
              <img
                src="/pwa-192x192.png"
                alt="App Icon"
                className="h-10 w-10 rounded-lg"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">
                Install Hadhudhu CMS
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add to home screen for quick access
              </p>

              {isIOS ? (
                // iOS instructions
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                  <Share className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span>
                    Tap <Share className="h-3 w-3 inline mx-0.5" /> then "Add to Home Screen"
                    <PlusSquare className="h-3 w-3 inline mx-0.5" />
                  </span>
                </div>
              ) : (
                // Android/Desktop install button
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="mt-3 gap-1.5 h-8 text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Install Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
