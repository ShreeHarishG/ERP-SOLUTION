'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Building2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileCheck2,
  Shield,
  Info,
  Sparkles,
  HelpCircle,
  X,
  FileWarning,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import { STANDARD_ONBOARDING_DOCUMENTS } from '@/lib/mock-data/onchain-insights/onboarding';
import type { OnboardingFormInput, RiskTier } from '@/types/onchain-insights';

export default function SupplierOnboardingWizardPage() {
  const router = useRouter();
  const { useSubmitOnboarding } = useOnchainInsights();
  const submitMutation = useSubmitOnboarding();

  // Wizard Step State (1: Identity, 2: Operational, 3: Documents, 4: Review)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState<OnboardingFormInput>({
    name: '',
    legalName: '',
    country: 'India',
    location: '',
    taxId: '',
    materialsSupplied: [],
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactTitle: '',
    monthlyCapacityUnits: 50000,
    quotedLeadTimeDays: 7,
    paymentTerms: 'Net 30 Days',
    currency: 'INR',
    documentIdsUploaded: ['doc-incorp', 'doc-gst'], // Default with 2 uploaded
    selfAssessmentRisk: 'medium',
    initialNotes: '',
  });

  // Material tag input helper
  const [materialInput, setMaterialInput] = useState('');

  const addMaterial = () => {
    if (materialInput.trim() && !formData.materialsSupplied.includes(materialInput.trim())) {
      setFormData(prev => ({
        ...prev,
        materialsSupplied: [...prev.materialsSupplied, materialInput.trim()],
      }));
      setMaterialInput('');
    }
  };

  const removeMaterial = (mat: string) => {
    setFormData(prev => ({
      ...prev,
      materialsSupplied: prev.materialsSupplied.filter(m => m !== mat),
    }));
  };

  // Toggle uploaded document
  const toggleDocUpload = (docId: string) => {
    setFormData(prev => {
      const exists = prev.documentIdsUploaded.includes(docId);
      const nextDocs = exists
        ? prev.documentIdsUploaded.filter(id => id !== docId)
        : [...prev.documentIdsUploaded, docId];
      return { ...prev, documentIdsUploaded: nextDocs };
    });
  };

  // Step validation
  const canProceedStep1 = Boolean(
    formData.name.trim() &&
    formData.legalName.trim() &&
    formData.taxId.trim() &&
    formData.contactEmail.trim()
  );

  const canProceedStep2 = Boolean(
    formData.materialsSupplied.length > 0 &&
    formData.monthlyCapacityUnits > 0 &&
    formData.quotedLeadTimeDays > 0
  );

  const requiredDocs = STANDARD_ONBOARDING_DOCUMENTS.filter(d => d.isRequired);
  const uploadedRequiredCount = requiredDocs.filter(d =>
    formData.documentIdsUploaded.includes(d.id)
  ).length;
  const canProceedStep3 = uploadedRequiredCount >= 3; // At least 3 required docs

  // Preliminary qualification score prediction
  const preliminaryScore = Math.min(
    95,
    Math.max(35, 45 + formData.documentIdsUploaded.length * 7 + (canProceedStep2 ? 10 : 0))
  );

  // Submission handler
  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync(formData);
      toast.success('Onboarding application submitted for qualification audit!');
      router.push('/onchain-insights/suppliers/onboard/queue');
    } catch (err: any) {
      toast.error('Failed to submit onboarding application. Please check inputs.');
    }
  };

  return (
    <div className="space-y-6 p-6 animate-slide-up max-w-5xl mx-auto">
      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}
      <div className="bg-white border border-surface-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <Breadcrumbs
            items={[
              { label: 'Onchain Insights', href: '/onchain-insights' },
              { label: 'Suppliers', href: '/onchain-insights/suppliers' },
              { label: 'New Supplier Onboarding' },
            ]}
          />
          <Link
            href="/onchain-insights/suppliers/onboard/queue"
            className="btn-secondary text-xs px-3.5 py-1.5 gap-1.5"
          >
            Review Queue
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
              New Supplier Qualification Wizard
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Structured step-by-step supplier onboarding, document collection, and compliance verification
            </p>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px] font-bold">
            Step {currentStep} of 4
          </Badge>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[
            { step: 1, label: '1. Identity & Legal' },
            { step: 2, label: '2. Capabilities' },
            { step: 3, label: '3. Documentation' },
            { step: 4, label: '4. Self-Review' },
          ].map(s => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div
                key={s.step}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'border-[#4B164C] bg-[#F8E7F6]/40 text-[#4B164C] font-bold'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700 font-semibold'
                    : 'border-slate-200 bg-slate-50 text-text-muted'
                }`}
              >
                <p className="text-xs">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* STEP 1: IDENTITY & LEGAL */}
      {/* ================================================================ */}
      {currentStep === 1 && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-surface-border pb-3">
            <Building2 size={18} className="text-[#4B164C]" />
            <div>
              <h3 className="text-sm font-bold text-text-primary">Corporate & Legal Registration</h3>
              <p className="text-xs text-text-muted">Enter registered business details and official operating entity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-muted uppercase">Commercial Brand / Trade Name *</label>
              <input
                type="text"
                placeholder="e.g. Acme Precision Components"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="input-field py-2 h-9 text-xs w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-muted uppercase">Full Legal Registered Entity Name *</label>
              <input
                type="text"
                placeholder="e.g. Acme Precision Components Pvt. Ltd."
                value={formData.legalName}
                onChange={e => setFormData(p => ({ ...p, legalName: e.target.value }))}
                className="input-field py-2 h-9 text-xs w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-muted uppercase">Tax Identification / GSTIN *</label>
              <input
                type="text"
                placeholder="e.g. GSTIN27AAACA1234A1Z1"
                value={formData.taxId}
                onChange={e => setFormData(p => ({ ...p, taxId: e.target.value }))}
                className="input-field py-2 h-9 text-xs w-full font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-muted uppercase">Country of Incorporation</label>
              <select
                value={formData.country}
                onChange={e => setFormData(p => ({ ...p, country: e.target.value }))}
                className="input-field py-2 h-9 text-xs w-full font-medium"
              >
                <option value="India">India</option>
                <option value="China">China</option>
                <option value="Myanmar">Myanmar</option>
                <option value="Vietnam">Vietnam</option>
                <option value="Germany">Germany</option>
                <option value="United States">United States</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-text-muted uppercase">Primary Facility / Factory Location</label>
              <input
                type="text"
                placeholder="e.g. Industrial Area Phase 2, Pune, Maharashtra, India"
                value={formData.location}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                className="input-field py-2 h-9 text-xs w-full"
              />
            </div>
          </div>

          {/* Primary Contact Info */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Primary Commercial / Procurement Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-text-muted">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.contactName}
                  onChange={e => setFormData(p => ({ ...p, contactName: e.target.value }))}
                  className="input-field py-1.5 h-8 text-xs w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-text-muted">Title / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. VP Business Development"
                  value={formData.contactTitle}
                  onChange={e => setFormData(p => ({ ...p, contactTitle: e.target.value }))}
                  className="input-field py-1.5 h-8 text-xs w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-text-muted">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. contact@acmeprecision.com"
                  value={formData.contactEmail}
                  onChange={e => setFormData(p => ({ ...p, contactEmail: e.target.value }))}
                  className="input-field py-1.5 h-8 text-xs w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-text-muted">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98200 11223"
                  value={formData.contactPhone}
                  onChange={e => setFormData(p => ({ ...p, contactPhone: e.target.value }))}
                  className="input-field py-1.5 h-8 text-xs w-full"
                />
              </div>
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex justify-between pt-4 border-t border-surface-border">
            <Link href="/onchain-insights/suppliers" className="btn-secondary text-xs px-4 py-2">
              Cancel
            </Link>
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedStep1}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                canProceedStep1
                  ? 'bg-[#4B164C] text-white hover:bg-[#39103a] shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Next: Capabilities
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* STEP 2: CAPABILITIES & COMMERCIALS */}
      {/* ================================================================ */}
      {currentStep === 2 && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-surface-border pb-3">
            <FileText size={18} className="text-[#4B164C]" />
            <div>
              <h3 className="text-sm font-bold text-text-primary">Manufacturing Scope & Operational Capacity</h3>
              <p className="text-xs text-text-muted">Specify target materials supplied, capacity ceilings, and order parameters</p>
            </div>
          </div>

          {/* Materials Tag Editor */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-text-muted uppercase">
              Materials / Component Categories Supplied *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add material (e.g. Steel Brackets, Teak Wood Planks) and press Enter"
                value={materialInput}
                onChange={e => setMaterialInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMaterial();
                  }
                }}
                className="input-field py-2 h-9 text-xs flex-1"
              />
              <button
                type="button"
                onClick={addMaterial}
                className="btn-secondary text-xs px-4 py-2"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1 min-h-[36px]">
              {formData.materialsSupplied.length === 0 ? (
                <span className="text-xs text-amber-600 italic">No materials added yet. Please specify at least 1 material.</span>
              ) : (
                formData.materialsSupplied.map(mat => (
                  <span
                    key={mat}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#F8E7F6] text-[#4B164C] border border-[#4B164C]/20"
                  >
                    {mat}
                    <button
                      type="button"
                      onClick={() => removeMaterial(mat)}
                      className="hover:text-rose-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-muted uppercase">Monthly Capacity (Units) *</label>
              <input
                type="number"
                min="100"
                step="1000"
                value={formData.monthlyCapacityUnits}
                onChange={e => setFormData(p => ({ ...p, monthlyCapacityUnits: Number(e.target.value) }))}
                className="input-field py-2 h-9 text-xs w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-muted uppercase">Quoted Lead Time (Days) *</label>
              <input
                type="number"
                min="1"
                max="90"
                value={formData.quotedLeadTimeDays}
                onChange={e => setFormData(p => ({ ...p, quotedLeadTimeDays: Number(e.target.value) }))}
                className="input-field py-2 h-9 text-xs w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-muted uppercase">Payment Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={e => setFormData(p => ({ ...p, paymentTerms: e.target.value }))}
                className="input-field py-2 h-9 text-xs w-full font-medium"
              >
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="Net 45 Days">Net 45 Days</option>
                <option value="Net 60 Days">Net 60 Days</option>
                <option value="LC at Sight">Letter of Credit (LC)</option>
                <option value="TT 30% Advance">TT 30% Advance</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-muted uppercase">Invoicing Currency</label>
              <select
                value={formData.currency}
                onChange={e => setFormData(p => ({ ...p, currency: e.target.value }))}
                className="input-field py-2 h-9 text-xs w-full font-medium"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          {/* Initial Procurement Notes */}
          <div className="space-y-1 pt-2">
            <label className="text-[11px] font-bold text-text-muted uppercase">Initial Capability Remarks / Notes</label>
            <textarea
              rows={3}
              placeholder="Add internal procurement notes on candidate machinery, plant audit dates, or trial run schedules..."
              value={formData.initialNotes}
              onChange={e => setFormData(p => ({ ...p, initialNotes: e.target.value }))}
              className="input-field p-2.5 text-xs w-full"
            />
          </div>

          {/* Nav Controls */}
          <div className="flex justify-between pt-4 border-t border-surface-border">
            <button
              onClick={() => setCurrentStep(1)}
              className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!canProceedStep2}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                canProceedStep2
                  ? 'bg-[#4B164C] text-white hover:bg-[#39103a] shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Next: Document Checklist
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* STEP 3: DOCUMENT CHECKLIST & EVIDENCE UPLOAD */}
      {/* ================================================================ */}
      {currentStep === 3 && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <UploadCloud size={18} className="text-[#4B164C]" />
              <div>
                <h3 className="text-sm font-bold text-text-primary">Compliance Documentation Checklist</h3>
                <p className="text-xs text-text-muted">Collect required statutory, quality, and financial verification proofs</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-text-primary">
                {formData.documentIdsUploaded.length} of {STANDARD_ONBOARDING_DOCUMENTS.length} Attached
              </span>
              <p className="text-[10px] text-text-muted">
                {uploadedRequiredCount} of {requiredDocs.length} Required Docs
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Simulated Document Ingestion:</strong> Toggle document attachment cards below.
              In mock mode, file metadata is securely simulated and queued for audit verification. No external verification is assumed until reviewed.
            </span>
          </div>

          {/* Document Cards List */}
          <div className="space-y-3">
            {STANDARD_ONBOARDING_DOCUMENTS.map(doc => {
              const isUploaded = formData.documentIdsUploaded.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isUploaded
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : doc.isRequired
                      ? 'bg-white border-amber-200'
                      : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`p-2 rounded-lg mt-0.5 ${isUploaded ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {isUploaded ? <FileCheck2 size={16} /> : <FileText size={16} />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-text-primary">{doc.name}</span>
                        {doc.isRequired ? (
                          <Badge variant="amber" className="text-[9px] uppercase font-bold">Required</Badge>
                        ) : (
                          <span className="text-[9px] font-semibold text-text-muted bg-slate-100 px-1.5 py-0.5 rounded">Optional</span>
                        )}
                        <span className="text-[9px] uppercase font-bold text-text-muted bg-slate-100 px-1.5 py-0.5 rounded">
                          {doc.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {isUploaded
                          ? `Simulated File Attached: ${doc.id}_${formData.name || 'Vendor'}.pdf (1.8 MB)`
                          : 'Document not yet attached.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleDocUpload(doc.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                      isUploaded
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isUploaded ? 'Remove File' : 'Attach Document'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Nav Controls */}
          <div className="flex justify-between pt-4 border-t border-surface-border">
            <button
              onClick={() => setCurrentStep(2)}
              className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              disabled={!canProceedStep3}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                canProceedStep3
                  ? 'bg-[#4B164C] text-white hover:bg-[#39103a] shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Next: Review & Submit
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* STEP 4: REVIEW SUMMARY & SUBMISSION */}
      {/* ================================================================ */}
      {currentStep === 4 && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#4B164C]" />
              <div>
                <h3 className="text-sm font-bold text-text-primary">Pre-Audit Summary & Triage Preview</h3>
                <p className="text-xs text-text-muted">Review vendor profile before queuing for formal qualification audit</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-text-muted uppercase">Predicted Initial Score</span>
              <p className="text-xl font-black text-emerald-600">{preliminaryScore}/100</p>
            </div>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Identity Card */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2">
              <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                Business Identification
              </h4>
              <div className="space-y-1 text-text-secondary text-[11px]">
                <p><strong>Trade Name:</strong> {formData.name}</p>
                <p><strong>Legal Entity:</strong> {formData.legalName}</p>
                <p><strong>Tax ID:</strong> {formData.taxId}</p>
                <p><strong>Country / Region:</strong> {formData.country} • {formData.location}</p>
              </div>
            </div>

            {/* Contact Card */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2">
              <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                Primary Contact Information
              </h4>
              <div className="space-y-1 text-text-secondary text-[11px]">
                <p><strong>Contact:</strong> {formData.contactName} ({formData.contactTitle})</p>
                <p><strong>Email:</strong> {formData.contactEmail}</p>
                <p><strong>Phone:</strong> {formData.contactPhone}</p>
              </div>
            </div>

            {/* Scope Card */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2">
              <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                Operational Parameters
              </h4>
              <div className="space-y-1 text-text-secondary text-[11px]">
                <p><strong>Materials:</strong> {formData.materialsSupplied.join(', ')}</p>
                <p><strong>Monthly Capacity:</strong> {formData.monthlyCapacityUnits.toLocaleString()} units</p>
                <p><strong>Quoted Lead Time:</strong> {formData.quotedLeadTimeDays} days</p>
                <p><strong>Payment Terms:</strong> {formData.paymentTerms} ({formData.currency})</p>
              </div>
            </div>

            {/* Documentation Summary */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2">
              <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                Document Compliance Readiness
              </h4>
              <div className="space-y-1 text-text-secondary text-[11px]">
                <p><strong>Total Attached:</strong> {formData.documentIdsUploaded.length} certificates & agreements</p>
                <p><strong>Required Documents:</strong> {uploadedRequiredCount} of {requiredDocs.length} fulfilled</p>
                <p><strong>Audit Initial Status:</strong> Pending Reviewer Assignment</p>
              </div>
            </div>
          </div>

          {/* Governance Notice */}
          <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Shield size={14} className="text-blue-600" /> Human Approval Governance Note
            </p>
            <p className="text-[11px] leading-relaxed">
              Submitting this form adds the supplier to the <strong>Onboarding Review Queue</strong> with status <code>PENDING REVIEW</code>.
              No purchase orders can be cut until procurement leadership approves the qualification packet.
            </p>
          </div>

          {/* Final Submission Buttons */}
          <div className="flex justify-between pt-4 border-t border-surface-border">
            <button
              onClick={() => setCurrentStep(3)}
              className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back to Documents
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#4B164C] text-white hover:bg-[#39103a] shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {submitMutation.isPending ? 'Submitting Application...' : 'Submit for Qualification Review'}
              <CheckCircle2 size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
