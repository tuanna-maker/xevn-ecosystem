import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { mockCompanies, Company } from '../data/mockData';
import { listBusinessMasterItems } from '../integrations/businessMasterApi';

interface GlobalFilterContextType {
  selectedCompany: Company;
  setSelectedCompany: (company: Company) => void;
  companies: Company[];
}

const GlobalFilterContext = createContext<GlobalFilterContextType | undefined>(undefined);

export const GlobalFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [selectedCompany, setSelectedCompany] = useState<Company>(mockCompanies[0]); // Default: All Group

  useEffect(() => {
    void listBusinessMasterItems<Company>('companies', null)
      .then((rows) => {
        if (!rows.length) return;
        setCompanies(rows);
      })
      .catch(() => {
        setCompanies(mockCompanies);
      });
  }, []);

  const safeSelectedCompany = useMemo(() => {
    const matched = companies.find((x) => x.id === selectedCompany.id);
    return matched ?? companies[0] ?? selectedCompany;
  }, [companies, selectedCompany]);

  return (
    <GlobalFilterContext.Provider
      value={{
        selectedCompany: safeSelectedCompany,
        setSelectedCompany,
        companies,
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
