import fetch from 'node-fetch';

export interface ParadoxResolverClient {
  resolve(input: any): Promise<any>;
  metaResolve(input: any): Promise<any>;
  evolve(input: any): Promise<any>;
  optimize(input: any): Promise<any>;
  healthCheck(): Promise<void>;
}

export function createParadoxResolverClient(opts?: { serviceUrl?: string; timeout?: number }): ParadoxResolverClient {
  const serviceUrl = opts?.serviceUrl || process.env.PARADOX_RESOLVER_URL || '';
  const timeout = opts?.timeout ?? 30000;

  // Disabled client: throws to trigger existing fallbacks
  if (!serviceUrl) {
    const disabled = async () => {
      throw new Error('ParadoxResolver disabled: PARADOX_RESOLVER_URL not set');
    };
    return {
      resolve: disabled,
      metaResolve: disabled,
      evolve: disabled,
      optimize: disabled,
      healthCheck: disabled,
    };
  }

  async function post(path: string, body?: any): Promise<any> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(`${serviceUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      } as any);
      if (!res.ok) {
        throw new Error(`ParadoxResolver ${path} ${res.status}`);
      }
      return await res.json();
    } finally {
      clearTimeout(id);
    }
  }

  async function get(path: string): Promise<any> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(`${serviceUrl}${path}`, { signal: controller.signal } as any);
      if (!res.ok) {
        throw new Error(`ParadoxResolver ${path} ${res.status}`);
      }
      return await res.json();
    } finally {
      clearTimeout(id);
    }
  }

  return {
    async resolve(input: any) {
      return post('/api/resolve', input);
    },
    async metaResolve(input: any) {
      return post('/api/meta-resolve', input);
    },
    async evolve(input: any) {
      return post('/api/evolve', input);
    },
    async optimize(input: any) {
      return post('/api/optimize', input);
    },
    async healthCheck() {
      await get('/health');
    },
  };
}
