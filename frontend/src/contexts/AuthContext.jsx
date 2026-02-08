import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      throw new Error(error.message || 'Invalid login credentials');
    }
  };

  const signup = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      // Check if the error is due to existing user
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        throw new Error('You are already signed up. Please login instead.');
      }
      throw new Error(error.message || 'Signup failed');
    }

    // Check if user already exists (Supabase sometimes returns success even for existing users)
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error('You are already signed up. Please login instead.');
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          full_name: name,
          email: email,
          is_premium: false,
          uploads_today: 0
        }]);

      if (profileError) {
        console.error("Error creating profile:", profileError.message);
        throw new Error('Failed to create user profile');
      }
      
      return {
        success: true,
        message: "Check your email for a confirmation link!",
        user: data.user
      };
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};