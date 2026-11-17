-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Credit accounts (balances are only changed by server-side functions)
CREATE TABLE public.credit_accounts (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'ultra')),
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_accounts TO authenticated;
GRANT ALL ON public.credit_accounts TO service_role;
ALTER TABLE public.credit_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own credit account" ON public.credit_accounts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Credit ledger
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  kind text NOT NULL CHECK (kind IN ('welcome', 'usage', 'refund', 'grant')),
  tool text,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX credit_transactions_user_created_idx ON public.credit_transactions (user_id, created_at DESC);
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own transactions" ON public.credit_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Spend credits atomically. Server-only (service_role).
CREATE OR REPLACE FUNCTION public.spend_credits(_user_id uuid, _amount integer, _tool text, _description text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_balance integer;
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;
  UPDATE public.credit_accounts
     SET balance = balance - _amount, updated_at = now()
   WHERE user_id = _user_id AND balance >= _amount
  RETURNING balance INTO new_balance;
  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;
  INSERT INTO public.credit_transactions (user_id, amount, kind, tool, description)
  VALUES (_user_id, -_amount, 'usage', _tool, left(coalesce(_description, ''), 200));
  RETURN new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_credits(_user_id uuid, _amount integer, _tool text, _description text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_balance integer;
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;
  UPDATE public.credit_accounts
     SET balance = balance + _amount, updated_at = now()
   WHERE user_id = _user_id
  RETURNING balance INTO new_balance;
  INSERT INTO public.credit_transactions (user_id, amount, kind, tool, description)
  VALUES (_user_id, _amount, 'refund', _tool, left(coalesce(_description, ''), 200));
  RETURN new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.spend_credits(uuid, integer, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refund_credits(uuid, integer, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spend_credits(uuid, integer, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_credits(uuid, integer, text, text) TO service_role;

-- New user setup: profile, welcome credits, default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  INSERT INTO public.credit_accounts (user_id, plan, balance) VALUES (NEW.id, 'free', 100);
  INSERT INTO public.credit_transactions (user_id, amount, kind, description)
  VALUES (NEW.id, 100, 'welcome', 'Welcome credits');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Chat threads and messages
CREATE TABLE public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_threads_user_updated_idx ON public.chat_threads (user_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_threads TO authenticated;
GRANT ALL ON public.chat_threads TO service_role;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own threads" ON public.chat_threads FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users create own threads" ON public.chat_threads FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own threads" ON public.chat_threads FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own threads" ON public.chat_threads FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (thread_id, message_id)
);
CREATE INDEX chat_messages_thread_created_idx ON public.chat_messages (thread_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own messages" ON public.chat_messages FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users add messages to own threads" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.chat_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
CREATE POLICY "Users update own messages" ON public.chat_messages FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own messages" ON public.chat_messages FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Admin overview (authorization enforced inside the function)
CREATE OR REPLACE FUNCTION public.admin_overview()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'active_users_30d', (SELECT count(DISTINCT user_id) FROM public.credit_transactions WHERE kind = 'usage' AND created_at > now() - interval '30 days'),
    'ai_requests_30d', (SELECT count(*) FROM public.credit_transactions WHERE kind = 'usage' AND created_at > now() - interval '30 days'),
    'credits_used_30d', (SELECT coalesce(-sum(amount), 0) FROM public.credit_transactions WHERE kind IN ('usage', 'refund') AND created_at > now() - interval '30 days'),
    'plans', (SELECT coalesce(jsonb_object_agg(plan, n), '{}'::jsonb) FROM (SELECT plan, count(*) AS n FROM public.credit_accounts GROUP BY plan) p),
    'by_tool_30d', (SELECT coalesce(jsonb_object_agg(tool, n), '{}'::jsonb) FROM (SELECT tool, count(*) AS n FROM public.credit_transactions WHERE kind = 'usage' AND tool IS NOT NULL AND created_at > now() - interval '30 days' GROUP BY tool) t),
    'weekly_credits', (
      SELECT coalesce(jsonb_agg(jsonb_build_object('week', to_char(w, 'DD Mon'), 'credits', coalesce(c, 0)) ORDER BY w), '[]'::jsonb)
      FROM (
        SELECT gs AS w,
          (SELECT -sum(amount) FROM public.credit_transactions ct
            WHERE ct.kind IN ('usage', 'refund') AND ct.created_at >= gs AND ct.created_at < gs + interval '7 days') AS c
        FROM generate_series(date_trunc('week', now()) - interval '5 weeks', date_trunc('week', now()), interval '1 week') gs
      ) weeks
    )
  ) INTO result;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_overview() TO authenticated;