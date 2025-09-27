import { sdk } from '@farcaster/miniapp-sdk';

// App loading state management
export class AppLoadingManager {
  private static instance: AppLoadingManager;
  private isReady = false;
  private readyCallbacks: Array<() => void> = [];

  static getInstance(): AppLoadingManager {
    if (!AppLoadingManager.instance) {
      AppLoadingManager.instance = new AppLoadingManager();
    }
    return AppLoadingManager.instance;
  }

  async initializeApp(): Promise<void> {
    try {
      // Check if we're in Farcaster environment
      if (typeof window !== 'undefined' && window.farcaster) {
        // Initialize SDK and hide splash screen
        await sdk.actions.ready();
        console.log('Farcaster SDK initialized and splash screen hidden');
      }
      
      this.isReady = true;
      this.notifyReady();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // Still mark as ready to not block the app
      this.isReady = true;
      this.notifyReady();
    }
  }

  onReady(callback: () => void): void {
    if (this.isReady) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }

  private notifyReady(): void {
    this.readyCallbacks.forEach(callback => callback());
    this.readyCallbacks = [];
  }

  getReadyState(): boolean {
    return this.isReady;
  }
}

// Global app loading manager instance
export const appLoadingManager = AppLoadingManager.getInstance();

// Utility function to initialize app loading
export const initializeApp = async (): Promise<void> => {
  await appLoadingManager.initializeApp();
};
