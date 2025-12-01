
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import {
    userService,
    productService,
    atmService,
    transactionService,
    messageService,
    bankService
} from '../services/databaseService';
import { User, Product, ATM, Transaction, Message, Bank, Notification } from '../types';
import { MOCK_PRODUCTS, MOCK_ATMS, BANKS } from '../constants';

export function useSupabaseUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
        const channel = supabase
            .channel('realtime-users')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
                loadUsers();
            })
            .subscribe();

        return () => {
            try { channel.unsubscribe(); } catch (e) { /* ignore */ }
        };
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            // Map DB user to App User type
            const mappedUsers: User[] = data.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                isBusiness: u.is_business,
                isAdmin: u.is_admin,
                isBank: u.is_bank,
                nif: u.nif,
                plan: u.plan,
                profileImage: u.profile_image,
                coverImage: u.cover_image,
                address: u.address,
                province: u.province,
                municipality: u.municipality,
                walletBalance: Number(u.wallet_balance),
                topUpBalance: Number(u.topup_balance),
                accountStatus: u.account_status,
                settings: {
                    notifications: u.notifications_enabled,
                    allowMessages: u.allow_messages
                },
                isVerified: u.is_verified,
                favorites: u.favorites || [],
                following: u.following || []
            }));
            setUsers(mappedUsers);
        } catch (error: any) {
            console.error('Error loading users:', error.message || JSON.stringify(error));
        } finally {
            setLoading(false);
        }
    };

    const addUser = async (user: Partial<User>) => {
        try {
            await userService.createUser(user);
            await loadUsers();
        } catch (error: any) {
            console.error('Error adding user:', error.message || JSON.stringify(error));
        }
    };

    const updateUser = async (userId: string, updates: Partial<User>) => {
        try {
            await userService.updateUser(userId, updates);
            await loadUsers();
        } catch (error: any) {
            console.error('Error updating user:', error.message || JSON.stringify(error));
        }
    };

    return { users, loading, addUser, updateUser, refreshUsers: loadUsers };
}

export function useSupabaseProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
        const channel = supabase
            .channel('realtime-products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                loadProducts();
            })
            .subscribe();

        return () => {
            try { channel.unsubscribe(); } catch (e) { /* ignore */ }
        };
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAllProducts();
            const mappedProducts: Product[] = data.map(p => ({
                id: p.id,
                title: p.title,
                price: Number(p.price),
                image: p.image,
                companyName: p.company_name,
                category: p.category,
                isPromoted: p.is_promoted,
                bankId: p.bank_id,
                ownerId: p.owner_id,
                description: p.description,
                gallery: p.product_gallery ? p.product_gallery.map((g: any) => g.image_url) : []
            }));
            setProducts(mappedProducts);
        } catch (error: any) {
            console.error('Error loading products:', error.message || JSON.stringify(error));
            console.warn('Supabase fetch failed. Using MOCK_PRODUCTS fallback.');
            setProducts(MOCK_PRODUCTS);
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (product: Partial<Product>) => {
        try {
            // Optimistic update: Add to local state immediately
            const tempProduct = product as Product;
            setProducts(prev => [...prev, tempProduct]);

            await productService.createProduct(product);
            // Refresh to get the server-generated data (gallery, etc.)
            await loadProducts();
        } catch (error: any) {
            // Revert optimistic update on error
            setProducts(prev => prev.filter(p => p.id !== product.id));
            console.error('Error adding product:', error.message || JSON.stringify(error));
            throw error;
        }
    };

    const updateProduct = async (productId: string, updates: Partial<Product>) => {
        const originalProduct = products.find(p => p.id === productId);

        try {
            // Optimistic update: Update local state immediately
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));

            await productService.updateProduct(productId, updates);
        } catch (error: any) {
            // Revert optimistic update on error
            if (originalProduct) {
                setProducts(prev => prev.map(p => p.id === productId ? originalProduct : p));
            }
            console.error('Error updating product:', error.message || JSON.stringify(error));
            throw error;
        }
    };

    const deleteProduct = async (productId: string) => {
        const originalProduct = products.find(p => p.id === productId);
        const originalIndex = products.findIndex(p => p.id === productId);

        try {
            // Optimistic update: Remove from local state immediately
            setProducts(prev => prev.filter(p => p.id !== productId));

            await productService.deleteProduct(productId);
        } catch (error: any) {
            // Revert optimistic update on error
            if (originalProduct && originalIndex !== -1) {
                setProducts(prev => {
                    const newProducts = [...prev];
                    newProducts.splice(originalIndex, 0, originalProduct);
                    return newProducts;
                });
            }
            console.error('Error deleting product:', error.message || JSON.stringify(error));
            throw error;
        }
    };

    return { products, loading, addProduct, updateProduct, deleteProduct, refreshProducts: loadProducts };
}

export function useSupabaseATMs() {
    const [atms, setAtms] = useState<ATM[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadATMs();
        const channel = supabase
            .channel('realtime-atms')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'atms' }, () => {
                loadATMs();
            })
            .subscribe();

        return () => {
            try { channel.unsubscribe(); } catch (e) { /* ignore */ }
        };
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
        } catch (err: any) {
            console.error('Error loading ATMs:', err.message || JSON.stringify(err));
            console.warn('Supabase fetch failed. Using MOCK_ATMS fallback.');
            setAtms(MOCK_ATMS);
        } finally {
            setLoading(false);
        }
    };

    const updateATM = async (atmId: string, updates: Partial<ATM>) => {
        const originalATM = atms.find(a => a.id === atmId);

        try {
            // Optimistic update: Update local state immediately
            setAtms(prev => prev.map(a => a.id === atmId ? { ...a, ...updates } : a));

            await atmService.updateATMStatus(atmId, updates.status || '');
        } catch (err: any) {
            // Revert optimistic update on error
            if (originalATM) {
                setAtms(prev => prev.map(a => a.id === atmId ? originalATM : a));
            }
            console.error('Error updating ATM:', err.message || JSON.stringify(err));
            throw err;
        }
    };

    const addATM = async (atm: ATM) => {
        try {
            // Optimistic update: Add to local state immediately
            setAtms(prev => [atm, ...prev]);

            await atmService.createATM(atm);
        } catch (err: any) {
            // Revert optimistic update on error
            setAtms(prev => prev.filter(a => a.id !== atm.id));
            console.error('Error adding ATM:', err.message || JSON.stringify(err));
            throw err;
        }
    };

    const deleteATM = async (atmId: string) => {
        const originalATM = atms.find(a => a.id === atmId);
        const originalIndex = atms.findIndex(a => a.id === atmId);

        try {
            // Optimistic update: Remove from local state immediately
            setAtms(prev => prev.filter(a => a.id !== atmId));

            await atmService.deleteATM(atmId);
        } catch (err: any) {
            // Revert optimistic update on error
            if (originalATM && originalIndex !== -1) {
                setAtms(prev => {
                    const newATMs = [...prev];
                    newATMs.splice(originalIndex, 0, originalATM);
                    return newATMs;
                });
            }
            console.error('Error deleting ATM:', err.message || JSON.stringify(err));
            throw err;
        }
    };

    const voteATM = async (userId: string, atmId: string) => {
        try {
            await atmService.voteATM(userId, atmId);
            await loadATMs();
        } catch (err: any) {
            console.error('Error voting ATM:', err.message || JSON.stringify(err));
        }
    };

    return { atms, loading, updateATM, addATM, deleteATM, voteATM, refreshATMs: loadATMs };
}

export function useSupabaseTransactions(userId?: string) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadTransactions();
            const channel = supabase
                .channel('realtime-transactions')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, () => {
                    loadTransactions();
                })
                .subscribe();

            return () => {
                try { channel.unsubscribe(); } catch (e) { /* ignore */ }
            };
        }
    }, [userId]);

    const loadTransactions = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const data = await transactionService.getUserTransactions(userId);
            const mappedTransactions: Transaction[] = data.map(t => ({
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
            setTransactions(mappedTransactions);
        } catch (error: any) {
            console.error('Error loading transactions:', error.message || JSON.stringify(error));
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (transaction: Transaction) => {
        try {
            await transactionService.createTransaction(transaction);
            await loadTransactions();
        } catch (error: any) {
            console.error('Error adding transaction:', error.message || JSON.stringify(error));
        }
    };

    return { transactions, loading, addTransaction, refreshTransactions: loadTransactions };
}

export function useSupabaseMessages(userId?: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadMessages();
            const channel = supabase
                .channel('realtime-messages')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, () => {
                    loadMessages();
                })
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=eq.${userId}` }, () => {
                    loadMessages();
                })
                .subscribe();

            return () => {
                try { channel.unsubscribe(); } catch (e) { /* ignore */ }
            };
        }
    }, [userId]);

    const loadMessages = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const data = await messageService.getUserMessages(userId);
            const mappedMessages: Message[] = data.map(m => ({
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
            setMessages(mappedMessages);
        } catch (error: any) {
            console.error('Error loading messages:', error.message || JSON.stringify(error));
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (message: Message) => {
        try {
            await messageService.sendMessage(message);
            await loadMessages();
        } catch (error: any) {
            console.error('Error sending message:', error.message || JSON.stringify(error));
        }
    };

    return { messages, loading, sendMessage, refreshMessages: loadMessages };
}

export function useSupabaseBanks() {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBanks();
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
            const mappedBanks: Bank[] = data.map(b => ({
                id: b.id,
                name: b.name,
                logo: b.logo,
                coverImage: b.cover_image,
                description: b.description,
                followers: b.followers,
                reviews: b.reviews,
                phone: b.phone,
                email: b.email,
                nif: b.nif,
                address: b.address,
                province: b.province,
                municipality: b.municipality,
                parentId: b.parent_id,
                type: b.type as any,
                isBank: b.is_bank ?? false // Use database value, default to false if null
            }));
            setBanks(mappedBanks);
        } catch (error: any) {
            console.error('Error loading banks:', error.message || JSON.stringify(error));
            console.warn('Supabase fetch failed. Using BANKS fallback.');
            setBanks(BANKS);
        } finally {
            setLoading(false);
        }
    };

    const addBank = async (bank: Bank) => {
        try {
            console.log('[useSupabase] addBank called with:', bank);

            // Optimistic update: Add to local state immediately
            setBanks(prev => [...prev, bank]);

            const dbBank = {
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
                type: bank.type,
                is_bank: bank.isBank
            };
            console.log('[useSupabase] Sending to database:', dbBank);
            const result = await bankService.createBank(dbBank);
            console.log('[useSupabase] Bank created successfully:', result);

            // Update with server response if different
            if (result) {
                setBanks(prev => prev.map(b => b.id === bank.id ? {
                    id: result.id,
                    name: result.name,
                    logo: result.logo,
                    coverImage: result.cover_image,
                    description: result.description,
                    followers: result.followers,
                    reviews: result.reviews,
                    phone: result.phone,
                    email: result.email,
                    nif: result.nif,
                    address: result.address,
                    province: result.province,
                    municipality: result.municipality,
                    parentId: result.parent_id,
                    type: result.type as any,
                    isBank: result.is_bank ?? false
                } : b));
            }
        } catch (error: any) {
            // Revert optimistic update on error
            setBanks(prev => prev.filter(b => b.id !== bank.id));

            console.error('[useSupabase] Error adding bank:', error);
            console.error('[useSupabase] Error message:', error.message);
            console.error('[useSupabase] Error details:', JSON.stringify(error, null, 2));
            if (error.message && error.message.includes('row-level security')) {
                console.warn("PERMISSIONS ERROR: Please run 'supabase/fix_banks_rls.sql' in your Supabase SQL Editor.");
                alert('Erro de permissões: Não foi possível salvar a agência. Verifique as políticas RLS no Supabase.');
            } else {
                alert(`Erro ao salvar agência: ${error.message || 'Erro desconhecido'}`);
            }
            throw error;
        }
    };

    const updateBank = async (bankId: string, updates: Partial<Bank>) => {
        // Store original for rollback
        const originalBank = banks.find(b => b.id === bankId);

        try {
            // Optimistic update: Update local state immediately
            setBanks(prev => prev.map(b => b.id === bankId ? { ...b, ...updates } : b));

            const dbUpdates: any = {};
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.logo) dbUpdates.logo = updates.logo;
            if (updates.coverImage) dbUpdates.cover_image = updates.coverImage;
            if (updates.description) dbUpdates.description = updates.description;
            if (updates.followers !== undefined) dbUpdates.followers = updates.followers;
            if (updates.reviews !== undefined) dbUpdates.reviews = updates.reviews;
            if (updates.phone) dbUpdates.phone = updates.phone;
            if (updates.email) dbUpdates.email = updates.email;
            if (updates.nif) dbUpdates.nif = updates.nif;
            if (updates.address) dbUpdates.address = updates.address;
            if (updates.province) dbUpdates.province = updates.province;
            if (updates.municipality) dbUpdates.municipality = updates.municipality;
            if (updates.isBank !== undefined) dbUpdates.is_bank = updates.isBank;

            await bankService.updateBank(bankId, dbUpdates);
        } catch (error: any) {
            // Revert optimistic update on error
            if (originalBank) {
                setBanks(prev => prev.map(b => b.id === bankId ? originalBank : b));
            }
            console.error('Error updating bank:', error.message || JSON.stringify(error));
            throw error;
        }
    };

    const deleteBank = async (bankId: string) => {
        // Store original for rollback
        const originalBank = banks.find(b => b.id === bankId);
        const originalIndex = banks.findIndex(b => b.id === bankId);

        try {
            // Optimistic update: Remove from local state immediately
            setBanks(prev => prev.filter(b => b.id !== bankId));

            await bankService.deleteBank(bankId);
        } catch (error: any) {
            // Revert optimistic update on error
            if (originalBank && originalIndex !== -1) {
                setBanks(prev => {
                    const newBanks = [...prev];
                    newBanks.splice(originalIndex, 0, originalBank);
                    return newBanks;
                });
            }
            console.error('Error deleting bank:', error.message || JSON.stringify(error));
            throw error;
        }
    };

    return { banks, loading, addBank, updateBank, deleteBank, refreshBanks: loadBanks };
}

export function useSupabaseNotifications(userId?: string) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadNotifications();
            const channel = supabase
                .channel('realtime-notifications')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => {
                    loadNotifications();
                })
                .subscribe();

            return () => {
                try { channel.unsubscribe(); } catch (e) { /* ignore */ }
            };
        }
    }, [userId]);

    const loadNotifications = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('timestamp', { ascending: false });

            if (error) throw error;

            const mappedNotifications: Notification[] = data.map(n => ({
                id: n.id,
                userId: n.user_id,
                title: n.title,
                desc: n.description,
                timestamp: Number(n.timestamp),
                read: n.read,
                type: n.type as any,
                relatedEntityId: n.related_entity_id
            }));
            setNotifications(mappedNotifications);
        } catch (error: any) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId);

            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return { notifications, loading, markAsRead, refreshNotifications: loadNotifications };
}
