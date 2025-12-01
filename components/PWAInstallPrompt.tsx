import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            const promptEvent = e as BeforeInstallPromptEvent;
            setDeferredPrompt(promptEvent);

            // Show prompt after 30 seconds or on user interaction
            setTimeout(() => {
                setShowPrompt(true);
            }, 30000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);

        // Clear the deferred prompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Show again after 7 days
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    };

    // Don't show if already installed or dismissed recently
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - dismissedTime < sevenDays) {
                setShowPrompt(false);
            }
        }
    }, []);

    if (isInstalled || !showPrompt || !deferredPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-[slideUp_0.3s_ease-out]">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-6 text-white">
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                        <Download className="text-indigo-600" size={24} />
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">Instalar Facilita</h3>
                        <p className="text-white/90 text-sm mb-4">
                            Instale o app para acesso rápido e funcione offline!
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleInstallClick}
                                className="flex-1 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                            >
                                Instalar
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                            >
                                Agora não
                            </button>
                        </div>
                    </div>
                </div>

                {/* Benefits list */}
                <div className="mt-4 pt-4 border-t border-white/20">
                    <ul className="text-xs text-white/80 space-y-1">
                        <li>✓ Acesso rápido do ecrã inicial</li>
                        <li>✓ Funciona offline</li>
                        <li>✓ Notificações em tempo real</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
