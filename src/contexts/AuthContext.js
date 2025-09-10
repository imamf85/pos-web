import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  const isValidating = useRef(false);
  const mountedRef = useRef(true);

  const validateUserEmail = async (authUser) => {
    if (isValidating.current) {
      console.log('⚠️ Validation already in progress, skipping...');
    }

    console.log('🔍 Validating user email:', authUser?.email);

    if (!authUser?.email) {
      console.log('❌ No email found in authUser');
      return null;
    }

    isValidating.current = true;

    try {
      console.log('📡 Querying users table...');
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();

      console.log('📊 Query result:', { profile, error });

      if (error) {
        console.error('❌ Database query error:', error);
        if (error.code === 'PGRST116') {
          console.log('👤 User not found in users table');
          await supabase.auth.signOut();
          alert('Email Anda tidak terdaftar dalam sistem. Hubungi administrator.');
          return null;
        }
        // For other errors, don't sign out, just return null
        return null;
      }

      if (!profile) {
        console.log('❌ No profile found');
        await supabase.auth.signOut();
        alert('Email Anda tidak terdaftar dalam sistem. Hubungi administrator.');
        return null;
      }

      console.log('✅ User validation successful:', profile);
      return profile;
    } catch (error) {
      console.error('💥 Error validating user:', error);
      return null;
    } finally {
      isValidating.current = false;
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    const initialize = async () => {
      console.log('🚀 AuthProvider: Initializing...');

      if (!supabase || !supabase.auth) {
        console.error('❌ Supabase client or auth is not available.');
        if (mountedRef.current) setLoading(false);
        return;
      }

      try {
        console.log('🔄 Getting current session...');
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('📋 Session data:', {
          session: session ? {
            user: session.user ? {
              id: session.user.id,
              email: session.user.email,
              email_verified: session.user.email_verified,
              user_metadata: session.user.user_metadata
            } : null,
            access_token: session.access_token ? '***exists***' : null,
            expires_at: session.expires_at
          } : null,
          error
        });

        if (error) {
          console.error('❌ Session error:', error);
          if (mountedRef.current) setLoading(false);
          return;
        }

        if (session?.user && mountedRef.current) {
          console.log('👤 User found in session, validating...');
          const profile = await validateUserEmail(session.user);
          if (profile && mountedRef.current) {
            console.log('✅ Setting user and profile');
            setUser(session.user);
            setUserProfile(profile);
          } else {
            console.log('❌ Profile validation failed');
          }
        } else {
          console.log('ℹ️ No user in session');
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
      } finally {
        if (mountedRef.current) {
          console.log('🏁 Initialization complete, setting loading to false');
          setLoading(false);
        }
      }
    };

    // Fallback timeout
    const loadingTimeout = setTimeout(() => {
      if (mountedRef.current) {
        console.log('⏰ Loading timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 10000);

    initialize();

    console.log('👂 Setting up auth state listener...');
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange?.(async (event, session) => {
      if (!mountedRef.current) return;

      console.log('🔄 Auth state change:', {
        event,
        user_email: session?.user?.email,
        user_id: session?.user?.id,
        hasExistingUser: !!user,
        hasExistingProfile: !!userProfile
      });

      // Handle different auth events
      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      // For token refresh, just update the user object if we already have a profile
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        if (user?.id === session.user.id && userProfile) {
          console.log('🔄 Token refreshed for existing user - updating user object only');
          setUser(session.user); // Update with fresh token
          return; // Don't re-validate
        }
      }

      // For sign in or initial session
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        // Check if this is the same user we already have
        if (user?.id === session.user.id && userProfile && !isValidating.current) {
          console.log('👤 Same user already loaded, skipping validation');
          setUser(session.user); // Update with potentially fresh token
          return;
        }

        if (event === 'SIGNED_IN') {
          console.log('🔄 User signed in, setting loading to true');
          setLoading(true);
        }

        console.log('🔍 Validating user from auth state change...');
        const profile = await validateUserEmail(session.user);
        if (profile && mountedRef.current) {
          console.log('✅ Setting user and profile from auth change');
          setUser(session.user);
          setUserProfile(profile);
        } else if (!profile && mountedRef.current) {
          console.log('❌ Clearing user and profile');
          setUser(null);
          setUserProfile(null);
        }

        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }) || { subscription: null };

    if (!subscription) {
      console.error('❌ Failed to set up auth state listener');
    } else {
      console.log('✅ Auth state listener set up successfully');
    }

    return () => {
      console.log('🧹 Cleaning up AuthProvider');
      mountedRef.current = false;
      clearTimeout(loadingTimeout);
      subscription?.unsubscribe();
    };
  }, []); // No dependencies to prevent unnecessary re-runs

  const signOut = async () => {
    console.log('👋 Signing out...');
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signOut,
  };

  console.log('🎯 AuthProvider value:', {
    user: user ? { id: user.id, email: user.email } : null,
    userProfile: userProfile ? { id: userProfile.id, email: userProfile.email } : null,
    loading,
    isValidating: isValidating.current
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};