CREATE FUNCTION public_sellers() RETURNS TABLE(id uuid,name text,seller_type text,created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public AS $$
 SELECT u.id,u.name,u.seller_type,u.created_at FROM public.users u
 WHERE EXISTS(SELECT 1 FROM public.listings l WHERE l.seller_id=u.id AND l.status='published')
$$;
REVOKE ALL ON FUNCTION public_sellers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public_sellers() TO marketplace_app;
INSERT INTO migrations VALUES(7);
