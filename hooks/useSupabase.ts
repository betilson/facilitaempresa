import { useState, useEffect } from 'react';
import {
    userService,
    productService,
    transactionService,
    atmService,
    messageService,
    favoriteService,
    bankService
} from '../services/databaseService';
import { supabase } from '../services/supabaseClient.ts';
import type { User, Product, Transaction, ATM, Message, Bank } from '../types';

/**
 * Hook para sincronizar utilizadores com Supabase
 */
export function useSupabaseUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();

            // Convert Supabase format to User type
            const convertedUsers: User[] = data.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                isBusiness: u.is_business,
                isAdmin: u.is_admin,
                isBank: u.is_bank,
                nif: u.nif,
                plan: u.plan as any,
                profileImage: u.profile_image,
                coverImage: u.cover_image,
                address: u.address,
                province: u.province,
                municipality: u.municipality,
                walletBalance: Number(u.wallet_balance),
                topUpBalance: Number(u.topup_balance),
                accountStatus: u.account_status as any,
                settings: {
                    notifications: u.notifications_enabled,
                    allowMessages: u.allow_messages
                }
            }));

            setUsers(convertedUsers);
            setError(null);
        } catch (err: any) {
            console.error('Error loading users:', err);
            setError(err.message);
            // NOTE: removed fallback to localStorage to avoid showing browser-only data.
            // This forces the developer to fix Supabase (schema/keys) so data is persisted server-side.
        } finally {
            setLoading(false);
        }
    };

    const addUser = async (user: User) => {
        try {
            await userService.createUser(user);
            await loadUsers(); // Reload from database
        } catch (err) {
            console.error('Error adding user:', err);
            // Fallback to local state
            setUsers(prev => [...prev, user]);
            // Do NOT persist to localStorage here: prefer failing loudly so developer runs DB schema.
            // localStorage writes were removed to avoid data being stored only in the browser.
        }
    };

    const updateUser = async (userId: string, updates: Partial<User>) => {
        try {
            await userService.updateUser(userId, updates);
            await loadUsers(); // Reload from database
        } catch (err) {
            console.error('Error updating user:', err);
            // Fallback to local state
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
            // Avoid persisting to localStorage on write errors; this prevents data fragmentation between browsers.
        }
    };

    return { users, loading, error, addUser, updateUser, refreshUsers: loadUsers };
}

/**
 * Hook para sincronizar produtos com Supabase
 */
export function useSupabaseProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAllProducts();

            const convertedProducts: Product[] = data.map(p => ({
                id: p.id,
                title: p.title,
                price: Number(p.price),
                image: p.image,
                companyName: p.company_name,
                category: p.category as any,
                isPromoted: p.is_promoted,
                bankId: p.bank_id,
                ownerId: p.owner_id,
                description: p.description
            }));

            setProducts(convertedProducts);
        } catch (err) {
            console.error('Error loading products:', err);
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (product: Product) => {
        try {
            await productService.createProduct(product);
            await loadProducts();
        } catch (err) {
            console.error('Error adding product:', err);
            // Keep local optimistic update for UX, but rethrow the error so caller knows
            setProducts(prev => [product, ...prev]);
            throw err;
        }
    };

    const updateProduct = async (productId: string, updates: Partial<Product>) => {
        try {
            await productService.updateProduct(productId, updates);
            await loadProducts();
        } catch (err) {
            console.error('Error updating product:', err);
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
        }
    };

    const deleteProduct = async (productId: string) => {
        try {
            await productService.deleteProduct(productId);
            await loadProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    };

    return { products, loading, addProduct, updateProduct, deleteProduct, refreshProducts: loadProducts };
}

/**
 * Hook para sincronizar ATMs com Supabase
 */
export function useSupabaseATMs() {
    const [atms, setAtms] = useState<ATM[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadATMs();
    }, []);

    const loadATMs = async () => {
        try {
            setLoading(true);
            const data = await atmService.getAllATMs();

            const convertedATMs: ATM[] = data.map(a => ({
                id: a.id,
                name: a.name,
                bank: a.bank as any,
                address: a.address,
                status: a.status as any,
                distance: a.distance || '',
                lat: Number(a.lat),
                lng: Number(a.lng),
                lastUpdated: new Date(a.last_updated).toLocaleString(),
                votes: a.votes
            }));

            setAtms(convertedATMs);
        } catch (err) {
            console.error('Error loading ATMs:', err);
            // NOTE: removed fallback to localStorage to ensure ATMs are loaded from Supabase only.
        } finally {
            setLoading(false);
        }
    };

    const updateATM = async (atmId: string, updates: Partial<ATM>) => {
        try {
            await atmService.updateATMStatus(atmId, updates.status || '');
            await loadATMs();
        } catch (err) {
            console.error('Error updating ATM:', err);
            setAtms(prev => prev.map(a => a.id === atmId ? { ...a, ...updates } : a));
            // Avoid persisting ATM changes to localStorage on failure.
        }
    };

    const addATM = async (atm: ATM) => {
        try {
            console.log('DEBUG: Tentando adicionar ATM:', atm);
            const result = await atmService.createATM(atm);
            console.log('DEBUG: ATM criado com sucesso:', result);
            await loadATMs();
        } catch (err) {
            console.error('Error adding ATM:', err);
            console.error('DEBUG: Detalhes do erro:', JSON.stringify(err, null, 2));
            setAtms(prev => [atm, ...prev]);
        }
    };

    const deleteATM = async (atmId: string) => {
        try {
            await atmService.deleteATM(atmId);
            await loadATMs();
        } catch (err) {
            console.error('Error deleting ATM:', err);
            setAtms(prev => prev.filter(a => a.id !== atmId));
        }
    };

    return { atms, loading, updateATM, addATM, deleteATM, refreshATMs: loadATMs };
}

/**
 * Hook para sincronizar transações com Supabase
 */
export function useSupabaseTransactions(userId?: string) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadTransactions();
        }
    }, [userId]);

    const loadTransactions = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            const data = await transactionService.getUserTransactions(userId);

            const convertedTransactions: Transaction[] = data.map(t => ({
                id: t.id,
                user: t.user_id,
                plan: t.plan,
                productName: t.product_name,
                amount: Number(t.amount),
                date: t.date,
                timestamp: Number(t.timestamp),
                status: t.status as any,
                method: t.method as any,
                category: t.category as any,
                reference: t.reference,
                otherPartyName: t.other_party_name,
                proofUrl: t.proof_url
            }));

            setTransactions(convertedTransactions);
        } catch (err) {
            console.error('Error loading transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (transaction: Transaction) => {
        try {
            await transactionService.createTransaction(transaction);
            await loadTransactions();
        } catch (err) {
            console.error('Error adding transaction:', err);
            setTransactions(prev => [transaction, ...prev]);
        }
    };

    return { transactions, loading, addTransaction, refreshTransactions: loadTransactions };
}

/**
 * Hook para sincronizar mensagens com Supabase
 */
export function useSupabaseMessages(userId?: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadMessages();
        }
    }, [userId]);

    const loadMessages = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            const data = await messageService.getUserMessages(userId);

            const convertedMessages: Message[] = data.map(m => ({
                id: m.id,
                senderId: m.sender_id,
                senderName: m.sender_name,
                receiverId: m.receiver_id,
                productId: m.product_id,
                productName: m.product_name,
                content: m.content,
                timestamp: Number(m.timestamp),
                isRead: m.is_read,
                isFromBusiness: m.is_from_business
            }));

            setMessages(convertedMessages);
        } catch (err) {
            console.error('Error loading messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (message: Message) => {
        try {
            await messageService.sendMessage(message);
            await loadMessages();
        } catch (err) {
            console.error('Error sending message:', err);
            setMessages(prev => [message, ...prev]);
        }
    };

    return { messages, loading, sendMessage, refreshMessages: loadMessages };
}

/**
 * Hook para sincronizar bancos/empresas com Supabase
 */
export function useSupabaseBanks() {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBanks();
        // Subscribe to realtime changes on banks so all clients refresh automatically
        const channel = supabase
            .channel('realtime-banks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'banks' }, () => {
                loadBanks();
            })
            .subscribe();

        return () => {
            try { channel.unsubscribe(); } catch (e) { /* ignore */ }
        };
    }, []);

    const loadBanks = async () => {
        try {
            setLoading(true);
            const data = await bankService.getAllBanks();

            const converted: Bank[] = data.map((b: any) => ({
                id: b.id,
                name: b.name,
                logo: b.logo,
                coverImage: b.cover_image,
                description: b.description,
                followers: b.followers || 0,
                reviews: b.reviews || 0,
                phone: b.phone,
                email: b.email,
                nif: b.nif,
                address: b.address,
                province: b.province,
                municipality: b.municipality,
                parentId: b.parent_id,
                type: b.type
            }));

            setBanks(converted);
        } catch (err) {
            console.error('Error loading banks:', err);
        } finally {
            setLoading(false);
        }
    };

    const addBank = async (bank: Bank) => {
        try {
            // Map camelCase to snake_case for DB columns
            const payload: any = {
                id: bank.id,
                name: bank.name,
                logo: bank.logo,
                cover_image: bank.coverImage,
                description: bank.description,
                followers: bank.followers,
                reviews: bank.reviews,
                phone: bank.phone,
                email: bank.email,
                nif: bank.nif,
                address: bank.address,
                province: bank.province,
                municipality: bank.municipality,
                parent_id: bank.parentId,
                type: bank.type
            };
            await bankService.createBank(payload);
            await loadBanks();
        } catch (err) {
            console.error('Error adding bank:', err);
            setBanks(prev => [bank, ...prev]);
        }
    };

    const updateBank = async (bankId: string, updates: Partial<Bank>) => {
        try {
            // map updates to DB column names if necessary
            const payload: any = {};
            if ((updates as any).name) payload.name = (updates as any).name;
            if ((updates as any).logo) payload.logo = (updates as any).logo;
            if ((updates as any).coverImage) payload.cover_image = (updates as any).coverImage;
            if ((updates as any).description) payload.description = (updates as any).description;
            if ((updates as any).followers !== undefined) payload.followers = (updates as any).followers;
            if ((updates as any).reviews !== undefined) payload.reviews = (updates as any).reviews;
            if ((updates as any).phone) payload.phone = (updates as any).phone;
            if ((updates as any).email) payload.email = (updates as any).email;
            if ((updates as any).nif) payload.nif = (updates as any).nif;
            if ((updates as any).address) payload.address = (updates as any).address;
            if ((updates as any).province) payload.province = (updates as any).province;
            if ((updates as any).municipality) payload.municipality = (updates as any).municipality;
            if ((updates as any).parentId) payload.parent_id = (updates as any).parentId;
            if ((updates as any).type) payload.type = (updates as any).type;

            await bankService.updateBank(bankId, payload);
            await loadBanks();
        } catch (err) {
            console.error('Error updating bank:', err);
            setBanks(prev => prev.map(b => b.id === bankId ? { ...b, ...updates } as Bank : b));
        }
    };

    const deleteBank = async (bankId: string) => {
        try {
            await bankService.deleteBank(bankId);
            await loadBanks();
        } catch (err) {
            console.error('Error deleting bank:', err);
            setBanks(prev => prev.filter(b => b.id !== bankId));
        }
    };

    return { banks, loading, addBank, updateBank, deleteBank, refreshBanks: loadBanks };
}
