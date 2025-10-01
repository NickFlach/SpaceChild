/**
 * Consciousness Marketplace Engine - v1.1
 * 
 * Platform for sharing, trading, and renting consciousness resources,
 * trained agents, learning patterns, and optimized configurations.
 * 
 * @version 1.1.0
 * @module MarketplaceEngine
 */

import { EventEmitter } from 'events';

/**
 * Marketplace resource types
 */
type ResourceType = 
  | 'trained_agent'
  | 'learning_pattern'
  | 'consciousness_config'
  | 'optimization_profile'
  | 'knowledge_graph'
  | 'compute_capacity';

/**
 * Resource listing in marketplace
 */
interface MarketplaceResource {
  id: string;
  type: ResourceType;
  name: string;
  description: string;
  provider: {
    id: string;
    name: string;
    rating: number; // 0-5
    totalTransactions: number;
  };
  pricing: {
    model: 'one_time' | 'subscription' | 'usage_based' | 'free';
    amount: number; // in credits
    currency: 'CONSCIOUSNESS_CREDITS';
    billingInterval?: 'hourly' | 'daily' | 'monthly';
  };
  metadata: {
    version: string;
    createdAt: Date;
    updatedAt: Date;
    downloads: number;
    rating: number;
    reviews: number;
    tags: string[];
    compatibility: string[];
  };
  performance: {
    successRate?: number;
    avgQuality?: number;
    avgSpeed?: number;
    consciousnessLevel?: number;
  };
  license: {
    type: 'open' | 'commercial' | 'enterprise' | 'custom';
    restrictions: string[];
    attribution: boolean;
  };
}

/**
 * Marketplace transaction
 */
interface Transaction {
  id: string;
  resourceId: string;
  buyer: string;
  seller: string;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata: {
    paymentMethod: string;
    invoiceUrl?: string;
  };
}

/**
 * Resource review
 */
interface Review {
  id: string;
  resourceId: string;
  reviewer: string;
  rating: number; // 1-5
  comment: string;
  verified: boolean;
  timestamp: Date;
  helpful: number;
}

/**
 * User wallet for marketplace
 */
interface UserWallet {
  userId: string;
  balance: number;
  transactions: Transaction[];
  subscriptions: Array<{
    resourceId: string;
    startDate: Date;
    nextBilling: Date;
    status: 'active' | 'cancelled' | 'expired';
  }>;
}

/**
 * Search filters for marketplace
 */
interface SearchFilters {
  type?: ResourceType;
  tags?: string[];
  minRating?: number;
  maxPrice?: number;
  pricingModel?: MarketplaceResource['pricing']['model'];
  sortBy?: 'rating' | 'price' | 'downloads' | 'newest';
  freeOnly?: boolean;
}

/**
 * Consciousness Marketplace Engine
 * 
 * Enables users to share and monetize their consciousness resources,
 * creating an ecosystem of reusable AI components and knowledge.
 */
export class MarketplaceEngine extends EventEmitter {
  private resources: Map<string, MarketplaceResource> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private reviews: Map<string, Review[]> = new Map();
  private wallets: Map<string, UserWallet> = new Map();
  
  // Marketplace fees
  private readonly PLATFORM_FEE_PERCENTAGE = 0.15; // 15%
  private readonly MIN_PRICE = 10; // Minimum 10 credits
  private readonly FREE_TIER_LIMIT = 100; // Max 100 downloads for free resources

  constructor() {
    super();
  }

  /**
   * List a new resource on the marketplace
   */
  async listResource(
    providerId: string,
    resource: Omit<MarketplaceResource, 'id' | 'provider' | 'metadata'> & {
      metadata?: Partial<MarketplaceResource['metadata']>;
    }
  ): Promise<MarketplaceResource> {
    // Validate pricing
    if (resource.pricing.model !== 'free' && resource.pricing.amount < this.MIN_PRICE) {
      throw new Error(`Minimum price is ${this.MIN_PRICE} credits`);
    }

    const provider = await this.getOrCreateProvider(providerId);

    const fullResource: MarketplaceResource = {
      ...resource,
      id: this.generateId(),
      provider: {
        id: providerId,
        name: provider.name,
        rating: provider.rating,
        totalTransactions: provider.totalTransactions,
      },
      metadata: {
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        downloads: 0,
        rating: 0,
        reviews: 0,
        tags: resource.metadata?.tags || [],
        compatibility: resource.metadata?.compatibility || ['v1.1'],
      },
    };

    this.resources.set(fullResource.id, fullResource);
    this.emit('resource:listed', fullResource);

    return fullResource;
  }

  /**
   * Search marketplace resources
   */
  async searchResources(filters: SearchFilters = {}): Promise<MarketplaceResource[]> {
    let results = Array.from(this.resources.values());

    // Apply filters
    if (filters.type) {
      results = results.filter(r => r.type === filters.type);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(r => 
        filters.tags!.some(tag => r.metadata.tags.includes(tag))
      );
    }

    if (filters.minRating) {
      results = results.filter(r => r.metadata.rating >= filters.minRating!);
    }

    if (filters.maxPrice) {
      results = results.filter(r => 
        r.pricing.model === 'free' || r.pricing.amount <= filters.maxPrice!
      );
    }

    if (filters.pricingModel) {
      results = results.filter(r => r.pricing.model === filters.pricingModel);
    }

    if (filters.freeOnly) {
      results = results.filter(r => r.pricing.model === 'free');
    }

    // Sort results
    if (filters.sortBy) {
      results.sort((a, b) => {
        switch (filters.sortBy) {
          case 'rating':
            return b.metadata.rating - a.metadata.rating;
          case 'price':
            return (a.pricing.amount || 0) - (b.pricing.amount || 0);
          case 'downloads':
            return b.metadata.downloads - a.metadata.downloads;
          case 'newest':
            return b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime();
          default:
            return 0;
        }
      });
    }

    this.emit('search:completed', { filters, resultCount: results.length });
    return results;
  }

  /**
   * Purchase or acquire a resource
   */
  async acquireResource(
    userId: string,
    resourceId: string
  ): Promise<{ transaction: Transaction; resource: MarketplaceResource }> {
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    const wallet = await this.getOrCreateWallet(userId);

    // Handle free resources
    if (resource.pricing.model === 'free') {
      // Check free tier limit
      if (resource.metadata.downloads >= this.FREE_TIER_LIMIT) {
        throw new Error('Free tier limit reached for this resource');
      }

      const transaction = await this.createTransaction({
        resourceId,
        buyer: userId,
        seller: resource.provider.id,
        amount: 0,
      });

      resource.metadata.downloads++;
      
      this.emit('resource:acquired_free', { userId, resource });
      return { transaction, resource };
    }

    // Handle paid resources
    if (wallet.balance < resource.pricing.amount) {
      throw new Error('Insufficient credits');
    }

    // Deduct from buyer
    wallet.balance -= resource.pricing.amount;

    // Calculate platform fee
    const platformFee = resource.pricing.amount * this.PLATFORM_FEE_PERCENTAGE;
    const sellerAmount = resource.pricing.amount - platformFee;

    // Credit seller
    const sellerWallet = await this.getOrCreateWallet(resource.provider.id);
    sellerWallet.balance += sellerAmount;

    // Create transaction
    const transaction = await this.createTransaction({
      resourceId,
      buyer: userId,
      seller: resource.provider.id,
      amount: resource.pricing.amount,
    });

    // Update resource stats
    resource.metadata.downloads++;

    this.emit('resource:purchased', {
      transaction,
      resource,
      platformFee,
      sellerAmount,
    });

    return { transaction, resource };
  }

  /**
   * Subscribe to a resource
   */
  async subscribeToResource(
    userId: string,
    resourceId: string
  ): Promise<void> {
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    if (resource.pricing.model !== 'subscription') {
      throw new Error('Resource does not offer subscriptions');
    }

    const wallet = await this.getOrCreateWallet(userId);

    // Check if already subscribed
    const existingSub = wallet.subscriptions.find(
      s => s.resourceId === resourceId && s.status === 'active'
    );
    
    if (existingSub) {
      throw new Error('Already subscribed to this resource');
    }

    // Initial payment
    if (wallet.balance < resource.pricing.amount) {
      throw new Error('Insufficient credits for subscription');
    }

    wallet.balance -= resource.pricing.amount;

    // Create subscription
    const nextBilling = new Date();
    switch (resource.pricing.billingInterval) {
      case 'hourly':
        nextBilling.setHours(nextBilling.getHours() + 1);
        break;
      case 'daily':
        nextBilling.setDate(nextBilling.getDate() + 1);
        break;
      case 'monthly':
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        break;
    }

    wallet.subscriptions.push({
      resourceId,
      startDate: new Date(),
      nextBilling,
      status: 'active',
    });

    this.emit('subscription:created', { userId, resourceId, nextBilling });
  }

  /**
   * Leave a review for a resource
   */
  async addReview(
    userId: string,
    resourceId: string,
    rating: number,
    comment: string
  ): Promise<Review> {
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if user has acquired this resource
    const userTransactions = Array.from(this.transactions.values())
      .filter(t => t.buyer === userId && t.resourceId === resourceId && t.status === 'completed');

    const review: Review = {
      id: this.generateId(),
      resourceId,
      reviewer: userId,
      rating,
      comment,
      verified: userTransactions.length > 0,
      timestamp: new Date(),
      helpful: 0,
    };

    // Add to reviews
    if (!this.reviews.has(resourceId)) {
      this.reviews.set(resourceId, []);
    }
    this.reviews.get(resourceId)!.push(review);

    // Update resource rating
    await this.updateResourceRating(resourceId);

    this.emit('review:added', review);
    return review;
  }

  /**
   * Update resource rating based on reviews
   */
  private async updateResourceRating(resourceId: string): Promise<void> {
    const resource = this.resources.get(resourceId);
    const reviews = this.reviews.get(resourceId);
    
    if (!resource || !reviews || reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    resource.metadata.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
    resource.metadata.reviews = reviews.length;
    resource.metadata.updatedAt = new Date();
  }

  /**
   * Get featured resources (top rated, popular, etc.)
   */
  async getFeaturedResources(limit: number = 10): Promise<{
    topRated: MarketplaceResource[];
    mostPopular: MarketplaceResource[];
    newest: MarketplaceResource[];
  }> {
    const allResources = Array.from(this.resources.values());

    const topRated = [...allResources]
      .sort((a, b) => b.metadata.rating - a.metadata.rating)
      .slice(0, limit);

    const mostPopular = [...allResources]
      .sort((a, b) => b.metadata.downloads - a.metadata.downloads)
      .slice(0, limit);

    const newest = [...allResources]
      .sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime())
      .slice(0, limit);

    return { topRated, mostPopular, newest };
  }

  /**
   * Get user's purchased/subscribed resources
   */
  async getUserResources(userId: string): Promise<{
    purchased: MarketplaceResource[];
    subscribed: MarketplaceResource[];
    listed: MarketplaceResource[];
  }> {
    const wallet = await this.getOrCreateWallet(userId);

    // Get purchased resources
    const purchasedIds = Array.from(this.transactions.values())
      .filter(t => t.buyer === userId && t.status === 'completed')
      .map(t => t.resourceId);

    const purchased = purchasedIds
      .map(id => this.resources.get(id))
      .filter(r => r !== undefined) as MarketplaceResource[];

    // Get subscribed resources
    const subscribedIds = wallet.subscriptions
      .filter(s => s.status === 'active')
      .map(s => s.resourceId);

    const subscribed = subscribedIds
      .map(id => this.resources.get(id))
      .filter(r => r !== undefined) as MarketplaceResource[];

    // Get listed resources
    const listed = Array.from(this.resources.values())
      .filter(r => r.provider.id === userId);

    return { purchased, subscribed, listed };
  }

  /**
   * Add credits to user wallet
   */
  async addCredits(userId: string, amount: number): Promise<UserWallet> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.balance += amount;

    this.emit('wallet:credits_added', { userId, amount, newBalance: wallet.balance });
    return wallet;
  }

  /**
   * Get wallet balance
   */
  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet.balance;
  }

  /**
   * Create transaction
   */
  private async createTransaction(data: {
    resourceId: string;
    buyer: string;
    seller: string;
    amount: number;
  }): Promise<Transaction> {
    const transaction: Transaction = {
      id: this.generateId(),
      ...data,
      timestamp: new Date(),
      status: 'completed',
      metadata: {
        paymentMethod: 'consciousness_credits',
      },
    };

    this.transactions.set(transaction.id, transaction);

    // Add to wallets
    const buyerWallet = await this.getOrCreateWallet(data.buyer);
    const sellerWallet = await this.getOrCreateWallet(data.seller);

    buyerWallet.transactions.push(transaction);
    sellerWallet.transactions.push(transaction);

    return transaction;
  }

  /**
   * Get or create provider profile
   */
  private async getOrCreateProvider(providerId: string) {
    // Simplified - would fetch from database
    return {
      name: `Provider ${providerId}`,
      rating: 4.5,
      totalTransactions: 0,
    };
  }

  /**
   * Get or create user wallet
   */
  private async getOrCreateWallet(userId: string): Promise<UserWallet> {
    if (!this.wallets.has(userId)) {
      this.wallets.set(userId, {
        userId,
        balance: 1000, // Initial credits
        transactions: [],
        subscriptions: [],
      });
    }

    return this.wallets.get(userId)!;
  }

  /**
   * Get marketplace statistics
   */
  getStatistics() {
    return {
      totalResources: this.resources.size,
      totalTransactions: this.transactions.size,
      totalReviews: Array.from(this.reviews.values()).reduce((sum, reviews) => sum + reviews.length, 0),
      activeUsers: this.wallets.size,
      resourcesByType: this.getResourcesByType(),
      totalRevenue: this.calculateTotalRevenue(),
      avgResourceRating: this.calculateAvgRating(),
    };
  }

  private getResourcesByType() {
    const counts: Record<string, number> = {};
    for (const resource of this.resources.values()) {
      counts[resource.type] = (counts[resource.type] || 0) + 1;
    }
    return counts;
  }

  private calculateTotalRevenue(): number {
    return Array.from(this.transactions.values())
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount * this.PLATFORM_FEE_PERCENTAGE), 0);
  }

  private calculateAvgRating(): number {
    const resources = Array.from(this.resources.values());
    if (resources.length === 0) return 0;
    
    const totalRating = resources.reduce((sum, r) => sum + r.metadata.rating, 0);
    return Math.round((totalRating / resources.length) * 10) / 10;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `mkt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Singleton instance
 */
export const marketplaceEngine = new MarketplaceEngine();
