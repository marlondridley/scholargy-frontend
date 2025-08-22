// src/components/SupabaseAuth.js
import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../utils/supabase';

const SupabaseAuth = ({ onAuthSuccess }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#2563eb', // blue-600
                brandAccent: '#1d4ed8', // blue-700
                brandButtonText: 'white',
                defaultButtonBackground: '#f3f4f6', // gray-100
                defaultButtonBackgroundHover: '#e5e7eb', // gray-200
                defaultButtonBorder: '#d1d5db', // gray-300
                defaultButtonText: '#374151', // gray-700
                dividerBackground: '#e5e7eb', // gray-200
                inputBackground: '#f9fafb', // gray-50
                inputBorder: '#d1d5db', // gray-300
                inputBorderHover: '#9ca3af', // gray-400
                inputBorderFocus: '#2563eb', // blue-600
                inputText: '#374151', // gray-700
                inputLabelText: '#6b7280', // gray-500
                inputPlaceholder: '#9ca3af', // gray-400
                messageText: '#dc2626', // red-600
                messageTextDanger: '#dc2626', // red-600
                anchorTextColor: '#2563eb', // blue-600
                anchorTextHoverColor: '#1d4ed8', // blue-700
              },
              space: {
                inputPadding: '16px',
                buttonPadding: '12px 24px',
                borderRadius: '8px',
              },
              fontSizes: {
                baseBodySize: '14px',
                baseInputSize: '14px',
                baseLabelSize: '14px',
                baseButtonSize: '14px',
              },
            },
          },
        }}
        providers={['google']}
        redirectTo={`${window.location.origin}/auth/callback`}
        options={{
            scopes: 'email profile openid https://www.googleapis.com/auth/calendar.readonly'
        }}
        onAuthStateChange={(event, session) => {
          if (event === 'SIGNED_IN' && onAuthSuccess) {
            onAuthSuccess(session);
          }
        }}
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email',
              password_label: 'Password',
              button_label: 'Sign In',
              loading_button_label: 'Signing In...',
              social_provider_text: 'Sign in with {{provider}}',
              link_text: 'Already have an account? Sign in',
            },
            sign_up: {
              email_label: 'Email',
              password_label: 'Password',
              button_label: 'Sign Up',
              loading_button_label: 'Signing Up...',
              social_provider_text: 'Sign up with {{provider}}',
              link_text: "Don't have an account? Sign up",
            },
            forgotten_password: {
              email_label: 'Email',
              button_label: 'Send Reset Instructions',
              loading_button_label: 'Sending...',
              link_text: 'Forgot your password?',
            },
            magic_link: {
              email_input_label: 'Email',
              button_label: 'Send Magic Link',
              loading_button_label: 'Sending...',
              link_text: 'Send a magic link email',
            },
          },
        }}
      />
    </div>
  );
};

export default SupabaseAuth;
