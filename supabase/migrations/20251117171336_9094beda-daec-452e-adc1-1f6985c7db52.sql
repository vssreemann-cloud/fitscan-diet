-- Create enum for meal types
create type public.meal_type as enum ('breakfast', 'morning_snack', 'lunch', 'snack', 'dinner');

-- Create meals table
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  meal_type meal_type not null,
  calories numeric(8,2) not null default 0,
  protein numeric(8,2) not null default 0,
  carbs numeric(8,2) not null default 0,
  fat numeric(8,2) not null default 0,
  image_url text,
  created_at timestamptz not null default now(),
  meal_date date not null default current_date
);

-- Enable RLS
alter table public.meals enable row level security;

-- RLS Policies
create policy "Users can view their own meals"
  on public.meals
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own meals"
  on public.meals
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own meals"
  on public.meals
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own meals"
  on public.meals
  for delete
  using (auth.uid() = user_id);

-- Create index for efficient queries
create index meals_user_date_idx on public.meals(user_id, meal_date);
create index meals_created_at_idx on public.meals(created_at desc);