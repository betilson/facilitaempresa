import { userService } from './services/databaseService';

// Test user data
const testUser = {
    name: 'João Silva',
    email: 'joao.silva@teste.ao',
    phone: '+244 923456789',
    isBusiness: false,
    isAdmin: false,
    isBank: false,
    plan: 'Gratuito',
    walletBalance: 0,
    topUpBalance: 0,
    accountStatus: 'Active' as const,
    settings: {
        notifications: true,
        allowMessages: true
    }
};

async function testUserCreation() {
    console.log('🧪 Testando criação de utilizador no Supabase...\n');

    try {
        // 1. Check if user already exists
        console.log('1️⃣ Verificando se o email já existe...');
        let existingUser;
        try {
            existingUser = await userService.getUserByEmail(testUser.email);
            if (existingUser) {
                console.log('⚠️  Utilizador já existe:', existingUser);
                console.log('\n📧 Email:', existingUser.email);
                console.log('👤 Nome:', existingUser.name);
                console.log('📱 Telefone:', existingUser.phone);
                console.log('🆔 ID:', existingUser.id);
                console.log('\n✅ Base de dados está a funcionar corretamente!');
                return;
            }
        } catch (error) {
            console.log('✅ Email disponível (utilizador não existe)');
        }

        // 2. Create new user
        console.log('\n2️⃣ Criando novo utilizador...');
        const newUser = await userService.createUser(testUser);

        console.log('\n✅ SUCESSO! Utilizador criado no Supabase:');
        console.log('━'.repeat(50));
        console.log('🆔 ID:', newUser.id);
        console.log('👤 Nome:', newUser.name);
        console.log('📧 Email:', newUser.email);
        console.log('📱 Telefone:', newUser.phone);
        console.log('💼 Empresa:', newUser.is_business ? 'Sim' : 'Não');
        console.log('💰 Saldo Carteira:', newUser.wallet_balance, 'Kz');
        console.log('💳 Saldo Carregamento:', newUser.topup_balance, 'Kz');
        console.log('📅 Criado em:', new Date(newUser.created_at).toLocaleString('pt-BR'));
        console.log('━'.repeat(50));

        // 3. Verify by retrieving the user
        console.log('\n3️⃣ Verificando se o utilizador foi salvo...');
        const retrievedUser = await userService.getUserByEmail(testUser.email);

        if (retrievedUser) {
            console.log('✅ Utilizador recuperado com sucesso!');
            console.log('📊 Dados conferem:', retrievedUser.email === testUser.email);
        }

        console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
        console.log('📝 A base de dados Supabase está a funcionar corretamente.');
        console.log('\n💡 Próximos passos:');
        console.log('   1. Verifique no Supabase Dashboard → Table Editor → users');
        console.log('   2. Deve ver o utilizador "João Silva" na tabela');
        console.log('   3. Teste criar um utilizador pela interface da aplicação');

    } catch (error: any) {
        console.error('\n❌ ERRO ao criar utilizador:');
        console.error('━'.repeat(50));

        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
            console.error('🔴 PROBLEMA: As tabelas não foram criadas no Supabase!');
            console.error('\n📋 SOLUÇÃO:');
            console.error('   1. Abra: https://vwtxiptmjlquhmycwaef.supabase.co');
            console.error('   2. Vá para SQL Editor');
            console.error('   3. Execute o arquivo: supabase/schema.sql');
            console.error('   4. Execute este teste novamente');
        } else if (error.message?.includes('JWT') || error.message?.includes('auth')) {
            console.error('🔴 PROBLEMA: Erro de autenticação!');
            console.error('\n📋 SOLUÇÃO:');
            console.error('   1. Verifique a API key em services/supabaseClient.ts');
            console.error('   2. Gere uma nova chave no Supabase Dashboard');
        } else {
            console.error('Detalhes do erro:', error.message);
            console.error('Stack:', error.stack);
        }

        console.error('━'.repeat(50));
    }
}

// Run the test
testUserCreation();
