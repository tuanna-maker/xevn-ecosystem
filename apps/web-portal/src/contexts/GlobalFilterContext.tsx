import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockCompanies, Company } from '../data/mockData';

interface GlobalFilterContextType {
  selectedCompany: Company;
  setSelectedCompany: (company: Company) => void;
  companies: Company[];
}

const GlobalFilterContext = createContext<GlobalFilterContextType | undefined>(undefined);

export const GlobalFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState<Company>(mockCompanies[0]); // Default: All Group

  return (
    <GlobalFilterContext.Provider
      value={{
        selectedCompany,
        setSelectedCompany,
        companies: mockCompanies,
      }}
    >
      {children}
    </GlobalFilterContext.Provider>
  );
};

export const useGlobalFilter = (): GlobalFilterContextType => {
  const context = useContext(GlobalFilterContext);
  if (!context) {
    throw new Error('useGlobalFilter must be used within a GlobalFilterProvider');
  }
  return context;
};

export default GlobalFilterContext;
