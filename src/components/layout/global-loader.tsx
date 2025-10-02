"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function GlobalLoader() {
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    // This effect runs once on the client after initial hydration.
    // It hides the loader after a short delay, ensuring a smooth transition.
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500); // Display loader for 500ms on initial load

        return () => clearTimeout(timer);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    key="global-loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                </motion.div>
            )}
        </AnimatePresence>
    );
}
