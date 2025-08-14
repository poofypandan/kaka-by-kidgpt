-- Fix security issues by adding missing RLS policies for audit_logs

-- Create policy for audit logs - only admins can view all, users can view their own
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  user_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = audit_logs.user_id 
    AND users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Only system can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (false);

-- Fix function search path by updating the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'PARENT'::public.user_role
  );
  RETURN NEW;
END;
$$;