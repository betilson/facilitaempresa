-- ============================================================
-- CONFIGURAR POLÍTICAS RLS PARA ATMs
-- ============================================================
-- Este script configura o Row Level Security (RLS) para permitir
-- que todos os usuários possam ler/criar/atualizar ATMs
-- ============================================================

-- Passo 1: Habilitar RLS na tabela (se ainda não estiver)
ALTER TABLE atms ENABLE ROW LEVEL SECURITY;

-- Passo 2: Remover políticas existentes (para recriar)
DROP POLICY IF EXISTS "Permitir leitura pública de ATMs" ON atms;
DROP POLICY IF EXISTS "Permitir inserção de ATMs" ON atms;
DROP POLICY IF EXISTS "Permitir atualização de ATMs" ON atms;

-- Passo 3: Criar política de LEITURA PÚBLICA
-- Qualquer pessoa pode ler todos os ATMs (autenticada ou não)
CREATE POLICY "Permitir leitura pública de ATMs"
ON atms FOR SELECT
USING (true);

-- Passo 4: Criar política de INSERÇÃO
-- Qualquer usuário autenticado pode criar ATMs
CREATE POLICY "Permitir inserção de ATMs"
ON atms FOR INSERT
WITH CHECK (true);

-- Passo 5: Criar política de ATUALIZAÇÃO
-- Qualquer usuário autenticado pode atualizar ATMs (para votos)
CREATE POLICY "Permitir atualização de ATMs"
ON atms FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================================
-- FIM - ATMs agora são visíveis para todos os usuários
-- ============================================================
