import { useState, useEffect } from 'react';
import { CompanySettings } from '@/lib/calculations/types';

export function useCompanySettingsDB() {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const response = await fetch('/api/company-settings');
      if (response.ok) {
        const data = await response.json();
        setCompanySettings(data);
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompanySettings = async (newSettings: CompanySettings) => {
    try {
      const response = await fetch('/api/company-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      
      if (response.ok) {
        const updated = await response.json();
        setCompanySettings(updated);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating company settings:', error);
      return false;
    }
  };

  return {
    companySettings,
    isLoading,
    updateCompanySettings,
    fetchCompanySettings,
  };
}