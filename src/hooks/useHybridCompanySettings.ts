import { useState, useEffect } from 'react';
import { CompanySettings } from '@/lib/calculations/types';
import { useCompanySettings } from './useCompanySettings';
import { useCompanySettingsDB } from './useCompanySettingsDB';

export function useHybridCompanySettings() {
  const [isDatabaseAvailable, setIsDatabaseAvailable] = useState<boolean | null>(null);
  
  // Initialize both hooks
  const localStorageHook = useCompanySettings();
  const databaseHook = useCompanySettingsDB();

  useEffect(() => {
    // Test database availability
    fetch('/api/test-db')
      .then(response => response.json())
      .then(data => {
        setIsDatabaseAvailable(data.success);
        console.log('Database status:', data.success ? 'Available' : 'Not available');
      })
      .catch(() => {
        setIsDatabaseAvailable(false);
        console.log('Database status: Not available, using localStorage');
      });
  }, []);

  // Return appropriate hook based on database availability
  if (isDatabaseAvailable === null) {
    // Still checking database availability
    return {
      ...localStorageHook,
      isLoading: true,
      storageMode: 'checking' as const,
    };
  }

  if (isDatabaseAvailable) {
    return {
      ...databaseHook,
      storageMode: 'database' as const,
      // Add missing localStorage functions for compatibility
      resetToDefaults: localStorageHook.resetToDefaults,
      getFormattedAddress: localStorageHook.getFormattedAddress,
      isDefaultSettings: localStorageHook.isDefaultSettings,
    };
  }

  return {
    ...localStorageHook,
    storageMode: 'localStorage' as const,
  };
}