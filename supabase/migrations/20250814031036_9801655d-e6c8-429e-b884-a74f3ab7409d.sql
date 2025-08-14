-- Create custom types
CREATE TYPE public.user_role AS ENUM ('PARENT', 'CHILD', 'ADMIN');

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  email TEXT,
  role public.user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parents table
CREATE TABLE public.parents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  consent_at TIMESTAMP WITH TIME ZONE,
  consent_meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create children table
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.parents NOT NULL,
  first_name TEXT NOT NULL,
  grade INTEGER NOT NULL CHECK (grade >= 1 AND grade <= 6),
  daily_limit_min INTEGER NOT NULL DEFAULT 60,
  used_today_min INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  flagged BOOLEAN NOT NULL DEFAULT false,
  flag_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view their own data" 
ON public.users 
FOR SELECT 
USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own data" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = auth_user_id);

-- Create RLS policies for parents
CREATE POLICY "Parents can view their own data" 
ON public.parents 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = parents.user_id 
  AND users.auth_user_id = auth.uid()
));

-- Create RLS policies for children
CREATE POLICY "Parents can view their children" 
ON public.children 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.parents 
  WHERE parents.id = children.parent_id 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = parents.user_id 
    AND users.auth_user_id = auth.uid()
  )
));

CREATE POLICY "Children can view their own data" 
ON public.children 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = children.user_id 
  AND users.auth_user_id = auth.uid()
));

-- Create RLS policies for messages
CREATE POLICY "Parents can view their children's messages" 
ON public.messages 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.children 
  JOIN public.parents ON parents.id = children.parent_id
  JOIN public.users ON users.id = parents.user_id
  WHERE children.id = messages.child_id 
  AND users.auth_user_id = auth.uid()
));

CREATE POLICY "Children can view their own messages" 
ON public.messages 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.children 
  JOIN public.users ON users.id = children.user_id
  WHERE children.id = messages.child_id 
  AND users.auth_user_id = auth.uid()
));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parents_updated_at
  BEFORE UPDATE ON public.parents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();