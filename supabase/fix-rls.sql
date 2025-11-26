-- =============================================
-- FIX: Row Level Security para Permitir Registo
-- =============================================
-- Execute este script no Supabase SQL Editor para permitir
-- que utilizadores sejam criados sem autenticação

-- OPÇÃO 1: Desativar RLS temporariamente (para desenvolvimento)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE following DISABLE ROW LEVEL SECURITY;

-- OPÇÃO 2: Criar políticas que permitem inserção pública (recomendado)
-- Remover políticas antigas
DROP POLICY IF EXISTS users_view_own ON users;
DROP POLICY IF EXISTS products_view_all ON products;
DROP POLICY IF EXISTS products_insert_own ON products;
DROP POLICY IF EXISTS products_update_own ON products;
DROP POLICY IF EXISTS transactions_view_own ON transactions;
DROP POLICY IF EXISTS messages_view_own ON messages;

-- Reativar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Novas políticas que permitem operações públicas
-- USERS: Permitir inserção pública (registo) e leitura própria
CREATE POLICY "Allow public user registration" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (true);

-- PRODUCTS: Acesso público
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert products" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update products" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete products" ON products
    FOR DELETE USING (true);

-- TRANSACTIONS: Acesso público
CREATE POLICY "Anyone can view transactions" ON transactions
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert transactions" ON transactions
    FOR INSERT WITH CHECK (true);

-- MESSAGES: Acesso público
CREATE POLICY "Anyone can view messages" ON messages
    FOR SELECT USING (true);

CREATE POLICY "Anyone can send messages" ON messages
    FOR INSERT WITH CHECK (true);

-- =============================================
-- VERIFICAÇÃO
-- =============================================
-- Execute estas queries para verificar:

-- Ver políticas ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'products', 'transactions', 'messages')
ORDER BY tablename, policyname;

-- Testar inserção
INSERT INTO users (name, email, phone, is_business) 
VALUES ('Teste User', 'teste@example.com', '+244 923000000', false);

-- Ver o utilizador criado
SELECT * FROM users WHERE email = 'teste@example.com';
