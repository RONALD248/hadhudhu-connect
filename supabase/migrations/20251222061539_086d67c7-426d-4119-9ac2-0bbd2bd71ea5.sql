-- Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'treasurer', 'secretary', 'pastor', 'member');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'member',
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    membership_number TEXT UNIQUE,
    address TEXT,
    date_of_birth DATE,
    gender TEXT,
    marital_status TEXT,
    baptism_date DATE,
    occupation TEXT,
    employer TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create departments table
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    head_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create member_departments junction table
CREATE TABLE public.member_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, department_id)
);

-- Create payment_categories table
CREATE TABLE public.payment_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    target_amount DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.payment_categories(id) ON DELETE RESTRICT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'cash',
    reference_number TEXT,
    description TEXT,
    receipt_url TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pledges table
CREATE TABLE public.pledges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.payment_categories(id) ON DELETE RESTRICT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    fulfilled_amount DECIMAL(12,2) DEFAULT 0,
    due_date DATE,
    status TEXT DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Function to check if user is admin/treasurer/secretary
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('super_admin', 'treasurer', 'secretary', 'pastor')
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_staff(auth.uid()));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for departments (viewable by all authenticated users)
CREATE POLICY "Authenticated users can view departments"
ON public.departments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage departments"
ON public.departments FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for member_departments
CREATE POLICY "Users can view their own department memberships"
ON public.member_departments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all department memberships"
ON public.member_departments FOR SELECT
USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can manage department memberships"
ON public.member_departments FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for payment_categories (viewable by all authenticated users)
CREATE POLICY "Authenticated users can view payment categories"
ON public.payment_categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Treasurers can manage payment categories"
ON public.payment_categories FOR ALL
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'treasurer'));

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all payments"
ON public.payments FOR SELECT
USING (public.is_staff(auth.uid()));

CREATE POLICY "Treasurers can manage payments"
ON public.payments FOR ALL
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'treasurer'));

-- RLS Policies for pledges
CREATE POLICY "Users can view their own pledges"
ON public.pledges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all pledges"
ON public.pledges FOR SELECT
USING (public.is_staff(auth.uid()));

CREATE POLICY "Users can manage their own pledges"
ON public.pledges FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Treasurers can manage all pledges"
ON public.pledges FOR ALL
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'treasurer'));

-- RLS Policies for activity_logs
CREATE POLICY "Admins can view activity logs"
ON public.activity_logs FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "System can insert activity logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Trigger function to create profile and role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', 'User'),
    NEW.raw_user_meta_data ->> 'phone'
  );
  
  -- Create default member role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default payment categories
INSERT INTO public.payment_categories (name, code, description) VALUES
  ('Tithe', 'TITHE', 'Ten percent of income returned to God'),
  ('Offering', 'OFFERING', 'General church offering'),
  ('Building Fund', 'BUILDING', 'Contributions towards church building projects'),
  ('Welfare', 'WELFARE', 'Fund for helping members in need'),
  ('Youth Fund', 'YOUTH', 'Youth ministry activities'),
  ('Camp Meeting', 'CAMP', 'Annual camp meeting contributions'),
  ('Sabbath School', 'SS', 'Sabbath School mission offering'),
  ('Special Projects', 'SPECIAL', 'Special church projects');

-- Insert default departments
INSERT INTO public.departments (name, description) VALUES
  ('Youth', 'Adventist Youth Ministry'),
  ('Women', 'Women Ministry'),
  ('Men', 'Men Ministry'),
  ('Choir', 'Church Choir'),
  ('Sabbath School', 'Sabbath School Department'),
  ('Personal Ministries', 'Evangelism and Outreach'),
  ('Deacons', 'Deacon Ministry'),
  ('Deaconesses', 'Deaconess Ministry'),
  ('Children', 'Children Ministry');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_categories_updated_at
  BEFORE UPDATE ON public.payment_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pledges_updated_at
  BEFORE UPDATE ON public.pledges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();