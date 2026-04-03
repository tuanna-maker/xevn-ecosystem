
-- Function to auto-link user to employee and membership when they sign up
-- Called after a user registers, matches email across companies
CREATE OR REPLACE FUNCTION public.auto_link_user_employee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email TEXT;
  v_user_id UUID;
  rec RECORD;
BEGIN
  v_user_id := NEW.user_id;
  v_email := NEW.email;
  
  IF v_email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find all employee records matching this email that don't already have a linked membership
  FOR rec IN 
    SELECT e.id AS employee_id, e.company_id, e.full_name, e.avatar_url
    FROM public.employees e
    WHERE e.email = v_email
      AND e.deleted_at IS NULL
      AND e.status IN ('working', 'active')
      AND NOT EXISTS (
        SELECT 1 FROM public.user_company_memberships ucm
        WHERE ucm.company_id = e.company_id
          AND ucm.user_id = v_user_id
      )
  LOOP
    -- Create membership for the user in this company
    INSERT INTO public.user_company_memberships (
      user_id, company_id, role, email, full_name, avatar_url,
      employee_id, status, is_primary, invited_by
    ) VALUES (
      v_user_id, rec.company_id, 'employee', v_email, rec.full_name, rec.avatar_url,
      rec.employee_id, 'active', false, 'auto-link'
    )
    ON CONFLICT DO NOTHING;

    -- Also assign employee role in permission system
    INSERT INTO public.company_user_roles (user_id, company_id, role_id)
    SELECT v_user_id, rec.company_id, sr.id
    FROM public.system_roles sr
    WHERE sr.code = 'employee'
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Also check existing invited memberships and link them
  UPDATE public.user_company_memberships ucm
  SET user_id = v_user_id, status = 'active'
  WHERE ucm.email = v_email
    AND ucm.status = 'invited'
    AND ucm.user_id != v_user_id;

  RETURN NEW;
END;
$$;

-- Trigger: run auto-link when a new profile is created (after sign-up)
DROP TRIGGER IF EXISTS trigger_auto_link_user_employee ON public.profiles;
CREATE TRIGGER trigger_auto_link_user_employee
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_link_user_employee();
