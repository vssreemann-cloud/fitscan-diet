-- Add health_goal column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN health_goal text CHECK (health_goal IN ('weight_loss', 'bulking', 'maintenance'));