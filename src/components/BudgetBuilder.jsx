import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ANNUAL_BUDGET_DATA, ANNUAL_BUDGET_TOTAL, FORECASTING_DEFAULTS } from '../data/annualBudget'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function fmt(n) {
  if (!n && n !== 0) return ''
  if (n === 0) return ''
  return `$${Number(n).toLocaleString()}`
}

function fmtK(n) {
  if (!n && n !== 0) return '$0'
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${Math.round(n).toLocaleString()}`
}

export default function BudgetBuilder() {
  const [expanded, setExpanded] = useState({})
  const [forecasting, setForecasting] = useState(FORECASTING_DEFAULTS)

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }))

  const totalAnnualFromData = ANNUAL_BUDGET_DATA.reduce((s, cat) => s + cat.annualSubtotal, 0)

  const columnTotals = useMemo(() => {
    const totals = {}
    for (let m = 1; m <= 12; m++) {
      totals[m] = ANNUAL_BUDGET_DATA.reduce((s, cat) =>
        s + cat.lineItems.reduce((ls, item) => ls + (item.months[m] || 0), 0)
      , 0)
    }
    return totals
  }, [])

  const forecastCalcs = useMemo(() => {
    const { revenueGoal, callsPerAgentPerDay, workingDaysPerMonth, decisionMakerRate, appointmentSetRate, showRate, presentationToSowRate, avgDealValue } = forecasting
    const callsPerMonth = callsPerAgentPerDay * workingDaysPerMonth
    const dmContactsPerAgent = callsPerMonth * decisionMakerRate
    const appointmentsPerAgent = dmContactsPerAgent * appointmentSetRate
    const showsPerAgent = appointmentsPerAgent * showRate
    const sowsPerAgent = showsPerAgent * presentationToSowRate
    const revenuePerAgent = sowsPerAgent * avgDealValue
    const agentsNeeded = revenuePerAgent > 0 ? Math.ceil(revenueGoal / revenuePerAgent / 12) : 0
    const monthlyLeadsNeeded = agentsNeeded * dmContactsPerAgent
    const monthlyApptsNeeded = agentsNeeded * appointmentsPerAgent
    const monthlyPresentationsNeeded = agentsNeeded * showsPerAgent
    const monthlySowsNeeded = agentsNeeded * sowsPerAgent
    return { callsPerMonth, dmContactsPerAgent, appointmentsPerAgent, showsPerAgent, sowsPerAgent, revenuePerAgent, agentsNeeded, monthlyLeadsNeeded, monthlyApptsNeeded, monthlyPresentationsNeeded, monthlySowsNeeded }
  }, [forecasting])

  const updateForecast = (key, value) => setForecasting(p => ({ ...p, [key]: Number(value) || 0 }))

  return (
    <div className="flex-1 overflow-auto p-4 space-y-6">

      {/* Budget Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DFE1E6] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#DFE1E6] bg-[#1A1A2E]">
          <h2 className="text-sm font-semibold text-white">2026 Annual Marketing Budget</h2>
          <p className="text-xs text-white/50 mt-0.5">Total Planned: {fmtK(ANNUAL_BUDGET_TOTAL)} | Data Total: {fmtK(totalAnnualFromData)}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#F4F5F7] border-b border-[#DFE1E6]">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-[#5E6C84] sticky left-0 bg-[#F4F5F7] min-w-[200px]">Category / Line Item</th>
                {MONTHS.map(m => <th key={m} className="text-right px-2 py-2 font-semibold text-[#5E6C84] min-w-[70px]">{m}</th>)}
                <th className="text-right px-3 py-2 font-semibold text-[#5E6C84] min-w-[80px]">Annual</th>
              </tr>
            </thead>
            <tbody>
              {ANNUAL_BUDGET_DATA.map(cat => (
                <React.Fragment key={cat.id}>
                  <tr
                    onClick={() => toggle(cat.id)}
                    className="cursor-pointer hover:bg-[#F4F5F7] bg-[#F4F5F7]/50 border-b border-[#DFE1E6]"
                  >
                    <td className="px-3 py-2 font-semibold text-[#172B4D] sticky left-0 bg-[#F4F5F7]/90 flex items-center gap-1.5">
                      {expanded[cat.id] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      {cat.category}
                    </td>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => {
                      const total = cat.lineItems.reduce((s, i) => s + (i.months[m] || 0), 0)
                      return <td key={m} className="px-2 py-2 text-right font-mono text-[#172B4D]">{fmt(total)}</td>
                    })}
                    <td className="px-3 py-2 text-right font-mono font-bold text-[#172B4D]">{fmtK(cat.annualSubtotal)}</td>
                  </tr>
                  {expanded[cat.id] && cat.lineItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-[#F4F5F7] hover:bg-blue-50/30">
                      <td className="px-3 py-1.5 text-[#5E6C84] sticky left-0 bg-white pl-8">{item.name}</td>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <td key={m} className="px-2 py-1.5 text-right font-mono text-[#5E6C84]">
                          {item.months[m] ? fmt(item.months[m]) : ''}
                        </td>
                      ))}
                      <td className="px-3 py-1.5 text-right font-mono text-[#172B4D]">{fmtK(item.annual)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot className="bg-[#1A1A2E] text-white">
              <tr>
                <td className="px-3 py-2.5 font-bold sticky left-0 bg-[#1A1A2E]">TOTALS</td>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <td key={m} className="px-2 py-2.5 text-right font-mono font-semibold">{fmt(columnTotals[m])}</td>
                ))}
                <td className="px-3 py-2.5 text-right font-mono font-bold">{fmtK(totalAnnualFromData)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Forecasting Tool */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DFE1E6] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#DFE1E6] bg-[#1A1A2E]">
          <h2 className="text-sm font-semibold text-white">Forecasting Tool</h2>
          <p className="text-xs text-white/50 mt-0.5">Adjust assumptions to project outcomes</p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wider">Revenue Goals</h3>
            <ForecastInput label="Forecasted Revenue Goal" value={forecasting.revenueGoal} onChange={v => updateForecast('revenueGoal', v)} prefix="$" />
            <div className="bg-[#F4F5F7] rounded-lg p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5E6C84]">
                <span>Direct Response Marketing (10%)</span>
                <span className="font-mono font-semibold text-[#172B4D]">{fmtK(forecasting.revenueGoal * 0.10)}</span>
              </div>
              <div className="flex justify-between text-[#5E6C84]">
                <span>Brand Marketing (1.1%)</span>
                <span className="font-mono font-semibold text-[#172B4D]">{fmtK(forecasting.revenueGoal * 0.011)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#172B4D] border-t border-[#DFE1E6] pt-1.5">
                <span>Total Marketing Budget</span>
                <span className="font-mono">{fmtK(forecasting.revenueGoal * 0.111)}</span>
              </div>
            </div>

            <h3 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wider mt-4">Sales Assumptions</h3>
            <ForecastInput label="Calls per agent per day" value={forecasting.callsPerAgentPerDay} onChange={v => updateForecast('callsPerAgentPerDay', v)} />
            <ForecastInput label="Working days per month" value={forecasting.workingDaysPerMonth} onChange={v => updateForecast('workingDaysPerMonth', v)} />
            <ForecastInput label="Appointment set rate (%)" value={Math.round(forecasting.appointmentSetRate * 100)} onChange={v => updateForecast('appointmentSetRate', v / 100)} />
            <ForecastInput label="Show rate (%)" value={Math.round(forecasting.showRate * 100)} onChange={v => updateForecast('showRate', v / 100)} />
            <ForecastInput label="Presentation to SOW rate (%)" value={Math.round(forecasting.presentationToSowRate * 100)} onChange={v => updateForecast('presentationToSowRate', v / 100)} />
            <ForecastInput label="Average deal value ($)" value={forecasting.avgDealValue} onChange={v => updateForecast('avgDealValue', v)} prefix="$" />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wider">Projected Outputs</h3>
            <div className="bg-[#F4F5F7] rounded-xl p-4 space-y-3">
              <OutputRow label="Calls per agent per month" value={forecastCalcs.callsPerMonth.toLocaleString()} />
              <OutputRow label="Decision maker contacts / agent / mo" value={forecastCalcs.dmContactsPerAgent.toFixed(1)} />
              <OutputRow label="Appointments set / agent / mo" value={forecastCalcs.appointmentsPerAgent.toFixed(1)} />
              <OutputRow label="Shows / agent / mo" value={forecastCalcs.showsPerAgent.toFixed(1)} />
              <OutputRow label="New SOWs / agent / mo" value={forecastCalcs.sowsPerAgent.toFixed(2)} />
              <OutputRow label="Revenue / agent / mo" value={fmtK(forecastCalcs.revenuePerAgent)} highlight />
              <div className="border-t border-[#DFE1E6] pt-3">
                <OutputRow label="Agents needed" value={forecastCalcs.agentsNeeded} highlight large />
              </div>
              <div className="border-t border-[#DFE1E6] pt-3 space-y-2">
                <p className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wider">Monthly Pipeline Needed</p>
                <OutputRow label="New leads needed" value={Math.round(forecastCalcs.monthlyLeadsNeeded).toLocaleString()} />
                <OutputRow label="Appointments needed" value={Math.round(forecastCalcs.monthlyApptsNeeded).toLocaleString()} />
                <OutputRow label="Presentations needed" value={Math.round(forecastCalcs.monthlyPresentationsNeeded).toLocaleString()} />
                <OutputRow label="New clients projected" value={Math.round(forecastCalcs.monthlySowsNeeded).toLocaleString()} highlight />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ForecastInput({ label, value, onChange, prefix }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs text-[#5E6C84] flex-1">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#5E6C84]">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`w-28 text-xs font-mono border border-[#DFE1E6] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D] text-right ${prefix ? 'pl-6' : ''}`}
        />
      </div>
    </div>
  )
}

function OutputRow({ label, value, highlight, large }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#5E6C84]">{label}</span>
      <span className={`font-mono ${large ? 'text-lg font-bold text-[#172B4D]' : highlight ? 'text-sm font-bold text-[#172B4D]' : 'text-sm text-[#172B4D]'}`}>{value}</span>
    </div>
  )
}
