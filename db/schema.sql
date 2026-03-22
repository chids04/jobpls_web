-- this is the schema for our d1 database.
-- run this using: npx wrangler d1 execute jobpls-db --local --file=./schema.sql

create table if not exists users (
    id text primary key, -- user id from auth provider (e.g. clerk)
    stripe_customer_id text,
    tier text default 'free', -- 'free' or 'pro'
    credits integer default 0,
    created_at datetime default current_timestamp
);

create table if not exists templates (
    id text primary key,
    user_id text not null,
    name text not null,
    content text not null, -- we store the json template as text
    updated_at datetime default current_timestamp,
    foreign key (user_id) references users(id)
);

-- insert a mock pro user for local testing
insert into users (id, tier, credits) values ('mock_user_123', 'pro', 10) on conflict(id) do nothing;
