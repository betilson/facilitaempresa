-- ============================================================
-- REMOVER RESTRIÇÃO DE BANCO NA TABELA ATMs
-- ============================================================
-- Execute este código no SQL Editor do Supabase
-- para permitir qualquer nome de banco nos ATMs
-- ============================================================

-- Passo 1: Remover a restrição de check
ALTER TABLE atms DROP CONSTRAINT IF EXISTS atms_bank_check;

-- Passo 2: Alterar o tipo da coluna para TEXT (permitir qualquer texto)
ALTER TABLE atms ALTER COLUMN bank TYPE TEXT;

-- ============================================================
-- FIM - Após executar, os ATMs poderão ser salvos com qualquer nome de banco
-- ============================================================
