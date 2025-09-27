'use client';

import { useEffect, useState } from 'react';
import { appLoadingManager } from './app-loading';

export function useAppLoading() {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize app loading
    const initializeApp = async () => {
      await appLoadingManager.initializeApp();
    };

    initializeApp();

    // Listen for ready state
    appLoadingManager.onReady(() => {
      setIsLoading(false);
      setIsReady(true);
    });

    // Check if already ready
    if (appLoadingManager.getReadyState()) {
      setIsLoading(false);
      setIsReady(true);
    }
  }, []);

  return { isLoading, isReady };
}
