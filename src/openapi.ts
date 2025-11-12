/**
 * OP_CAT Layer Open API Client
 *
 * Auto-generated from OpenAPI specification
 * Base URL: https://testnet-openapi.opcatlabs.io/api
 * Version: 1.0.0
 */

// ============= Types =============

export interface TokenBalance {
  tokenId: string;
  tokenScriptHash: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  confirmed: string;
  unconfirmed: string;
}

export interface TokenUtxo {
  txId: string;
  vout: number;
  satoshis: number;
  script: string;
  data: string;
  state: {
    address: string;
    amount: string;
  };
  blockHeight?: number;
}

export interface ErrorResponse {
  code: number;
  msg: string;
  error?: string;
}

// ============= API Client =============

export class OpcatOpenAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://testnet-openapi.opcatlabs.io/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const res = await response.json();

    // Check if response has code field (API response format)
    if (res && typeof res.code === 'number') {
      if (res.code === 0) {
        return res.data as T;
      } else {
        throw new Error(res.msg || 'API request failed');
      }
    }

    // For responses without code field (like health check)
    return res as T;
  }

  // ============= Tokens =============

  /**
   * Get token details by ID or token script hash
   */
  async getTokenById(tokenIdOrTokenScriptHash: string) {
    return this.request<{
      info: string;
      tokenId: string;
      genesisTxid: string;
      symbol: string;
      name: string;
      decimals: number;
      minterScriptHash: string;
      tokenScriptHash: string;
    }>(
      `/v1/tokens/${tokenIdOrTokenScriptHash}`
    );
  }

  /**
   * Get token UTXOs by owner address
   */
  async getTokenUtxosByOwner(
    tokenIdOrTokenScriptHash: string,
    addressOrScriptHash: string,
    offset?: number,
    limit?: number
  ) {
    const params = new URLSearchParams();
    if (offset !== undefined) params.set('offset', offset.toString());
    if (limit !== undefined) params.set('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';

    return this.request<{
      utxos: TokenUtxo[];
      total: number;
    }>(
      `/v1/tokens/${tokenIdOrTokenScriptHash}/addresses/${addressOrScriptHash}/utxos${query}`
    );
  }

  /**
   * Get token balance by address
   */
  async getTokenBalanceByAddress(
    tokenIdOrTokenScriptHash: string,
    addressOrScriptHash: string
  ) {
    return this.request<TokenBalance>(
      `/v1/tokens/${tokenIdOrTokenScriptHash}/addresses/${addressOrScriptHash}/balance`
    );
  }
}

// ============= Export Default Instance =============

/**
 * Default client instance for testnet
 */
export const opcatOpenAPI = new OpcatOpenAPIClient();
