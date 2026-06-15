-- AI Account Manager — initial schema

create table if not exists clients (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  whatsapp_group_id   text not null unique,
  clickup_list_id     text,
  tone_instructions   text,
  notify_phone        text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create table if not exists messages (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid not null references clients(id) on delete cascade,
  zapi_message_id   text unique,
  sender_phone      text not null,
  body              text not null,
  received_at       timestamptz default now()
);

create table if not exists suggestions (
  id              uuid primary key default gen_random_uuid(),
  message_id      uuid not null references messages(id) on delete cascade,
  client_id       uuid not null references clients(id) on delete cascade,
  original_text   text not null,
  suggested_text  text not null,
  edited_text     text,
  status          text not null default 'pending'
                    check (status in ('pending', 'approved', 'rejected', 'sent')),
  reject_reason   text,
  created_at      timestamptz default now(),
  resolved_at     timestamptz
);

create table if not exists documents (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id) on delete cascade,
  filename      text not null,
  storage_path  text not null,
  created_at    timestamptz default now()
);

-- Indexes
create index if not exists idx_messages_client_received on messages (client_id, received_at desc);
create index if not exists idx_suggestions_status on suggestions (status, created_at desc);
create index if not exists idx_suggestions_client on suggestions (client_id);

-- RLS
alter table clients enable row level security;
alter table messages enable row level security;
alter table suggestions enable row level security;
alter table documents enable row level security;

-- Policy: authenticated users can manage everything in their session
create policy "auth_all_clients"     on clients     for all using (auth.role() = 'authenticated');
create policy "auth_all_messages"    on messages    for all using (auth.role() = 'authenticated');
create policy "auth_all_suggestions" on suggestions for all using (auth.role() = 'authenticated');
create policy "auth_all_documents"   on documents   for all using (auth.role() = 'authenticated');

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_clients_updated_at
  before update on clients
  for each row execute function update_updated_at();
