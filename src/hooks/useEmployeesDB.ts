import { useState, useEffect } from 'react';
import { Employee } from '@/hooks/useEmployees';

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || '';

export function useEmployeesDB() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/employees`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    try {
      const response = await fetch(`${API_BASE}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
      
      if (response.ok) {
        const newEmployee = await response.json();
        setEmployees(prev => [...prev, newEmployee]);
        return newEmployee;
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
    return null;
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const response = await fetch(`${API_BASE}/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        const updatedEmployee = await response.json();
        setEmployees(prev => prev.map(emp => emp.id === id ? updatedEmployee : emp));
        return true;
      }
    } catch (error) {
      console.error('Error updating employee:', error);
    }
    return false;
  };

  const deleteEmployee = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/employees/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
    return false;
  };

  return {
    employees,
    isLoading,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getActiveEmployees: () => employees.filter(emp => emp.active),
    getEmployeeById: (id: string) => employees.find(emp => emp.id === id),
  };
}