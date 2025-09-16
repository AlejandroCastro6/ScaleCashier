--
-- PostgreSQL database dump
--

\restrict ZkqjOAKCEaaJ4bsRhFlGiem12TSuVJN2KjvP6qtNMTzwoe6jmRgLt8vZYg04Wk3

-- Dumped from database version 16.9 (02a153c)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-1.pgdg22.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.products (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    name text NOT NULL,
    price_per_unit numeric(10,2) NOT NULL,
    unit character varying(10) DEFAULT 'kg'::character varying NOT NULL,
    category text,
    tax_rate numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    is_active integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.products OWNER TO neondb_owner;

--
-- Name: transaction_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transaction_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    transaction_id character varying NOT NULL,
    product_id character varying NOT NULL,
    product_code character varying(20) NOT NULL,
    product_name text NOT NULL,
    weight numeric(10,3) NOT NULL,
    price_per_unit numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    tax_rate numeric(5,2) NOT NULL,
    tax_amount numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    unit character varying(10) NOT NULL
);


ALTER TABLE public.transaction_items OWNER TO neondb_owner;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    total numeric(10,2) NOT NULL,
    amount_received numeric(10,2) NOT NULL,
    change numeric(10,2) NOT NULL,
    item_count integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    cashier_name text
);


ALTER TABLE public.transactions OWNER TO neondb_owner;

--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, code, name, price_per_unit, unit, category, tax_rate, is_active, created_at) FROM stdin;
2c53203c-a96d-4916-99dd-6cf1d97eda75	APL001	Test Apples	3.50	kg	Fruits	5.00	1	2025-09-16 14:53:02.220269
\.


--
-- Data for Name: transaction_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.transaction_items (id, transaction_id, product_id, product_code, product_name, weight, price_per_unit, subtotal, tax_rate, tax_amount, total, unit) FROM stdin;
d0785423-3f2c-40bb-be3f-3be89ef81eb2	977f9eed-227e-4f3f-b57c-756961ceba96	2c53203c-a96d-4916-99dd-6cf1d97eda75	TEST001	Test Product	0.500	21.00	10.50	0.00	0.00	10.50	kg
a8c0c7bc-967c-4865-80f2-97ba4a5e8b75	ae4322a1-5687-4d06-90d4-515025295840	2c53203c-a96d-4916-99dd-6cf1d97eda75	TEST001	Test Product	0.500	21.00	10.50	0.00	0.00	10.50	kg
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.transactions (id, total, amount_received, change, item_count, created_at, cashier_name) FROM stdin;
977f9eed-227e-4f3f-b57c-756961ceba96	10.50	20.00	9.50	1	2025-09-16 14:56:51.59791	Test Cashier
ae4322a1-5687-4d06-90d4-515025295840	10.50	20.00	9.50	1	2025-09-16 14:57:03.186687	Test Cashier
\.


--
-- Name: products products_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_code_unique UNIQUE (code);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: transaction_items transaction_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT transaction_items_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: transaction_items transaction_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT transaction_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: transaction_items transaction_items_transaction_id_transactions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT transaction_items_transaction_id_transactions_id_fk FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict ZkqjOAKCEaaJ4bsRhFlGiem12TSuVJN2KjvP6qtNMTzwoe6jmRgLt8vZYg04Wk3

