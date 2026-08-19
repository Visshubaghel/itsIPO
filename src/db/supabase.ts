import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'ipo_tracker_supabase_url';
const SUPABASE_KEY_KEY = 'ipo_tracker_supabase_key';

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(SUPABASE_URL_KEY) || '';
  const key = localStorage.getItem(SUPABASE_KEY_KEY) || '';
  return { url, key };
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_KEY_KEY, key.trim());
}

export function clearSupabaseConfig() {
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_KEY_KEY);
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getStoredSupabaseConfig();
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    return null;
  }
}

/**
 * Generates SQL DDL statements for PostgreSQL / Supabase table creation
 */
export const SUPABASE_SQL_SCHEMA = `-- Copy and run this SQL script in your Supabase SQL Editor:

create table if not exists public.people (
  id text primary key,
  name text not null,
  bank_broker text,
  upi_or_account text,
  default_amount numeric default 200000,
  note text,
  is_active boolean default true,
  created_at text
);

create table if not exists public.ipos (
  id text primary key,
  name text not null,
  amount_required numeric default 200000,
  bidding_start_date text,
  bidding_end_date text,
  allotment_date text,
  listing_date text,
  note text,
  created_at text
);

create table if not exists public.applications (
  id text primary key,
  ipo_id text references public.ipos(id) on delete cascade,
  person_id text references public.people(id) on delete cascade,
  amount numeric default 200000,
  status text default 'Not Applied',
  applied_at text,
  note text,
  created_at text
);

create table if not exists public.transactions (
  id text primary key,
  person_id text references public.people(id) on delete cascade,
  type text not null check (type in ('SENT', 'RECEIVED')),
  amount numeric not null,
  date text not null,
  ipo_id text,
  note text,
  created_at text
);
`;
