'use client';

import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeConfig {
  publishableKey: string;
}

class StripeConfigManager {
  private static instance: StripeConfigManager;
  private config: StripeConfig | null = null;
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

  private constructor() {}

  static getInstance(): StripeConfigManager {
    if (!StripeConfigManager.instance) {
      StripeConfigManager.instance = new StripeConfigManager();
    }
    return StripeConfigManager.instance;
  }

  async getConfig(): Promise<StripeConfig> {
    
    if (this.config && this.lastFetch && 
        (Date.now() - this.lastFetch.getTime()) < this.CACHE_DURATION) {
      return this.config;
    }

    try {
      const response = await fetch('http://localhost:5224/api/stripe-key-status');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.keyStatus) {
          this.config = {
            publishableKey: data.keyStatus.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
          };
        }
      }
    } catch (error) {
      console.error('Error fetching Stripe config:', error);
    }

    if (!this.config) {
      this.config = {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
      };
    }

    this.lastFetch = new Date();
    return this.config;
  }

  async refreshConfig(): Promise<void> {
    this.lastFetch = null;
    await this.getConfig();
  }

  getCurrentConfig(): StripeConfig | null {
    return this.config;
  }
}

export const stripeConfigManager = StripeConfigManager.getInstance();

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#4CAF50',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px'
      }
    }
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}

export default StripeProvider;