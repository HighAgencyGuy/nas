import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  const checkUserRole = async (userId: string) => {
    try {
      const [adminRes, staffRes] = await Promise.all([
        supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
        supabase.rpc("is_admin_or_staff", { _user_id: userId }),
      ]);

      if (adminRes.error) throw adminRes.error;
      if (staffRes.error) throw staffRes.error;

      setIsAdmin(Boolean(adminRes.data));
      setIsStaff(Boolean(staffRes.data));
    } catch (err) {
      console.error("Error checking user roles:", err);
      setIsAdmin(false);
      setIsStaff(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const applySession = async (nextSession: Session | null) => {
      if (!mounted) return;
      setLoading(true);

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await checkUserRole(nextSession.user.id);
      } else {
        setIsAdmin(false);
        setIsStaff(false);
      }

      if (mounted) setLoading(false);
    };

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      void applySession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isStaff,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
