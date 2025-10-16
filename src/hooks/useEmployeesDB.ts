import { useState, useEffect } from 'react';
import { Employee } from '@/hooks/useEmployees';

export function useEmployeesDB() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        console.error('Failed to fetch employees:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    try {
      console.log('Adding employee:', employee);
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
      
      console.log('Add employee response:', response.status);
      
      if (response.ok) {
        const newEmployee = await response.json();
        console.log('Successfully added employee:', newEmployee);
        setEmployees(prev => [...prev, newEmployee]);
        return newEmployee;
      } else {
        const errorText = await response.text();
        console.error('Failed to add employee:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
    return null;
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const response = await fetch(`/api/employees/${id}`, {
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
      const response = await fetch(`/api/employees/${id}`, {
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