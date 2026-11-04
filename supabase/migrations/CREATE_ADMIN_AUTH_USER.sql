-- ============================================================================
-- PROVISION SYSTEM ADMIN AUTH CREDENTIALS (WITH AUTH.IDENTITIES)
-- ============================================================================
-- Run this script in the Supabase SQL Editor.
-- Supabase GoTrue requires entries in BOTH auth.users AND auth.identities
-- for email/password authentication to succeed.
--
-- Credentials:
--   Email:    admin@sti.edu
--   Password: admin123456
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    v_admin_id UUID;
    v_encrypted_pw TEXT;
BEGIN
    v_encrypted_pw := crypt('admin123456', gen_salt('bf'));

    -- 1. Find existing auth user or generate new UUID
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@sti.edu' LIMIT 1;

    IF v_admin_id IS NULL THEN
        v_admin_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_admin_id,
            'authenticated',
            'authenticated',
            'admin@sti.edu',
            v_encrypted_pw,
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"IT System Administrator"}'::jsonb,
            NOW(),
            NOW(),
            '',
            ''
        );
    ELSE
        -- Update password and ensure email is confirmed
        UPDATE auth.users 
        SET encrypted_password = v_encrypted_pw,
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE id = v_admin_id;
    END IF;

    -- 2. MANDATORY: Ensure record in auth.identities
    -- GoTrue validates identities for email/password logins
    DELETE FROM auth.identities WHERE user_id = v_admin_id;
    
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        v_admin_id,
        v_admin_id,
        format('{"sub":"%s","email":"%s"}', v_admin_id, 'admin@sti.edu')::jsonb,
        'email',
        v_admin_id::text,
        NOW(),
        NOW(),
        NOW()
    );

    -- 3. Link auth_user_id to public.users record
    UPDATE public.users 
    SET auth_user_id = v_admin_id,
        role = 'system_admin'
    WHERE email = 'admin@sti.edu';

END $$;
