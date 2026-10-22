'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X, Lightbulb, AlertTriangle, ArrowRight, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [insightsData, setInsightsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/ai/dashboard')
        .then(res => res.json())
        .then(res => {
          if (res.success && res.data) {
            setInsightsData(res.data);
          }
        })
        .catch(err => console.error('Error fetching AI insights:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Generate context recommendations based on route path
  const getContextInsights = () => {
    const data = insightsData || {
      operationalHealthScore: 91,
      operationalHealthBreakdown: { inventory: 95, manufacturing: 88, procurement: 89, sales: 92 },
      criticalRisks: [{ risk: 'Low Stock Safety Alert', severity: 'Medium', reason: 'Average raw material reserves are nearing safety limits.', roles: ['admin', 'inventory'] }],
      recommendations: [{ action: 'Approve Pending Purchase RFQs', impact: 'High', reason: 'Prevents safety stockouts across the assembly line.', roles: ['admin', 'purchase'] }],
      procurementInsights: [{ name: 'Wood Screws', sku: 'RM-SC-001', currentStock: 120, consumption: 15, daysRemaining: 8, suggestedOrder: 500, preferredVendor: 'Global Timber Ltd', riskScore: 'High', urgency: 'Medium', reason: 'Projected demand exceeds current inventory.' }],
      manufacturingInsights: [{ moNumber: 'MO-102', product: 'Wooden Chair', delayRisk: '78%', reason: 'Required materials have not arrived.', urgency: 'High' }],
      executiveSummary: 'Welcome to ChainIQ ERP Command Center.'
    };

    if (pathname.startsWith('/dashboard')) {
      return {
        title: 'Operations Overview Insights',
        summary: data.executiveSummary || 'System health looks positive overall.',
        recommendations: (data.recommendations || []).map((r: any) => ({
          text: r.action,
          savings: r.reason
        })).slice(0, 2),
        alerts: (data.criticalRisks || []).map((r: any) => ({
          type: r.severity?.toLowerCase() === 'high' ? 'critical' : 'warning',
          text: `${r.risk}: ${r.reason}`
        })).slice(0, 2)
      };
    } else if (pathname.startsWith('/products')) {
      return {
        title: 'Catalog & Margin Insights',
        summary: `Your catalog contains active product segments. Raw component costs represent safety margins.`,
        recommendations: (data.recommendations || [])
          .filter((r: any) => r.roles?.includes('product_manager') || r.roles?.includes('admin'))
          .map((r: any) => ({ text: r.action, savings: r.reason }))
          .slice(0, 2),
        alerts: (data.criticalRisks || [])
          .filter((r: any) => r.roles?.includes('product_manager') || r.roles?.includes('admin'))
          .map((r: any) => ({ type: 'info', text: r.reason }))
          .slice(0, 2)
      };
    } else if (pathname.startsWith('/inventory')) {
      return {
        title: 'Inventory Forecasting',
        summary: `Average stock holding health score index is ${data.operationalHealthBreakdown?.inventory || 95}/100.`,
        recommendations: (data.procurementInsights || []).map((p: any) => ({
          text: `Order ${p.suggestedOrder} units of ${p.name} from ${p.preferredVendor}.`,
          savings: `Prevents shortage (Stockout expected in ${p.daysRemaining} days)`
        })).slice(0, 2),
        alerts: (data.criticalRisks || [])
          .filter((r: any) => r.roles?.includes('inventory') || r.roles?.includes('admin'))
          .map((r: any) => ({ type: 'critical', text: r.reason }))
          .slice(0, 2)
      };
    } else if (pathname.startsWith('/bom')) {
      return {
        title: 'Bill of Materials Analysis',
        summary: `Manufacturing bottlenecks are evaluated across all assembly recipes. Department OEE is monitored.`,
        recommendations: (data.manufacturingInsights || []).map((m: any) => ({
          text: `Resolve delay risk (${m.delayRisk}) on MO ${m.moNumber} (${m.product}).`,
          savings: m.reason
        })).slice(0, 2),
        alerts: (data.criticalRisks || [])
          .filter((r: any) => r.roles?.includes('product_manager') || r.roles?.includes('admin'))
          .map((r: any) => ({ type: 'warning', text: r.reason }))
          .slice(0, 2)
      };
    }

    return {
      title: 'General ERP Insights',
      summary: data.executiveSummary || 'Welcome to ChainIQ ERP Command Center. Select any module to display context-aware optimization insights.',
      recommendations: (data.recommendations || []).map((r: any) => ({ text: r.action, savings: r.reason })).slice(0, 2),
      alerts: []
    };
  };

  const insights = getContextInsights();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setQuery('');
    setIsTyping(true);

    try {
      const webhookUrl = 'https://api.agents.snsihub.ai/webhook/ffe27c5a-f302-478f-8c6e-723ddae680c8';
      const userRole = user?.role || 'sales';
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMsg,
          role: userRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI Copilot');
      }

      const resData = await response.json();

      // Parse n8n webhook response format: { items: [{ json: "answer" }] }
      let answer = '';
      if (resData && Array.isArray(resData.items) && resData.items.length > 0) {
        const firstItem = resData.items[0];
        answer = typeof firstItem.json === 'string'
          ? firstItem.json
          : JSON.stringify(firstItem.json);
      } else if (resData && typeof resData.answer === 'string') {
        answer = resData.answer;
      } else if (resData && typeof resData.output === 'string') {
        answer = resData.output;
      } else if (typeof resData === 'string') {
        answer = resData;
      } else {
        answer = JSON.stringify(resData);
      }

      setMessages(prev => [...prev, { sender: 'ai', text: answer }]);
    } catch (err: any) {
      console.error('Error sending chat message:', err);
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I encountered an error connecting to the AI Copilot. Please try again.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };


  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/10 z-40 backdrop-blur-[1px] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white border-l border-surface-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-brand text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-brand-accent animate-pulse" />
            <h2 className="font-bold text-sm tracking-wider uppercase">ChainIQ Copilot</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Summary */}
          <div className="p-4 rounded-xl bg-surface-hover/30 border border-brand-accent/20">
            <h3 className="font-bold text-xs text-brand-primary uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Lightbulb size={14} className="text-brand-accent" />
              {insights.title}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">{insights.summary}</p>
          </div>

          {/* Critical Alerts */}
          {insights.alerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Alerts & Risks</h4>
              {insights.alerts.map((alert: { type: string; text: string }, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs flex gap-2.5 items-start ${alert.type === 'critical'
                      ? 'bg-rose-50 border-rose-200/50 text-rose-800'
                      : alert.type === 'warning'
                        ? 'bg-amber-50 border-amber-200/50 text-amber-800'
                        : 'bg-blue-50 border-blue-200/50 text-blue-800'
                    }`}
                >
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <p>{alert.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">AI Recommendations</h4>
            <div className="space-y-2.5">
              {insights.recommendations.map((rec: { text: string; savings?: string }, idx: number) => (
                <div key={idx} className="p-3 border border-surface-border rounded-xl bg-slate-50/50 space-y-1 hover:border-brand-accent/30 transition-all">
                  <div className="flex gap-2 items-start">
                    <ArrowRight size={14} className="text-brand-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-text-primary font-medium">{rec.text}</p>
                  </div>
                  {rec.savings && (
                    <span className="text-[10px] font-semibold text-emerald-600 pl-5 block">
                      {rec.savings}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dialogue Section */}
          <div className="border-t border-surface-border pt-5 space-y-3">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={14} className="text-brand-accent" />
              Ask Copilot
            </h4>

            {/* Conversation Log */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <p className="text-[11px] text-text-muted italic text-center py-4">
                  Ask me about product costs, stock forecasts, or how to resolve safety levels.
                </p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg text-xs leading-relaxed max-w-[85%] ${msg.sender === 'user'
                        ? 'bg-brand-accent/10 border border-brand-accent/20 text-brand-primary ml-auto rounded-tr-none'
                        : 'bg-slate-100 text-text-primary mr-auto rounded-tl-none'
                      }`}
                  >
                    {msg.text}
                  </div>
                ))
              )}
              {isTyping && (
                <div className="bg-slate-100 p-2.5 rounded-lg rounded-tl-none mr-auto max-w-[85%] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Form Footer */}
        <form onSubmit={handleSend} className="p-4 border-t border-surface-border bg-slate-50 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI Copilot..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-white border border-surface-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-highlight focus:ring-1 focus:ring-brand-highlight/20"
          />
          <button
            type="submit"
            disabled={isTyping || !query.trim()}
            className="p-2 bg-brand-primary hover:bg-brand-hover text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </>
  );
};
