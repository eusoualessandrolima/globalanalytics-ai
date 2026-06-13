import type { MetaAccount, MetaCampaign, MetaInsights } from '@/types/ai'

const GRAPH_API = 'https://graph.facebook.com/v19.0'

export class MetaAdsClient {
  private accessToken: string
  private adAccountId: string

  constructor(accessToken: string, adAccountId: string) {
    this.accessToken = accessToken
    // Garantir formato act_XXXXXXX
    this.adAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`
  }

  private async fetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${GRAPH_API}/${path}`)
    url.searchParams.set('access_token', this.accessToken)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

    const res = await fetch(url.toString(), { next: { revalidate: 0 } })
    const data = await res.json()

    if (data.error) throw new Error(data.error.message ?? 'Meta API error')
    return data as T
  }

  async getAccount(): Promise<MetaAccount> {
    const fields = 'name,currency,account_status'
    const data = await this.fetch<{ id: string; name: string; currency: string }>(`${this.adAccountId}`, { fields })

    const campaigns = await this.getCampaigns()
    return {
      id: data.id,
      name: data.name,
      currency: data.currency,
      campaigns_count: campaigns.length,
      last_synced: new Date().toISOString(),
    }
  }

  async getCampaigns(datePreset = 'last_7d'): Promise<MetaCampaign[]> {
    const fields = 'name,status,objective,daily_budget,lifetime_budget'
    const insightFields = 'spend,impressions,clicks,ctr,cpm,cpc,reach,actions,action_values'

    const [campaignsData, insightsData] = await Promise.all([
      this.fetch<{ data: Array<{ id: string; name: string; status: string; objective: string; daily_budget?: string; lifetime_budget?: string }> }>(
        `${this.adAccountId}/campaigns`,
        { fields, limit: '50' }
      ),
      this.fetch<{ data: Array<{ campaign_id: string; spend: string; impressions: string; clicks: string; ctr: string; cpm: string; cpc: string; reach: string; actions?: Array<{ action_type: string; value: string }>; action_values?: Array<{ action_type: string; value: string }> }> }>(
        `${this.adAccountId}/insights`,
        {
          level: 'campaign',
          fields: insightFields,
          date_preset: datePreset,
          limit: '50',
        }
      ).catch(() => ({ data: [] })),
    ])

    const insightsMap = new Map(insightsData.data.map(i => [i.campaign_id, i]))

    return campaignsData.data.map(c => {
      const ins = insightsMap.get(c.id)
      const purchases = ins?.actions?.find(a => a.action_type === 'purchase')
      const revenue = ins?.action_values?.find(a => a.action_type === 'purchase')
      const spend = parseFloat(ins?.spend ?? '0')
      const roas = spend > 0 && revenue ? parseFloat(revenue.value) / spend : 0

      return {
        id: c.id,
        name: c.name,
        status: c.status,
        objective: c.objective ?? '',
        spend,
        impressions: parseInt(ins?.impressions ?? '0'),
        clicks: parseInt(ins?.clicks ?? '0'),
        ctr: parseFloat(ins?.ctr ?? '0'),
        cpm: parseFloat(ins?.cpm ?? '0'),
        cpc: parseFloat(ins?.cpc ?? '0'),
        reach: parseInt(ins?.reach ?? '0'),
        roas,
        conversions: parseInt(purchases?.value ?? '0'),
        budget: parseFloat(c.daily_budget ?? c.lifetime_budget ?? '0') / 100,
        budget_type: c.daily_budget ? 'daily' : 'lifetime',
      }
    })
  }

  async getInsights(datePreset = 'last_7d'): Promise<MetaInsights> {
    const [account, campaigns] = await Promise.all([
      this.getAccount(),
      this.getCampaigns(datePreset),
    ])

    const active = campaigns.filter(c => c.status === 'ACTIVE')
    const paused = campaigns.filter(c => c.status === 'PAUSED')
    const total_spend = campaigns.reduce((s, c) => s + c.spend, 0)
    const total_impressions = campaigns.reduce((s, c) => s + c.impressions, 0)
    const total_clicks = campaigns.reduce((s, c) => s + c.clicks, 0)
    const total_conversions = campaigns.reduce((s, c) => s + c.conversions, 0)
    const avg_ctr = campaigns.length > 0 ? campaigns.reduce((s, c) => s + c.ctr, 0) / campaigns.length : 0
    const campaignsWithRoas = campaigns.filter(c => c.roas > 0)
    const avg_roas = campaignsWithRoas.length > 0 ? campaignsWithRoas.reduce((s, c) => s + c.roas, 0) / campaignsWithRoas.length : 0
    const avg_cpm = campaigns.length > 0 ? campaigns.reduce((s, c) => s + c.cpm, 0) / campaigns.length : 0

    const periodLabels: Record<string, string> = {
      today: 'Hoje',
      yesterday: 'Ontem',
      last_7d: 'Últimos 7 dias',
      last_14d: 'Últimos 14 dias',
      last_30d: 'Últimos 30 dias',
      this_month: 'Este mês',
      last_month: 'Mês passado',
    }

    return {
      account: { ...account, campaigns_count: campaigns.length },
      campaigns,
      summary: { total_spend, total_impressions, total_clicks, total_conversions, avg_ctr, avg_roas, avg_cpm, active_campaigns: active.length, paused_campaigns: paused.length },
      period: periodLabels[datePreset] ?? datePreset,
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.fetch(`${this.adAccountId}`, { fields: 'name' })
      return true
    } catch {
      return false
    }
  }
}
