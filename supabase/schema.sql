-- ==============================================================================
-- Unloop Database Schema & Row Level Security (RLS) Migration
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. Create the daily_check_ins table
create table if not exists public.daily_check_ins (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    date_key text not null, -- Format 'YYYY-MM-DD'
    is_successful boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    -- Ensure exactly one record per day per user
    constraint daily_check_ins_user_date_key unique (user_id, date_key)
);

-- 2. Create index for fast lookups by user and date
create index if not exists idx_daily_check_ins_user_date 
    on public.daily_check_ins(user_id, date_key);

-- 3. Automatically update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists set_daily_check_ins_updated_at on public.daily_check_ins;
create trigger set_daily_check_ins_updated_at
    before update on public.daily_check_ins
    for each row
    execute function public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
alter table public.daily_check_ins enable row level security;

-- 5. Strict RLS Policies: Users can ONLY access their own records
drop policy if exists "Users can view their own check-ins" on public.daily_check_ins;
create policy "Users can view their own check-ins"
    on public.daily_check_ins
    for select
    using (auth.uid() = user_id);

drop policy if exists "Users can insert their own check-ins" on public.daily_check_ins;
create policy "Users can insert their own check-ins"
    on public.daily_check_ins
    for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update their own check-ins" on public.daily_check_ins;
create policy "Users can update their own check-ins"
    on public.daily_check_ins
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own check-ins" on public.daily_check_ins;
create policy "Users can delete their own check-ins"
    on public.daily_check_ins
    for delete
    using (auth.uid() = user_id);

-- 6. Enable Realtime updates for cross-device live synchronization
alter publication supabase_realtime add table public.daily_check_ins;
