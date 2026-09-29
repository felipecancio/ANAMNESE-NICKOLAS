-- Schema equivalente para uso no Supabase (Postgres).
-- Execute no SQL Editor do projeto. Em seguida, crie um bucket privado "avaliacoes".

create table if not exists assessments (
  id text primary key,
  protocol text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null,
  payload text not null,
  flags text not null,
  skipped_questions text not null,
  whatsapp_status text not null,
  whatsapp_message_id text,
  whatsapp_error text,
  whatsapp_attempts integer not null default 0,
  last_whatsapp_attempt_at timestamptz,
  pdf_filename text,
  client_request_id text not null unique
);

create table if not exists site_settings (
  id text primary key,
  cref text,
  photo_path text,
  responsible_name text,
  responsible_email text,
  retention_note text,
  updated_at timestamptz not null default now()
);

insert into site_settings (id, cref, photo_path, responsible_name, responsible_email, retention_note, updated_at)
values ('default', '', '', 'Professor Nickolas Amaral', '', '', now())
on conflict (id) do nothing;

alter table assessments enable row level security;
alter table site_settings enable row level security;

-- Nenhum acesso anônimo. Use a service role apenas no servidor.

create policy "deny_anon_assessments" on assessments for all to anon using (false);
create policy "deny_anon_settings" on site_settings for all to anon using (false);
