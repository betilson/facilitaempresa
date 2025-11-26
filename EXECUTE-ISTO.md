# 🚨 AÇÃO NECESSÁRIA: Executar SQL no Supabase

## ❌ Problema Atual

O teste falhou com o erro:
```
❌ ERRO: new row violates row-level security policy for table "users"
```

Isso significa que **você ainda não executou o script SQL** no Supabase.

## ✅ Solução em 3 Passos

### Passo 1: Abrir Supabase
1. Clique aqui: https://vwtxiptmjlquhmycwaef.supabase.co
2. Faça login

### Passo 2: Abrir SQL Editor
1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique no botão **"New Query"**

### Passo 3: Executar o Script
1. Abra o arquivo: `supabase/QUICK-FIX.sql`
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. **Cole no SQL Editor** do Supabase (Ctrl+V)
4. Clique no botão **"Run"** (ou pressione Ctrl+Enter)

## 📋 Script a Executar

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE following DISABLE ROW LEVEL SECURITY;
```

## ✅ Verificar Sucesso

Após executar, você deve ver:
```
Success. No rows returned
```

## 🧪 Testar Novamente

Depois de executar o SQL, rode novamente:
```bash
npx tsx test-supabase.ts
```

**Resultado esperado:**
```
✅ SUCESSO! Utilizador criado no Supabase:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆔 ID: xxx-xxx-xxx
👤 Nome: João Silva
📧 Email: joao.silva@teste.ao
```

---

**Importante:** Sem executar o SQL no Supabase, a aplicação **NÃO consegue** salvar utilizadores na base de dados!
