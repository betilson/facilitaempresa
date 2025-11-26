# ⚠️ IMPORTANTE: Configurar Base de Dados Supabase

## 🔴 Problema Identificado

O utilizador está a ser criado no código mas **NÃO está a ser guardado no Supabase** porque as tabelas ainda não foram criadas na base de dados.

## ✅ Solução Implementada

1. ✅ Integrei o `databaseService` no componente Login
2. ✅ Modifiquei a função de registo para guardar no Supabase
3. ✅ Adicionei fallback para localStorage caso Supabase falhe

## 🚨 PRÓXIMO PASSO OBRIGATÓRIO

Você **PRECISA** executar o schema SQL no Supabase para criar as tabelas:

### Passo a Passo:

1. **Abra o Supabase Dashboard**
   - URL: https://vwtxiptmjlquhmycwaef.supabase.co
   - Faça login

2. **Vá para SQL Editor**
   - Menu lateral → **SQL Editor**
   - Clique em **New Query**

3. **Execute o Schema**
   - Abra: `supabase/schema.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor
   - Clique em **Run** (ou Ctrl+Enter)

4. **Verifique as Tabelas**
   - Menu lateral → **Table Editor**
   - Deve ver 18 tabelas criadas

## 🧪 Como Testar

Após executar o schema SQL:

1. Abra a aplicação: http://localhost:5173/
2. Clique em "Criar conta"
3. Preencha os dados
4. Clique em "Criar Conta"
5. Verifique no console do navegador (F12) se aparece: "User saved to Supabase"
6. Vá ao Supabase → Table Editor → `users` → Deve ver o novo utilizador

## 📊 Verificar no Supabase

```sql
-- Ver todos os utilizadores
SELECT * FROM users;

-- Ver último utilizador criado
SELECT * FROM users ORDER BY created_at DESC LIMIT 1;
```

## 🔍 Debug

Se aparecer erro no console:

1. **"relation does not exist"** → Execute o schema.sql
2. **"JWT expired"** → Verifique a API key no supabaseClient.ts
3. **"permission denied"** → Desative RLS temporariamente:
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ```

## 🔧 Variáveis de ambiente (recomendado)

Crie um ficheiro `.env` na raiz do projeto com as credenciais do seu projeto Supabase para evitar chaves hardcoded. Exemplo:

```
VITE_SUPABASE_URL=https://vwtxiptmjlquhmycwaef.supabase.co
VITE_SUPABASE_KEY=seu_public_anon_ou_sb_key_aqui
```

Depois reinicie o servidor de desenvolvimento (`npm run dev`) para que o Vite carregue as variáveis.

> Observação: se a base de dados não tiver o schema aplicado, as operações de escrita (insert/update) irão falhar e a aplicação pode usar fallbacks locais. Execute o `supabase/schema.sql` conforme instruções acima para persistência real no Supabase.

## 📝 Notas

- O código agora tenta salvar no Supabase primeiro
- Se falhar, salva localmente (fallback)
- Mensagens de sucesso indicam onde foi salvo
- Logs no console mostram detalhes da operação
