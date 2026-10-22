'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileWarning,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Scale,
  Shield,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import {
  RISK_TIER_CONFIG,
  QUALIFICATION_STATUS_CONFIG,
  CERTIFICATION_STATUS_CONFIG,
} from '@/types/onchain-insights';

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const { useSupplier } = useOnchainInsights();
  const { data: supplier, isLoading, isError, refetch, isFetching } = useSupplier(id);

  // Radar chart data preparation
  const radarData = useMemo(() => {
    if (!supplier) return [];
    const qs = supplier.qualificationScore;
    return [
      { subject: 'Delivery', value: qs.deliveryReliability, fullMark: 100 },
      { subject: 'Quality', value: qs.qualityRating, fullMark: 100 },
      { subject: 'Lead Time', value: qs.leadTimeScore, fullMark: 100 },
      { subject: 'Capacity', value: qs.capacityScore, fullMark: 100 },
      { subject: 'Financial', value: qs.financialStability, fullMark: 100 },
      { subject: 'Compliance', value: qs.complianceScore, fullMark: 100 },
    ];
  }, [supplier]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (isError || !supplier) {
    return (
      <div className="p-12 text-center border border-rose-200 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Supplier Not Found</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          Could not locate supplier with ID <code className="font-mono">{id}</code>.
        </p>
        <Link href="/onchain-insights/suppliers" className="btn-primary">
          Back to Suppliers Registry
        </Link>
      </div>
    );
  }

  const qs = supplier.qualificationScore;
  const statusCfg = QUALIFICATION_STATUS_CONFIG[supplier.qualificationStatus];
  const riskCfg = RISK_TIER_CONFIG[supplier.riskTier];
  const hasWarnings = supplier.missingDataWarnings && supplier.missingDataWarnings.length > 0;

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* ================================================================ */}
      {/* HEADER & ACTIONS */}
      {/* ================================================================ */}
      <div className="bg-white border border-surface-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <Breadcrumbs
            items={[
              { label: 'Onchain Insights', href: '/onchain-insights' },
              { label: 'Suppliers', href: '/onchain-insights/suppliers' },
              { label: supplier.name },
            ]}
          />
          <div className="flex items-center gap-2">
            <Link
              href="/onchain-insights/suppliers"
              className="btn-secondary text-xs px-3 py-1.5 gap-1.5"
            >
              <ArrowLeft size={13} />
              Directory
            </Link>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="btn-secondary text-xs px-3 py-1.5 gap-1.5"
            >
              <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pt-2 border-t border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-text-primary">
                {supplier.name}
              </h1>
              <Badge variant={statusCfg.badge}>
                {statusCfg.label}
              </Badge>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${riskCfg.bg} ${riskCfg.color} border ${riskCfg.border}`}
              >
                {riskCfg.label} Risk ({supplier.riskScore}/100)
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              {supplier.legalName} • <span className="font-mono">{supplier.code}</span> • {supplier.location}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/onchain-insights/supplier-switch?current=${supplier.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F8E7F6] text-[#4B164C] border border-[#4B164C]/20 hover:bg-[#ebd0e8] transition-all"
            >
              <Scale size={13} />
              Simulate Switching
            </Link>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* UNRESOLVED VERIFICATION & MISSING DATA WARNING BANNERS */}
      {/* ================================================================ */}
      {hasWarnings && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4.5 space-y-2 text-xs animate-fade-in">
          <div className="flex items-center gap-2 text-amber-800 font-bold">
            <FileWarning size={16} className="text-amber-600 shrink-0" />
            <span>Unresolved Verification Alerts ({supplier.missingDataWarnings!.length})</span>
          </div>
          <p className="text-amber-700 leading-relaxed text-[11px]">
            The following documentation gaps or verification anomalies were detected during audit reconciliation.
            These items directly reduce the supplier&apos;s compliance score and prevent unconditional qualification.
          </p>
          <ul className="list-disc list-inside space-y-1 text-amber-900 font-medium text-[11px] pt-1">
            {supplier.missingDataWarnings!.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ================================================================ */}
      {/* ACTIVE ISSUES ALERT */}
      {/* ================================================================ */}
      {supplier.unresolvedIssues.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-rose-800 font-bold">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>Active Issues & Disruption Incidents ({supplier.unresolvedIssues.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {supplier.unresolvedIssues.map((iss) => (
              <div key={iss.id} className="p-3 bg-white rounded-xl border border-rose-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900 text-xs">{iss.title}</span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                    {iss.severity}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">{iss.description}</p>
                <p className="text-[9px] text-text-muted font-medium pt-1">Reported: {iss.reportedDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MAIN TWO-COLUMN WORKSPACE */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============================================================== */}
        {/* LEFT COLUMN: QUALIFICATION SCORECARD & RADAR CHART (5 COLS) */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Overall Score Dial Card */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Qualification Scorecard
                </h3>
                <p className="text-base font-bold text-text-primary mt-0.5">
                  Multi-Factor Evaluation
                </p>
              </div>
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <ShieldCheck size={20} />
              </span>
            </div>

            {/* Score Big Display */}
            <div className="flex items-center justify-center p-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-100">
              <div className="text-center space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Overall Qualification Score
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    className={`text-5xl font-black tracking-tight ${
                      qs.overall >= 80 ? 'text-emerald-600' :
                      qs.overall >= 65 ? 'text-amber-600' :
                      'text-rose-600'
                    }`}
                  >
                    {qs.overall}
                  </span>
                  <span className="text-lg font-bold text-text-muted">/100</span>
                </div>
                <p className="text-[11px] font-semibold text-text-secondary pt-1">
                  {statusCfg.desc}
                </p>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-text-primary text-center">
                6-Dimensional Capability Radar
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: '#94a3b8', fontSize: 8 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#4B164C"
                      fill="#4B164C"
                      fillOpacity={0.35}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val}/100`, 'Score']}
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transparent Calculation Breakdown */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                <span>Weighted Scoring Formula</span>
                <span className="text-[10px] font-bold text-brand-primary">100% Total</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Delivery */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-text-secondary">On-Time Delivery (25%)</span>
                    <span className="font-bold text-text-primary">{qs.deliveryReliability} pts</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${qs.deliveryReliability}%` }}
                    />
                  </div>
                </div>

                {/* Quality */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-text-secondary">Quality & Defect PPM (25%)</span>
                    <span className="font-bold text-text-primary">{qs.qualityRating} pts</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${qs.qualityRating}%` }}
                    />
                  </div>
                </div>

                {/* Lead Time */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-text-secondary">Lead Time Performance (15%)</span>
                    <span className="font-bold text-text-primary">{qs.leadTimeScore} pts</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${qs.leadTimeScore}%` }}
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-text-secondary">Capacity & Scale (15%)</span>
                    <span className="font-bold text-text-primary">{qs.capacityScore} pts</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${qs.capacityScore}%` }}
                    />
                  </div>
                </div>

                {/* Financial */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-text-secondary">Financial Stability (10%)</span>
                    <span className="font-bold text-text-primary">{qs.financialStability} pts</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${qs.financialStability}%` }}
                    />
                  </div>
                </div>

                {/* Compliance */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-text-secondary">Compliance & Audited Certs (10%)</span>
                    <span className="font-bold text-text-primary">{qs.complianceScore} pts</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${qs.complianceScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Exact Math Explanation Box */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-text-muted leading-relaxed font-mono">
                {qs.explanation}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: OPERATIONAL METRICS & CERTIFICATIONS (7 COLS) */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Operational Metrics Cards */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Operational Performance Indicators
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-text-muted uppercase">On-Time Delivery</p>
                <p className="text-xl font-bold text-text-primary mt-1">{supplier.onTimeDeliveryRate}%</p>
                <p className="text-[9px] text-text-muted mt-0.5">Historical fulfillment</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-text-muted uppercase">Avg Lead Time</p>
                <p className="text-xl font-bold text-text-primary mt-1">{supplier.averageLeadTimeDays} <span className="text-xs font-normal">days</span></p>
                <p className="text-[9px] text-text-muted mt-0.5">PO issuance to dock</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-text-muted uppercase">Defect Rate</p>
                <p className="text-xl font-bold text-text-primary mt-1">{supplier.defectRatePpm} <span className="text-xs font-normal">PPM</span></p>
                <p className="text-[9px] text-text-muted mt-0.5">Incoming rejection rate</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-text-muted uppercase">Monthly Capacity</p>
                <p className="text-xl font-bold text-text-primary mt-1">{supplier.monthlyCapacityUnits.toLocaleString()}</p>
                <p className="text-[9px] text-text-muted mt-0.5">Total units/month</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-text-muted uppercase">Capacity Util.</p>
                <p className="text-xl font-bold text-text-primary mt-1">{supplier.capacityUtilizationRate}%</p>
                <p className="text-[9px] text-text-muted mt-0.5">Current plant loading</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-text-muted uppercase">Commercial Terms</p>
                <p className="text-sm font-bold text-text-primary mt-1.5 truncate">{supplier.paymentTerms}</p>
                <p className="text-[9px] text-text-muted mt-0.5">Currency: {supplier.currency}</p>
              </div>
            </div>
          </div>

          {/* Certifications & Regulatory Audits */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Certifications & Compliance Portfolio
                </h3>
                <p className="text-sm font-bold text-text-primary mt-0.5">
                  Verified Standards & Document Health
                </p>
              </div>
              <span className="text-[10px] font-bold text-text-muted bg-slate-100 px-2.5 py-1 rounded-full">
                {supplier.certifications.length} documents
              </span>
            </div>

            <div className="space-y-2.5">
              {supplier.certifications.map((cert) => {
                const certCfg = CERTIFICATION_STATUS_CONFIG[cert.status];
                return (
                  <div
                    key={cert.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileCheck2 size={16} className="text-[#4B164C] shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-text-primary leading-tight">
                            {cert.name}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            Issued by {cert.issuer}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${certCfg.bg} ${certCfg.color} border ${certCfg.border}`}
                      >
                        {certCfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-text-muted pt-1 border-t border-slate-50">
                      <span>Issued: {cert.issuedDate}</span>
                      <span>Expires: {cert.expiryDate}</span>
                      {cert.verificationNotes && (
                        <span className="text-text-secondary italic">
                          &ldquo;{cert.verificationNotes}&rdquo;
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Materials & Corporate Profile */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Materials Supplied & Operational Scope
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {supplier.materialsSupplied.map((mat) => (
                <span
                  key={mat}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {mat}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Primary Contact */}
              <div className="space-y-1.5 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
                  <User size={12} /> Key Account Contact
                </p>
                <p className="font-bold text-text-primary">{supplier.primaryContact.name}</p>
                <p className="text-[11px] text-text-secondary">{supplier.primaryContact.title}</p>
                <div className="pt-1 space-y-0.5 text-[10px] text-text-muted">
                  <p className="flex items-center gap-1.5"><Mail size={11} /> {supplier.primaryContact.email}</p>
                  <p className="flex items-center gap-1.5"><Phone size={11} /> {supplier.primaryContact.phone}</p>
                </div>
              </div>

              {/* Audit Dates & Assessment */}
              <div className="space-y-1.5 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
                  <Calendar size={12} /> Audit & Governance Schedule
                </p>
                <div className="space-y-1 text-[11px] pt-1">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Last Assessment:</span>
                    <span className="font-semibold text-text-primary">{supplier.lastAssessmentDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Last Site Audit:</span>
                    <span className="font-semibold text-text-primary">{supplier.lastAuditDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Next Audit Due:</span>
                    <span className="font-semibold text-brand-primary">{supplier.nextAuditDueDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {supplier.notes && (
              <div className="p-3 bg-white border border-slate-100 rounded-xl text-xs text-text-secondary leading-relaxed">
                <strong className="text-text-primary block mb-0.5">Procurement Notes:</strong>
                {supplier.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
