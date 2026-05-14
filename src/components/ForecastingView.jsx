import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { FORECASTING_DEFAULTS, ANNUAL_BUDGET_TOTAL, ANNUAL_BUDGET_DATA } from '../data/annualBudget.js'

const COLORS = ['#FF604B', '#1A1A2E', '#36B37E', '#FF991F', '#4C9AFF', '#998DD9', '#57D9A3', '#79E2F2']

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

function formatNumber(val, decimals = 0) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(val)
}

function computeForecast(params) {
  const {
    revenueGoal,
    directResponsePct,
    brandMarketingPct,
    callsPerAgentPerDay,
    workingDaysPerMonth,
    decisionMakerRate,
    appointmentSetRate,
    showRate,
    presentationToSowRate,
    avgDealValue,
    numAgents,
  } = params

  const directResponseBudget = revenueGoal * directResponsePct
  const brandMarketingBudget = revenueGoal * brandMarketingPct
  const totalMarketingBudget = directResponseBudget + brandMarketingBudget

  const callsPerMonth = callsPerAgentPerDay * workingDaysPerMonth * numAgents
  const decisionMakers = callsPerMonth * decisionMakerRate
  const appointments = decisionMakers * appointmentSetRate
  const shows = appointments * showRate
  const closedDeals = shows * presentationToSowRate
  const revenueFromOutreach = closedDeals * avgDealValue

  const dealsNeeded = Math.ceil(revenueGoal / avgDealValue)
  const closingRateRequired = presentationToSowRate
  const showsNeeded = Math.ceil(dealsNeeded / closingRateRequired)
  const appointmentsNeeded = Math.ceil(showsNeeded / showRate)
  const decisionMakersNeeded = Math.ceil(appointmentsNeeded / appointmentSetRate)
  const callsNeeded = Math.ceil(decisionMakersNeeded / decisionMakerRate)

  return {
    directResponseBudget,
    brandMarketingBudget,
    totalMarketingBudget,
    callsPerMonth,
    decisionMakers,
    appointments,
    shows,
    closedDeals,
    revenueFromOutreach,
    dealsNeeded,
    showsNeeded,
    appointmentsNeeded,
    decisionMakersNeeded,
    callsNeeded,
  }
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function buildMonthlyChartData() {
  return MONTHS_SHORT.map((month, i) => {
    const obj = { month }
    for (const cat of ANNUAL_BUDGET_DATA) {
      const monthTotal = cat.lineItems.reduce((sum, item) => sum + (item.months[i + 1] || 0), 0)
      obj[cat.category] = monthTotal
    }
    obj.total = ANNUAL_BUDGET_DATA.reduce((sum, cat) => {
      return sum + cat.lineItems.reduce((s, item) => s + (item.months[i + 1] || 0), 0)
    }, 0)
    return obj
  })
}

function buildCategoryPieData() {
  return ANNUAL_BUDGET_DATA.map((cat, i) => ({
    name: cat.category.replace(' / ', '/').replace(' & ', '/'),
    shortName: cat.category.split(' ')[0],
    value: cat.annualSubtotal,
    fill: COLORS[i % COLORS.length],
  }))
}

export default function ForecastingView() {
  const [params, setParams] = useState({
    ...FORECASTING_DEFAULTS,
    numAgents: 2,
  })

  function setParam(key, value) {
    setParams(prev => ({ ...prev, [key]: parseFloat(value) || 0 }))
  }

  const result = computeForecast(params)
  const monthlyData = buildMonthlyChartData()
  const pieData = buildCategoryPieData()

  const funnelData = [
    { step: 'Calls/mo', value: Math.round(result.callsPerMonth) },
    { step: 'Decision Makers', value: Math.round(result.decisionMakers) },
    { step: 'Appointments', value: Math.round(result.appointments) },
    { step: 'Shows', value: Math.round(result.shows) },
    { step: 'Closed Deals', value: Math.round(result.closedDeals) },
  ]

  const roiPct = result.totalMarketingBudget > 0
    ? ((result.revenueFromOutreach / result.totalMarketingBudget) * 100).toFixed(0)
    : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-snap-primary font-serif">Revenue Forecasting</h1>
          <p className="text-sm text-snap-muted mt-1">Marketing ROI & Sales Pipeline Model</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-snap-success/10 border border-snap-success/30 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-snap-success font-semibold">Projected Revenue</p>
            <p className="text-xl font-bold text-snap-success font-mono">{formatCurrency(result.revenueFromOutreach)}</p>
          </div>
          <div className="bg-snap-orange/10 border border-snap-orange/30 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-snap-orange font-semibold">Marketing Budget</p>
            <p className="text-xl font-bold text-snap-orange font-mono">{formatCurrency(ANNUAL_BUDGET_TOTAL)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Parameters */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-snap-border shadow-sm p-4">
            <h3 className="font-bold text-snap-primary mb-3 text-sm">Revenue Goal</h3>
            <div>
              <label className="text-xs text-snap-muted">Annual Revenue Goal ($)</label>
              <input
                type="number"
                value={params.revenueGoal}
                onChange={e => setParam('revenueGoal', e.target.value)}
                className="w-full mt-1 border border-snap-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-snap-orange/30"
              />
            </div>
            <div className="mt-2">
              <label className="text-xs text-snap-muted">Avg Deal Value ($)</label>
              <input
                type="number"
                value={params.avgDealValue}
                onChange={e => setParam('avgDealValue', e.target.value)}
                className="w-full mt-1 border border-snap-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-snap-orange/30"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-snap-border shadow-sm p-4">
            <h3 className="font-bold text-snap-primary mb-3 text-sm">Outreach Parameters</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-snap-muted">Number of Agents</label>
                <input type="number" value={params.numAgents} onChange={e => setParam('numAgents', e.target.value)}
                  className="w-full mt-1 border border-snap-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-snap-orange/30" />
              </div>
              <div>
                <label className="text-xs text-snap-muted">Calls/Agent/Day</label>
                <input type="number" value={params.callsPerAgentPerDay} onChange={e => setParam('callsPerAgentPerDay', e.target.value)}
                  className="w-full mt-1 border border-snap-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-snap-orange/30" />
              </div>
              <div>
                <label className="text-xs text-snap-muted">Working Days/Month</label>
                <input type="number" value={params.workingDaysPerMonth} onChange={e => setParam('workingDaysPerMonth', e.target.value)}
                  className="w-full mt-1 border border-snap-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-snap-orange/30" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-snap-border shadow-sm p-4">
            <h3 className="font-bold text-snap-primary mb-3 text-sm">Conversion Rates</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-snap-muted">Decision Maker Rate (1 in X calls)</label>
                <input type="number" value={Math.round(1 / params.decisionMakerRate)}
                  onChange={e => setParam('decisionMakerRate', 1 / (parseInt(e.target.value) || 60))}
                  className="w-full mt-1 border border-snap-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-snap-orange/30" />
              </div>
              <div>
                <label className="text-xs text-snap-muted">Appointment Set Rate (%)</label>
                <input type="number" value={Math.round(params.appointmentSetRate * 100)}
                  onChange={e => setParam('appointmentSetRate', parseInt(e.target.value) / 100)}
                  className="w-full mt-1 border border-snap-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-snap-orange/30" />
              </div>
              <div>
                <label className="text-xs text-snap-muted">Show Rate (%)</label>
                <input type="number" value={Math.round(params.showRate * 100)}
                  onChange={e => setParam('showRate', parseInt(e.target.value) / 100)}
                  className="w-full mt-1 border border-snap-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-snap-orange/30" />
              </div>
              <div>
                <label className="text-xs text-snap-muted">Presentation to SOW Rate (%)</label>
                <input type="number" value={Math.round(params.presentationToSowRate * 100)}
                  onChange={e => setParam('presentationToSowRate', parseInt(e.target.value) / 100)}
                  className="w-full mt-1 border border-snap-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-snap-orange/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results & Charts */}
        <div className="col-span-2 space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Deals Needed', value: formatNumber(result.dealsNeeded), sub: `@ ${formatCurrency(params.avgDealValue)}/deal` },
              { label: 'Shows Needed/mo', value: formatNumber(Math.ceil(result.showsNeeded / 12)), sub: `${formatNumber(result.showsNeeded)}/yr` },
              { label: 'Appts Needed/mo', value: formatNumber(Math.ceil(result.appointmentsNeeded / 12)), sub: `${formatNumber(result.appointmentsNeeded)}/yr` },
              { label: 'Calls Needed/mo', value: formatNumber(Math.ceil(result.callsNeeded / 12)), sub: `${formatNumber(result.callsNeeded)}/yr` },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl border border-snap-border shadow-sm p-3">
                <p className="text-xs text-snap-muted font-medium">{kpi.label}</p>
                <p className="text-2xl font-bold text-snap-primary font-mono mt-1">{kpi.value}</p>
                <p className="text-xs text-snap-muted mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Funnel Chart */}
          <div className="bg-white rounded-xl border border-snap-border shadow-sm p-4">
            <h3 className="font-bold text-snap-primary mb-3 text-sm">Monthly Sales Funnel (Projected)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#5E6C84', fontFamily: 'JetBrains Mono' }} />
                <YAxis dataKey="step" type="category" width={110} tick={{ fontSize: 11, fill: '#5E6C84' }} />
                <Tooltip
                  formatter={(val) => [formatNumber(val), 'Count']}
                  contentStyle={{ fontSize: 12, fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="value" fill="#FF604B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly budget chart */}
          <div className="bg-white rounded-xl border border-snap-border shadow-sm p-4">
            <h3 className="font-bold text-snap-primary mb-3 text-sm">Monthly Budget Spend by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5E6C84' }} />
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#5E6C84', fontFamily: 'JetBrains Mono' }} />
                <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {ANNUAL_BUDGET_DATA.slice(0, 4).map((cat, i) => (
                  <Bar key={cat.id} dataKey={cat.category} stackId="a" fill={COLORS[i]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-xl border border-snap-border shadow-sm p-4">
            <h3 className="font-bold text-snap-primary mb-3 text-sm">Budget Allocation by Category</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={200} height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1">
                {pieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: entry.fill }} />
                    <span className="text-xs text-snap-muted truncate">{entry.shortName}</span>
                    <span className="text-xs font-mono text-snap-primary ml-auto">{((entry.value / ANNUAL_BUDGET_TOTAL) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
