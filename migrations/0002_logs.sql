-- Per-officer journals, entries, settings, and voice recordings.
create table if not exists journals (
  id          text primary key,
  user_id     text not null,
  name        text not null,
  code        text not null,
  color       text not null,
  created_at  bigint not null
);
create index if not exists journals_user_id_idx on journals (user_id);

create table if not exists log_entries (
  id           text primary key,
  user_id      text not null,
  journal_id   text not null,
  stardate     text not null,
  title        text not null default '',
  body         text not null default '',
  kind         text not null default 'standard',
  status       text not null default 'draft',
  has_audio    boolean not null default false,
  duration_ms  integer not null default 0,
  created_at   bigint not null,
  updated_at   bigint not null
);
create index if not exists log_entries_user_journal_idx on log_entries (user_id, journal_id);

create table if not exists log_settings (
  user_id         text primary key,
  officer_name    text not null default '',
  rank            text not null default 'Captain',
  vessel          text not null default 'USS Horizon',
  registry        text not null default 'NCC-2187',
  sound_enabled   boolean not null default true,
  voice_enabled   boolean not null default true,
  alert           text not null default 'normal',
  booted          boolean not null default false
);

create table if not exists log_audio (
  entry_id  text primary key,
  user_id   text not null,
  mime      text not null,
  data      text not null
);
