-- =============================================
-- SOLUÇÃO RÁPIDA: Desativar RLS
-- =============================================
-- Copie e cole este código no Supabase SQL Editor
-- e clique em RUN

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_bank_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE banks DISABLE ROW LEVEL SECURITY;
ALTER TABLE atms DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE following DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateways DISABLE ROW LEVEL SECURITY;
ALTER TABLE platform_bank_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE atm_votes DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS foi desativado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'products', 'transactions')
ORDER BY tablename;

-- Deve mostrar rowsecurity = false para todas as tabelas
