-- Create function to auto-update expired contracts
CREATE OR REPLACE FUNCTION public.update_expired_contracts(p_company_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update contracts where expiry_date has passed and status is still 'active'
  UPDATE public.employee_contracts
  SET 
    status = 'expired',
    updated_at = now()
  WHERE 
    company_id = p_company_id
    AND status = 'active'
    AND expiry_date IS NOT NULL
    AND expiry_date < CURRENT_DATE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$;

-- Also update the old contracts table for consistency
CREATE OR REPLACE FUNCTION public.update_expired_contracts_all(p_company_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  employee_contracts_count INTEGER;
  contracts_count INTEGER;
BEGIN
  -- Update employee_contracts table
  UPDATE public.employee_contracts
  SET 
    status = 'expired',
    updated_at = now()
  WHERE 
    company_id = p_company_id
    AND status = 'active'
    AND expiry_date IS NOT NULL
    AND expiry_date < CURRENT_DATE;
  
  GET DIAGNOSTICS employee_contracts_count = ROW_COUNT;
  
  -- Update contracts table
  UPDATE public.contracts
  SET 
    status = 'expired',
    updated_at = now()
  WHERE 
    company_id = p_company_id
    AND status = 'active'
    AND expiry_date IS NOT NULL
    AND expiry_date < CURRENT_DATE;
  
  GET DIAGNOSTICS contracts_count = ROW_COUNT;
  
  RETURN json_build_object(
    'employee_contracts_updated', employee_contracts_count,
    'contracts_updated', contracts_count
  );
END;
$$;