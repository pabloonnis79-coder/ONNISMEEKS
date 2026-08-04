-- Esquema de base para Onnismeek (CRM + outreach).
-- Correr TODO esto en Supabase → SQL Editor → New query → Run.
-- RLS queda activo en todas las tablas (deny-all); el server entra por service_role.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- CLIENTES (la cartera)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  type                 text not null default 'b2b' check (type in ('b2b','b2c')),
  rubro                text,
  phone                text,
  email                text,
  city                 text,
  instagram            text,
  website              text,
  status               text not null default 'prospecto',
  score                integer not null default 50,
  channel              text check (channel in ('whatsapp','email','telefono','instagram','web')),
  empresa              text,
  contacto_nombre      text,
  contacto_cargo       text,
  notes                text,
  observaciones        text,
  tags                 text[] not null default '{}',
  origen               text,
  prioridad            text check (prioridad in ('alta','media','baja')),
  temperatura          text check (temperatura in ('frio','tibio','caliente')),
  proxima_accion       text,
  productos_interes    text,
  proveedor_actual     text,
  motivo_perdida       text,
  presupuesto_estimado numeric,
  probabilidad_cierre  integer,
  fecha_primer_contacto timestamptz,
  last_contact         timestamptz,
  next_followup        date,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz
);
-- Evita duplicados por nombre+ciudad+rubro
create unique index if not exists clients_name_city_rubro_unique
  on public.clients (lower(trim(name)), lower(coalesce(trim(city),'')), lower(coalesce(trim(rubro),'')));
create index if not exists clients_status_idx  on public.clients (status);
create index if not exists clients_tags_idx    on public.clients using gin (tags);
create index if not exists clients_created_idx on public.clients (created_at desc);

-- ─────────────────────────────────────────────────────────────
-- HISTORIAL de acciones sobre cada contacto (trazabilidad)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.client_history (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid references public.clients(id) on delete cascade,
  fecha      timestamptz not null default now(),
  usuario    text,
  accion     text not null,
  detalle    text,
  created_at timestamptz not null default now()
);
create index if not exists client_history_client_idx on public.client_history (client_id);
create index if not exists client_history_fecha_idx  on public.client_history (fecha desc);

-- ─────────────────────────────────────────────────────────────
-- INTERACCIONES (notas de sistema / canales)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.interactions (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references public.clients(id) on delete cascade,
  channel      text,
  type         text,
  notes        text,
  ai_generated boolean default false,
  created_at   timestamptz not null default now()
);
create index if not exists interactions_client_idx on public.interactions (client_id);

-- ─────────────────────────────────────────────────────────────
-- PROYECTOS / PEDIDOS (facturación por cliente)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid references public.clients(id) on delete set null,
  type          text default 'b2b',
  status        text not null default 'pendiente',
  total         numeric not null default 0,
  delivery_date date,
  notes         text,
  created_at    timestamptz not null default now()
);
create index if not exists orders_client_idx  on public.orders (client_id);
create index if not exists orders_created_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid references public.orders(id) on delete cascade,
  product_id uuid,
  qty        numeric not null default 1,
  unit_price numeric not null default 0,
  subtotal   numeric not null default 0
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ─────────────────────────────────────────────────────────────
-- SETTINGS (configuración: nombre del negocio, mensajes, etc.)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- TAREAS DEL DÍA (dashboard)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.daily_tasks (
  id          uuid primary key default gen_random_uuid(),
  date        date not null default current_date,
  priority    text,
  title       text,
  description text,
  client_id   uuid,
  client_name text,
  action      text,
  payload     jsonb,
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists daily_tasks_date_idx on public.daily_tasks (date);

-- ─────────────────────────────────────────────────────────────
-- RLS: activar en todas las tablas public (deny-all a anon;
-- el server entra por service_role, que bypassa RLS).
-- ─────────────────────────────────────────────────────────────
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security;', r.tablename);
  end loop;
end $$;
