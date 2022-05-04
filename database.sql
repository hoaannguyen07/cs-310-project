-- Database: cs_310_db

-- DROP DATABASE IF EXISTS cs_310_db;

CREATE DATABASE cs_310_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id bigint NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    username character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(100) COLLATE pg_catalog."default" NOT NULL,
    type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_username_key UNIQUE (email)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

-- Table: public.email_list

-- DROP TABLE IF EXISTS public.email_list;

CREATE TABLE IF NOT EXISTS public.email_list
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    user_id integer NOT NULL,
    allow_post_notifications boolean NOT NULL DEFAULT false,
    allow_comment_notifications boolean NOT NULL DEFAULT false,
    CONSTRAINT email_list_pkey PRIMARY KEY (id),
    CONSTRAINT email_list_user_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.email_list
    OWNER to postgres;

-- Table: public.tags

-- DROP TABLE IF EXISTS public.tags;

CREATE TABLE IF NOT EXISTS public.tags
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    description character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT tags_pkey PRIMARY KEY (id),
    CONSTRAINT tags_descr_unique UNIQUE (description)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.tags
    OWNER to postgres;

-- Table: public.posts

-- DROP TABLE IF EXISTS public.posts;

CREATE TABLE IF NOT EXISTS public.posts
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    user_id integer NOT NULL,
    title character varying COLLATE pg_catalog."default" NOT NULL,
    body text COLLATE pg_catalog."default" NOT NULL,
    num_upvotes integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT posts_pkey PRIMARY KEY (id),
    CONSTRAINT post_user_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.posts
    OWNER to postgres;

-- Table: public.post_tags

-- DROP TABLE IF EXISTS public.post_tags;

CREATE TABLE IF NOT EXISTS public.post_tags
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    post_id integer NOT NULL,
    tag_id integer NOT NULL,
    CONSTRAINT posts_tags_pkey PRIMARY KEY (id),
    CONSTRAINT post_tag_post_fk FOREIGN KEY (post_id)
        REFERENCES public.posts (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT post_tag_tag_fk FOREIGN KEY (tag_id)
        REFERENCES public.tags (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.post_tags
    OWNER to postgres;

-- Table: public.unapproved_posts

-- DROP TABLE IF EXISTS public.unapproved_posts;

CREATE TABLE IF NOT EXISTS public.unapproved_posts
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    user_id integer NOT NULL,
    title character varying COLLATE pg_catalog."default" NOT NULL,
    body text COLLATE pg_catalog."default" NOT NULL,
    num_upvotes integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT unapproved_posts_pkey PRIMARY KEY (id),
    CONSTRAINT unapproved_post_user_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.unapproved_posts
    OWNER to postgres;

-- Table: public.comments

-- DROP TABLE IF EXISTS public.comments;

CREATE TABLE IF NOT EXISTS public.comments
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    post_id integer NOT NULL,
    body text COLLATE pg_catalog."default" NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT comments_pkey PRIMARY KEY (id),
    CONSTRAINT comment_post_fk FOREIGN KEY (post_id)
        REFERENCES public.posts (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT comment_user_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.comments
    OWNER to postgres;

-- Table: public.unapproved_comments

-- DROP TABLE IF EXISTS public.unapproved_comments;

CREATE TABLE IF NOT EXISTS public.unapproved_comments
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    post_id integer NOT NULL,
    body text COLLATE pg_catalog."default" NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT unapproved_comments_pkey PRIMARY KEY (id),
    CONSTRAINT unapproved_comment_post_fk FOREIGN KEY (post_id)
        REFERENCES public.posts (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT unapproved_comment_user_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.unapproved_comments
    OWNER to postgres;

-- Table: public.session

-- DROP TABLE IF EXISTS public.session;

CREATE TABLE IF NOT EXISTS public.session
(
    sid character varying COLLATE pg_catalog."default" NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL,
    CONSTRAINT session_pkey PRIMARY KEY (sid)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.session
    OWNER to postgres;