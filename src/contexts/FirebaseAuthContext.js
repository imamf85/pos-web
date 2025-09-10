import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
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
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate user email against Supabase
  const validateUserEmail = async (authUser) => {
    console.log('🔍 Validating user email:', authUser?.email);

    if (!authUser?.email) {
      console.log('❌ No email found in authUser');
      return null;
    }

    try {
      console.log('📡 Querying Supabase users table...');
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();

      if (error || !profile) {
        console.log('❌ User not found in Supabase users table');
        await firebaseSignOut(auth);
        alert('Email Anda tidak terdaftar dalam sistem. Hubungi administrator.');
        return null;
      }

      console.log('✅ User validation successful:', profile);
      return profile;
    } catch (error) {
      console.error('💥 Error validating user:', error);
      return null;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { data: result, error: null };
    } catch (error) {
      console.error('❌ Error signing in with Google:', error);
      return { data: null, error };
    }
  };

  // Sign out
  const signOut = async () => {
    console.log('👋 Signing out...');
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  useEffect(() => {
    console.log('🚀 AuthProvider: Initializing...');
    let mounted = true;

    if (!auth) {
      console.error('❌ Firebase auth is not available');
      if (mounted) setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) {
        console.log('⚠️ Component unmounted, skipping auth state change');
        return;
      }

      console.log('🔄 Auth state changed:', firebaseUser ? firebaseUser.email : 'null');

      if (firebaseUser) {
        console.log('👤 User found, validating...');
        const profile = await validateUserEmail(firebaseUser);
        
        if (profile && mounted) {
          console.log('✅ Setting user and profile');
          setUser(firebaseUser);
          setUserProfile(profile);
        } else if (mounted) {
          console.log('❌ Profile validation failed');
          setUser(null);
          setUserProfile(null);
        }
      } else {
        console.log('ℹ️ No user signed in');
        if (mounted) {
          setUser(null);
          setUserProfile(null);
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 Cleaning up AuthProvider');
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    signOut,
    signInWithGoogle,
  };

  console.log('🎯 AuthProvider value:', {
    user: user ? { uid: user.uid, email: user.email } : null,
    userProfile: userProfile ? { id: userProfile.id, email: userProfile.email } : null,
    loading
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};