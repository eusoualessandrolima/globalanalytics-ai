export type AIProviderType = 'claude' | 'openai' | 'gemini'

export interface AISettings {
  provider: AIProviderType
  apiKey: string
  model: string
}

export interface MetaSettings {
  accessToken: string
  adAccountId: string
  businessId?: string
}

export interface AppSettings {
  ai: AISettings
  meta: MetaSettings
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface MetaAccount {
  id: string
  name: string
  currency: string
  campaigns_count: number
  last_synced?: string
}

export interface MetaCampaign {
  id: string
  name: string
  status: string
  objective: string
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpm: number
  cpc: number
  reach: number
  roas: number
  conversions: number
  budget: number
  budget_type: string
}

export interface MetaInsights {
  account: MetaAccount
  campaigns: MetaCampaign[]
  summary: {
    total_spend: number
    total_impressions: number
    total_clicks: number
    total_conversions: number
    avg_ctr: number
    avg_roas: number
    avg_cpm: number
    active_campaigns: number
    paused_campaigns: number
  }
  period: string
}
