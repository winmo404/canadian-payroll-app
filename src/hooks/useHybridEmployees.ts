import { useState, useEffect } from 'react';
import { Employee } from './useEmployees';
import { useEmployees } from './useEmployees';
import { useEmployeesDB } from './useEmployeesDB';

export function useHybridEmployees() {
  const [isDatabaseAvailable, setIsDatabaseAvailable] = useState<boolean | null>(null);
  
  // Initialize both hooks
  const localStorageHook = useEmployees();
  const databaseHook = useEmployeesDB();

  useEffect(() => {
    // Test database availability
    fetch('/api/test-db')
      .then(response => response.json())
      .then(data => {
        setIsDatabaseAvailable(data.success);
      })
      .catch(() => {
        setIsDatabaseAvailable(false);
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
    };
  }

  return {
    ...localStorageHook,
    storageMode: 'localStorage' as const,
  };
}