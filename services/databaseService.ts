
import { supabase } from './supabaseClient.ts';
import type { User, Bank, ATM, Product, Transaction, Message, Notification, Plan } from '../types';

// =============================================
// USER OPERATIONS
// =============================================

export const userService = {
  // Get user by email
  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  },

  // Create or Update user (Upsert)
  async createUser(user: Partial<User>) {
    // Build user object with only defined fields to avoid overwriting with null/undefined
    const userData: any = {
      id: user.id,
      email: user.email,
    };

    if (user.name !== undefined) userData.name = user.name;
    if (user.phone !== undefined) userData.phone = user.phone;
    if (user.isBusiness !== undefined) userData.is_business = user.isBusiness;
    if (user.isAdmin !== undefined) userData.is_admin = user.isAdmin;
    if (user.isBank !== undefined) userData.is_bank = user.isBank;
    if (user.nif !== undefined) userData.nif = user.nif;
    if (user.plan !== undefined) userData.plan = user.plan;
    if (user.profileImage !== undefined) userData.profile_image = user.profileImage;
    if (user.coverImage !== undefined) userData.cover_image = user.coverImage;
    if (user.address !== undefined) userData.address = user.address;
    if (user.province !== undefined) userData.province = user.province;
    if (user.municipality !== undefined) userData.municipality = user.municipality;
    if (user.walletBalance !== undefined) userData.wallet_balance = user.walletBalance;
    if (user.topUpBalance !== undefined) userData.topup_balance = user.topUpBalance;
    if (user.accountStatus !== undefined) userData.account_status = user.accountStatus;
    if (user.settings?.notifications !== undefined) userData.notifications_enabled = user.settings.notifications;
    if (user.settings?.allowMessages !== undefined) userData.allow_messages = user.settings.allowMessages;

    const { data, error } = await supabase
      .from('users')
      .upsert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update user
  async updateUser(userId: string, updates: Partial<User>) {
    // Build update object with only defined fields to avoid setting undefined values
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.nif !== undefined) updateData.nif = updates.nif;
    if (updates.isBusiness !== undefined) updateData.is_business = updates.isBusiness;
    if (updates.isBank !== undefined) updateData.is_bank = updates.isBank;
    if (updates.profileImage !== undefined) updateData.profile_image = updates.profileImage;
    if (updates.coverImage !== undefined) updateData.cover_image = updates.coverImage;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.province !== undefined) updateData.province = updates.province;
    if (updates.municipality !== undefined) updateData.municipality = updates.municipality;
    if (updates.walletBalance !== undefined) updateData.wallet_balance = updates.walletBalance;
    if (updates.topUpBalance !== undefined) updateData.topup_balance = updates.topUpBalance;
    if (updates.plan !== undefined) updateData.plan = updates.plan;
    if (updates.accountStatus !== undefined) updateData.account_status = updates.accountStatus;
    if (updates.isVerified !== undefined) updateData.is_verified = updates.isVerified;
    if (updates.favorites !== undefined) updateData.favorites = updates.favorites;
    if (updates.following !== undefined) updateData.following = updates.following;
    if (updates.settings?.notifications !== undefined) updateData.notifications_enabled = updates.settings.notifications;
    if (updates.settings?.allowMessages !== undefined) updateData.allow_messages = updates.settings.allowMessages;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  },

  // Get all users (admin only)
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// =============================================
// BANK OPERATIONS
// =============================================

export const bankService = {
  // Get all banks
  async getAllBanks() {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .order('followers', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get bank by ID
  async getBankById(bankId: string) {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .eq('id', bankId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create or Update bank/company (Upsert)
  async createBank(bank: Partial<Bank>) {
    // Build bank object with only defined fields
    const bankData: any = { id: bank.id };

    if (bank.name !== undefined) bankData.name = bank.name;
    if (bank.logo !== undefined) bankData.logo = bank.logo;
    if (bank.coverImage !== undefined) bankData.cover_image = bank.coverImage;
    if (bank.description !== undefined) bankData.description = bank.description;
    if (bank.followers !== undefined) bankData.followers = bank.followers;
    if (bank.reviews !== undefined) bankData.reviews = bank.reviews;
    if (bank.phone !== undefined) bankData.phone = bank.phone;
    if (bank.email !== undefined) bankData.email = bank.email;
    if (bank.nif !== undefined) bankData.nif = bank.nif;
    if (bank.address !== undefined) bankData.address = bank.address;
    if (bank.province !== undefined) bankData.province = bank.province;
    if (bank.municipality !== undefined) bankData.municipality = bank.municipality;
    if (bank.parentId !== undefined) bankData.parent_id = bank.parentId;
    if (bank.type !== undefined) bankData.type = bank.type;
    if (bank.isBank !== undefined) bankData.is_bank = bank.isBank;

    const { data, error } = await supabase
      .from('banks')
      .upsert([bankData]) // Using upsert prevents unique constraint errors
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update bank
  async updateBank(bankId: string, updates: Partial<Bank>) {
    const { data, error } = await supabase
      .from('banks')
      .update(updates)
      .eq('id', bankId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
  ,
  // Delete bank
  async deleteBank(bankId: string) {
    const { error } = await supabase
      .from('banks')
      .delete()
      .eq('id', bankId);

    if (error) throw error;
  }
};

// =============================================
// PRODUCT OPERATIONS
// =============================================

export const productService = {
  // Get all products
  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_gallery(image_url)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get products by owner
  async getProductsByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_gallery(image_url)')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create product (Upsert to allow overwrites/fixes)
  async createProduct(product: Partial<Product>) {
    // 1. Create the product first
    const { data, error } = await supabase
      .from('products')
      .upsert([{
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        company_name: product.companyName,
        category: product.category,
        is_promoted: product.isPromoted || false,
        bank_id: product.bankId,
        owner_id: product.ownerId,
        description: product.description
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw new Error(`Falha ao criar produto: ${error.message || 'Erro desconhecido'}`);
    }

    // 2. Handle Gallery Images (optimized - single batch insert)
    if (product.gallery && product.gallery.length > 0) {
      const galleryInserts = product.gallery.map((url, index) => ({
        product_id: data.id,
        image_url: url,
        display_order: index
      }));

      const { error: galleryError } = await supabase
        .from('product_gallery')
        .insert(galleryInserts);

      if (galleryError) {
        console.error('Error saving gallery:', galleryError);
        // Don't throw - gallery is optional, product is already created
      }
    }

    return data;
  },

  // Update product
  async updateProduct(productId: string, updates: Partial<Product>) {
    // 1. Update the main product fields
    const { data, error } = await supabase
      .from('products')
      .update({
        title: updates.title,
        price: updates.price,
        image: updates.image,
        description: updates.description,
        is_promoted: updates.isPromoted
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw new Error(`Falha ao atualizar produto: ${error.message || 'Erro desconhecido'}`);
    }

    // 2. Handle Gallery Updates (optimized - batch delete + batch insert)
    if (updates.gallery !== undefined) {
      // Delete existing gallery images
      const { error: deleteError } = await supabase
        .from('product_gallery')
        .delete()
        .eq('product_id', productId);

      if (deleteError) {
        console.error('Error deleting old gallery:', deleteError);
      }

      // Insert new ones if any
      if (updates.gallery.length > 0) {
        const galleryInserts = updates.gallery.map((url, index) => ({
          product_id: productId,
          image_url: url,
          display_order: index
        }));

        const { error: galleryError } = await supabase
          .from('product_gallery')
          .insert(galleryInserts);

        if (galleryError) {
          console.error('Error updating gallery:', galleryError);
          // Don't throw - gallery is optional
        }
      }
    }

    return data;
  },

  // Delete product
  async deleteProduct(productId: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
  }
};

// =============================================
// ATM OPERATIONS
// =============================================

export const atmService = {
  // Get all ATMs
  async getAllATMs() {
    const { data, error } = await supabase
      .from('atms')
      .select('*')
      .order('votes', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update ATM status
  async updateATMStatus(atmId: string, status: string) {
    const { data, error } = await supabase
      .from('atms')
      .update({ status, last_updated: new Date().toISOString() })
      .eq('id', atmId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create ATM
  async createATM(atm: Partial<ATM>) {
    const { data, error } = await supabase
      .from('atms')
      .upsert([{ // Changed to upsert to be safe
        id: atm.id,
        name: atm.name,
        bank: atm.bank,
        address: atm.address,
        status: atm.status || 'Online',
        lat: atm.lat,
        lng: atm.lng,
        votes: 0,
        last_updated: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('DEBUG: Erro ao criar ATM no Supabase:', error);
      throw error;
    }
    return data;
  },

  // Delete ATM
  async deleteATM(atmId: string) {
    const { error } = await supabase
      .from('atms')
      .delete()
      .eq('id', atmId);

    if (error) throw error;
  },

  // Vote on ATM
  async voteATM(userId: string, atmId: string) {
    // Check if already voted
    const { data: existingVote } = await supabase
      .from('atm_votes')
      .select('*')
      .eq('user_id', userId)
      .eq('atm_id', atmId)
      .single();

    if (existingVote) {
      // Remove vote
      await supabase
        .from('atm_votes')
        .delete()
        .eq('user_id', userId)
        .eq('atm_id', atmId);

      // Decrement votes
      const { data: atm } = await supabase
        .from('atms')
        .select('votes')
        .eq('id', atmId)
        .single();

      await supabase
        .from('atms')
        .update({ votes: Math.max(0, (atm?.votes || 0) - 1) })
        .eq('id', atmId);
    } else {
      // Add vote
      await supabase
        .from('atm_votes')
        .insert([{ user_id: userId, atm_id: atmId }]);

      // Increment votes
      const { data: atm } = await supabase
        .from('atms')
        .select('votes')
        .eq('id', atmId)
        .single();

      await supabase
        .from('atms')
        .update({ votes: (atm?.votes || 0) + 1 })
        .eq('id', atmId);
    }
  }
};

// =============================================
// TRANSACTION OPERATIONS
// =============================================

export const transactionService = {
  // Get user transactions
  async getUserTransactions(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create transaction
  async createTransaction(transaction: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .upsert([{ // Changed to upsert
        user_id: transaction.user,
        plan: transaction.plan,
        product_name: transaction.productName,
        amount: transaction.amount,
        date: transaction.date,
        timestamp: transaction.timestamp,
        status: transaction.status,
        method: transaction.method,
        category: transaction.category,
        reference: transaction.reference,
        other_party_name: transaction.otherPartyName,
        proof_url: transaction.proofUrl
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update transaction status
  async updateTransactionStatus(transactionId: string, status: string) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// =============================================
// MESSAGE OPERATIONS
// =============================================

export const messageService = {
  // Get user messages
  async getUserMessages(userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Send message
  async sendMessage(message: Partial<Message>) {
    const { data, error } = await supabase
      .from('messages')
      .upsert([{ // Changed to upsert
        sender_id: message.senderId,
        sender_name: message.senderName,
        receiver_id: message.receiverId,
        product_id: message.productId,
        product_name: message.productName,
        content: message.content,
        timestamp: message.timestamp,
        is_read: false,
        is_from_business: message.isFromBusiness || false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark message as read
  async markAsRead(messageId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;
  }
};

// =============================================
// FAVORITES OPERATIONS
// =============================================

export const favoriteService = {
  // Get user favorites
  async getUserFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  // Toggle favorite
  async toggleFavorite(userId: string, productId: string) {
    const { data: existing } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
    } else {
      await supabase
        .from('favorites')
        .insert([{ user_id: userId, product_id: productId }]);
    }
  }
};

// =============================================
// REALTIME SUBSCRIPTIONS
// =============================================

export const realtimeService = {
  // Subscribe to new messages
  subscribeToMessages(userId: string, callback: (message: any) => void) {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to transaction updates
  subscribeToTransactions(userId: string, callback: (transaction: any) => void) {
    return supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
};
