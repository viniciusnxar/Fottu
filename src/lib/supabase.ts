import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Cliente com a sessão do visitante (cookies) — usado só para saber quem está logado.
export function supabaseSessao() {
  const store = cookies();
  return createServerClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Component não pode gravar cookie; o middleware renova a sessão.
        }
      }
    }
  });
}

// Cliente com a secret key: ignora RLS. Nunca importar em código de cliente.
export const db = createClient(url, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false }
});

export const previewUrl = (path: string) => `${url}/storage/v1/object/public/previews/${path}`;
