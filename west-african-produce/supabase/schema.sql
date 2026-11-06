-- West African Produce storefront + order queue.
-- Run once in the Supabase SQL editor. Safe to re-run.

create table if not exists public.wap_products (
  sku text primary key,
  name text not null,
  category text not null check (category in ('palm-oil', 'smoked-fish', 'frozen-vegetables', 'spices')),
  description text,
  unit text not null default 'each',
  price_cents integer not null check (price_cents > 0),
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.wap_orders (
  id uuid primary key default gen_random_uuid(),
  confirmation_number text not null unique,
  status text not null default 'awaiting_payment' check (
    status in ('awaiting_payment', 'paid', 'preparing', 'ready', 'shipped', 'fulfilled', 'expired', 'cancelled', 'refunded')
  ),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  ship_to jsonb,
  subtotal_cents integer not null default 0,
  total_cents integer,
  currency text not null default 'usd',
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  staff_note text,
  expires_at timestamptz not null,
  paid_at timestamptz,
  status_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists wap_orders_status_idx on public.wap_orders (status, created_at);

create table if not exists public.wap_order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.wap_orders(id) on delete cascade,
  sku text not null references public.wap_products(sku),
  name text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0)
);

create table if not exists public.wap_wholesale_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text,
  interest text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

-- Anonymous/public clients get no direct table access. The server uses the service role key, which bypasses RLS.
alter table public.wap_products enable row level security;
alter table public.wap_orders enable row level security;
alter table public.wap_order_items enable row level security;
alter table public.wap_wholesale_inquiries enable row level security;

-- Reserve stock and create a pending order in one transaction.
-- Raises 'insufficient_stock:<sku>' (rolling everything back) if any line cannot be filled.
create or replace function public.wap_reserve_order(
  p_confirmation text,
  p_customer jsonb,
  p_items jsonb,
  p_expires_at timestamptz
) returns uuid
language plpgsql
as $$
declare
  v_order_id uuid;
  v_line record;
  v_price integer;
  v_name text;
  v_subtotal integer := 0;
begin
  insert into public.wap_orders (
    confirmation_number, customer_name, customer_email, customer_phone, expires_at
  ) values (
    p_confirmation,
    p_customer->>'name',
    p_customer->>'email',
    p_customer->>'phone',
    p_expires_at
  ) returning id into v_order_id;

  for v_line in
    select x->>'sku' as sku, (x->>'quantity')::int as quantity
    from jsonb_array_elements(p_items) as x
  loop
    update public.wap_products
       set stock_on_hand = stock_on_hand - v_line.quantity,
           updated_at = now()
     where sku = v_line.sku
       and active
       and stock_on_hand >= v_line.quantity
    returning price_cents, name into v_price, v_name;

    if not found then
      raise exception 'insufficient_stock:%', v_line.sku;
    end if;

    insert into public.wap_order_items (order_id, sku, name, unit_price_cents, quantity)
    values (v_order_id, v_line.sku, v_name, v_price, v_line.quantity);

    v_subtotal := v_subtotal + v_price * v_line.quantity;
  end loop;

  update public.wap_orders set subtotal_cents = v_subtotal where id = v_order_id;
  return v_order_id;
end;
$$;

-- Move an order into a terminal state and return its reserved stock.
-- Returns false if the order is missing or already terminal, so callers never restock twice.
create or replace function public.wap_cancel_order(p_id uuid, p_status text)
returns boolean
language plpgsql
as $$
declare
  v_status text;
begin
  select status into v_status from public.wap_orders where id = p_id for update;
  if not found then return false; end if;
  if v_status in ('expired', 'cancelled', 'refunded') then return false; end if;

  update public.wap_products p
     set stock_on_hand = p.stock_on_hand + i.quantity,
         updated_at = now()
    from public.wap_order_items i
   where i.order_id = p_id and i.sku = p.sku;

  update public.wap_orders
     set status = p_status, status_updated_at = now()
   where id = p_id;
  return true;
end;
$$;

-- Starting inventory. Prices and stock are placeholders: confirm with West African Produce before launch.
insert into public.wap_products (sku, name, category, description, unit, price_cents, stock_on_hand, sort_order) values
  ('palm-oil-1gal', 'Organic Red Palm Oil', 'palm-oil', 'Sustainably sourced from smallholder farms in Sierra Leone. High smoke point for frying and sautéing.', '1 gallon', 3000, 24, 1),
  ('palm-oil-case', 'Organic Red Palm Oil, Case of 4', 'palm-oil', 'One case: four 1-gallon containers.', 'case of 4 gallons', 10000, 12, 2),
  ('palm-oil-16oz', 'Organic Red Palm Oil', 'palm-oil', 'Sustainably sourced from smallholder farms in Sierra Leone. High smoke point for frying and sautéing.', '16 ounce jar', 800, 40, 3),
  ('palm-oil-16oz-case', 'Organic Red Palm Oil, Case of 12', 'palm-oil', 'One case: twelve 16-ounce jars.', 'case of 12 · 16 oz', 8000, 10, 4),
  ('palm-oil-32oz', 'Organic Red Palm Oil', 'palm-oil', 'Sustainably sourced from smallholder farms in Sierra Leone. High smoke point for frying and sautéing.', '32 ounce jar', 1400, 40, 5),
  ('palm-oil-32oz-case', 'Organic Red Palm Oil, Case of 12', 'palm-oil', 'One case: twelve 32-ounce jars.', 'case of 12 · 32 oz', 14000, 10, 6),
  ('palm-oil-half', 'Organic Red Palm Oil', 'palm-oil', 'Sustainably sourced from smallholder farms in Sierra Leone. High smoke point for frying and sautéing.', '1/2 gallon', 1800, 24, 7),
  ('palm-oil-half-case', 'Organic Red Palm Oil, Case of 6', 'palm-oil', 'One case: six 1/2-gallon containers.', 'case of 6 · 1/2 gal', 9000, 10, 8),
  ('smoked-kuta', 'Smoked Kuta (Barracuda)', 'smoked-fish', 'Smoked barracuda.', 'each', 1500, 20, 10),
  ('smoked-kinnie', 'Smoked Kinnie (Baby Barracuda)', 'smoked-fish', 'Smoked round fish.', 'each', 1500, 20, 11),
  ('smoked-catfish', 'Smoked Catfish', 'smoked-fish', 'Smoked catfish.', 'each', 1500, 20, 12),
  ('smoked-grouper', 'Smoked Grouper', 'smoked-fish', 'Smoked grouper.', 'each', 1800, 20, 13),
  ('smoked-skit', 'Smoked Skit', 'smoked-fish', 'Smoked skit.', 'each', 1500, 20, 14),
  ('smoked-baby-shark', 'Smoked Baby Shark', 'smoked-fish', 'Smoked baby shark.', 'each', 1800, 20, 15),
  ('frozen-potato-leaves', 'Frozen Potato Leaves', 'frozen-vegetables', 'Sourced from small farm holders and frozen at peak freshness.', 'each', 1000, 30, 20),
  ('frozen-cassava-leaves', 'Frozen Cassava Leaves', 'frozen-vegetables', 'Sourced from small farm holders and frozen at peak freshness.', 'each', 1000, 30, 21),
  ('frozen-crain-crain', 'Frozen Crain Crain (Jute Leaves)', 'frozen-vegetables', 'Sourced from small farm holders and frozen at peak freshness.', 'each', 1000, 30, 22),
  ('spice-curry', 'Curry Powder', 'spices', 'Traditional West African spice blend.', 'each', 500, 40, 30),
  ('spice-ginger', 'Pure Ground Ginger', 'spices', 'Pure ground ginger.', 'each', 500, 40, 31),
  ('spice-black-pepper', 'Ground Black Pepper', 'spices', 'Ground black pepper.', 'each', 500, 40, 32),
  ('spice-all-in-one', 'All in One Seasoning', 'spices', 'Multi-purpose seasoning.', 'each', 500, 40, 33),
  ('spice-thyme', 'Thyme', 'spices', 'Dried thyme.', 'each', 500, 40, 34),
  ('spice-cayenne', 'Cayenne Pepper', 'spices', 'Ground cayenne pepper.', 'each', 500, 40, 35)
on conflict (sku) do nothing;
