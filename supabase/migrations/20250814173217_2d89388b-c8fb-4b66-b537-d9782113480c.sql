-- Create a parent-child relationship that works with the existing schema
-- First check if we need to insert a parent record for the current user
-- The children table already exists, we just need to ensure proper data flow

-- Create or update a function to handle child creation
CREATE OR REPLACE FUNCTION create_child_profile(
  p_first_name TEXT,
  p_birthdate DATE,
  p_grade INTEGER,
  p_daily_limit_min INTEGER DEFAULT 60
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  parent_record_id UUID;
  child_id UUID;
BEGIN
  -- First, ensure we have a parent record for the current user
  SELECT id INTO parent_record_id 
  FROM parents 
  WHERE user_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  );
  
  -- If no parent record exists, create one
  IF parent_record_id IS NULL THEN
    INSERT INTO parents (user_id, full_name)
    SELECT u.id, COALESCE(u.email, 'Parent')
    FROM users u 
    WHERE u.auth_user_id = auth.uid()
    RETURNING id INTO parent_record_id;
  END IF;
  
  -- Now create the child record
  INSERT INTO children (
    first_name,
    birthdate,
    grade,
    daily_limit_min,
    parent_id,
    user_id
  )
  SELECT 
    p_first_name,
    p_birthdate,
    p_grade,
    p_daily_limit_min,
    parent_record_id,
    u.id
  FROM users u 
  WHERE u.auth_user_id = auth.uid()
  RETURNING id INTO child_id;
  
  RETURN child_id;
END;
$$;