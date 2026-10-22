// =============================================================================
// Onchain Insights — Supplier Onboarding Mock Data & Workflow Store
// Structured onboarding wizard data, document checklists, and review queue.
// =============================================================================

import type {
  OnboardingSupplierRecord,
  OnboardingDocument,
  OnboardingStage,
  OnboardingFormInput,
  ReviewDecisionPayload,
  SupplierStatusHistoryEntry,
} from '@/types/onchain-insights';

// Standard document checklist templates for new suppliers
export const STANDARD_ONBOARDING_DOCUMENTS: Omit<OnboardingDocument, 'status' | 'uploadedAt'>[] = [
  {
    id: 'doc-incorp',
    name: 'Certificate of Incorporation',
    category: 'legal',
    isRequired: true,
  },
  {
    id: 'doc-gst',
    name: 'GST / Tax Registration Certificate',
    category: 'tax',
    isRequired: true,
  },
  {
    id: 'doc-iso9001',
    name: 'ISO 9001:2015 Quality Management Certificate',
    category: 'quality',
    isRequired: true,
  },
  {
    id: 'doc-iso14001',
    name: 'ISO 14001:2015 Environmental Management',
    category: 'environmental',
    isRequired: false,
  },
  {
    id: 'doc-financial',
    name: 'Audited Financial Statements (Last 2 Fiscal Years)',
    category: 'financial',
    isRequired: true,
  },
  {
    id: 'doc-nda',
    name: 'Anti-Bribery & Supplier Code of Conduct Agreement',
    category: 'compliance',
    isRequired: true,
  },
  {
    id: 'doc-safety',
    name: 'Occupational Health & Factory Safety Audit Report',
    category: 'compliance',
    isRequired: false,
  },
];

// In-memory array for realistic interactive mock sessions
let ONBOARDING_SUPPLIERS_STORE: OnboardingSupplierRecord[] = [
  {
    id: 'onb-001',
    name: 'Himalayan Minerals Ltd.',
    legalName: 'Himalayan Mineral & Silica Extraction Pvt. Ltd.',
    code: 'ONB-HML-001',
    country: 'India',
    location: 'Dehradun, Uttarakhand, India',
    taxId: 'GSTIN05AAACH1234F1Z5',
    materialsSupplied: ['Industrial Silica Sand', 'Quartz Mineral Powder'],
    primaryContact: {
      name: 'Virendra Rawat',
      title: 'Managing Director',
      email: 'virendra@himalayanminerals.in',
      phone: '+91 94120 77889',
    },
    operationalDetails: {
      monthlyCapacityUnits: 50000,
      quotedLeadTimeDays: 7,
      paymentTerms: 'Net 30 Days',
      currency: 'INR',
    },
    onboardingStage: 'under_audit',
    submittedAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-09T14:30:00Z',
    initialQualificationScore: 78,
    assignedReviewer: 'Priya Sharma (Lead Procurement Auditor)',
    reviewerNotes: 'Site environmental clearance verified. Pending validation of audited financial statements.',
    documents: [
      {
        id: 'doc-incorp',
        name: 'Certificate of Incorporation',
        category: 'legal',
        isRequired: true,
        status: 'verified',
        fileName: 'COI_Himalayan_Minerals.pdf',
        fileSize: '1.4 MB',
        uploadedAt: '2026-10-02T10:15:00Z',
        verifiedAt: '2026-10-05T11:00:00Z',
        verifiedBy: 'Priya Sharma',
      },
      {
        id: 'doc-gst',
        name: 'GST / Tax Registration Certificate',
        category: 'tax',
        isRequired: true,
        status: 'verified',
        fileName: 'GST_Reg_05AAACH.pdf',
        fileSize: '820 KB',
        uploadedAt: '2026-10-02T10:18:00Z',
        verifiedAt: '2026-10-05T11:15:00Z',
        verifiedBy: 'Priya Sharma',
      },
      {
        id: 'doc-iso9001',
        name: 'ISO 9001:2015 Quality Management Certificate',
        category: 'quality',
        isRequired: true,
        status: 'verified',
        fileName: 'ISO9001_HML_TUV.pdf',
        fileSize: '2.1 MB',
        uploadedAt: '2026-10-02T10:22:00Z',
        verifiedAt: '2026-10-06T09:30:00Z',
        verifiedBy: 'Priya Sharma',
      },
      {
        id: 'doc-financial',
        name: 'Audited Financial Statements (Last 2 Fiscal Years)',
        category: 'financial',
        isRequired: true,
        status: 'uploaded',
        fileName: 'HML_Audited_FY24_25.pdf',
        fileSize: '4.8 MB',
        uploadedAt: '2026-10-02T10:30:00Z',
        notes: 'Under review by finance controller for liquidity ratio benchmark.',
      },
      {
        id: 'doc-nda',
        name: 'Anti-Bribery & Supplier Code of Conduct Agreement',
        category: 'compliance',
        isRequired: true,
        status: 'verified',
        fileName: 'Signed_Code_of_Conduct_HML.pdf',
        fileSize: '950 KB',
        uploadedAt: '2026-10-02T10:35:00Z',
        verifiedAt: '2026-10-05T14:00:00Z',
        verifiedBy: 'Priya Sharma',
      },
    ],
    statusHistory: [
      {
        id: 'sh-001',
        fromStatus: 'Initiated',
        toStatus: 'Pending Review',
        changedBy: 'Vendor Portal (Self-Service)',
        changedAt: '2026-10-02T10:35:00Z',
        reason: 'Initial onboarding submission completed.',
      },
      {
        id: 'sh-002',
        fromStatus: 'Pending Review',
        toStatus: 'Under Audit',
        changedBy: 'Priya Sharma (Procurement)',
        changedAt: '2026-10-05T11:00:00Z',
        reason: 'Preliminary triage approved; document audit opened.',
        comments: 'Legal documents verified. Financial statements forwarded for solvency review.',
      },
    ],
  },
  {
    id: 'onb-002',
    name: 'Deccan Eco-Fibres Pvt. Ltd.',
    legalName: 'Deccan Eco-Fibres & Natural Polymers Pvt. Ltd.',
    code: 'ONB-DEF-002',
    country: 'India',
    location: 'Hubballi, Karnataka, India',
    taxId: 'GSTIN29AABCD5678K1Z2',
    materialsSupplied: ['Coir Padding', 'Natural Jute Webbing', 'Hemp Fibre Sheets'],
    primaryContact: {
      name: 'Sunil Gopinath',
      title: 'Head of Operations',
      email: 'sunil@deccanecofibres.com',
      phone: '+91 98450 11223',
    },
    operationalDetails: {
      monthlyCapacityUnits: 80000,
      quotedLeadTimeDays: 5,
      paymentTerms: 'Net 45 Days',
      currency: 'INR',
    },
    onboardingStage: 'pending_review',
    submittedAt: '2026-10-10T16:20:00Z',
    updatedAt: '2026-10-10T16:20:00Z',
    initialQualificationScore: 72,
    assignedReviewer: 'Unassigned',
    documents: [
      {
        id: 'doc-incorp',
        name: 'Certificate of Incorporation',
        category: 'legal',
        isRequired: true,
        status: 'uploaded',
        fileName: 'COI_Deccan_Eco.pdf',
        fileSize: '1.2 MB',
        uploadedAt: '2026-10-10T16:10:00Z',
      },
      {
        id: 'doc-gst',
        name: 'GST / Tax Registration Certificate',
        category: 'tax',
        isRequired: true,
        status: 'uploaded',
        fileName: 'GST_Deccan_29AABCD.pdf',
        fileSize: '710 KB',
        uploadedAt: '2026-10-10T16:12:00Z',
      },
      {
        id: 'doc-iso9001',
        name: 'ISO 9001:2015 Quality Management Certificate',
        category: 'quality',
        isRequired: true,
        status: 'missing',
      },
      {
        id: 'doc-financial',
        name: 'Audited Financial Statements (Last 2 Fiscal Years)',
        category: 'financial',
        isRequired: true,
        status: 'uploaded',
        fileName: 'Deccan_FY24_Audit.pdf',
        fileSize: '3.2 MB',
        uploadedAt: '2026-10-10T16:15:00Z',
      },
      {
        id: 'doc-nda',
        name: 'Anti-Bribery & Supplier Code of Conduct Agreement',
        category: 'compliance',
        isRequired: true,
        status: 'uploaded',
        fileName: 'Signed_NDA_CodeOfConduct.pdf',
        fileSize: '890 KB',
        uploadedAt: '2026-10-10T16:18:00Z',
      },
    ],
    statusHistory: [
      {
        id: 'sh-003',
        fromStatus: 'Initiated',
        toStatus: 'Pending Review',
        changedBy: 'Vendor Portal (Self-Service)',
        changedAt: '2026-10-10T16:20:00Z',
        reason: 'New vendor submitted onboarding packet.',
      },
    ],
  },
  {
    id: 'onb-003',
    name: 'Bharat Alloy Extrusions',
    legalName: 'Bharat Alloy & Aluminium Extrusions Corp.',
    code: 'ONB-BAE-003',
    country: 'India',
    location: 'Faridabad, Haryana, India',
    taxId: 'GSTIN06AAACB9876P1Z3',
    materialsSupplied: ['Aluminium Frame Channels', 'Extruded Edge Profiles'],
    primaryContact: {
      name: 'Mohit Khurana',
      title: 'VP Sales & Alliances',
      email: 'm.khurana@bharatalloy.com',
      phone: '+91 98110 44556',
    },
    operationalDetails: {
      monthlyCapacityUnits: 40000,
      quotedLeadTimeDays: 12,
      paymentTerms: 'Net 30 Days',
      currency: 'INR',
    },
    onboardingStage: 'changes_requested',
    submittedAt: '2026-09-25T11:00:00Z',
    updatedAt: '2026-10-08T15:00:00Z',
    initialQualificationScore: 61,
    assignedReviewer: 'Rajiv Mehta (Senior Procurement Auditor)',
    reviewerNotes: 'Quality certificate submitted is expired. Request updated ISO 9001:2015 recertification document.',
    documents: [
      {
        id: 'doc-incorp',
        name: 'Certificate of Incorporation',
        category: 'legal',
        isRequired: true,
        status: 'verified',
        fileName: 'BAE_Incorporation.pdf',
        fileSize: '1.6 MB',
        uploadedAt: '2026-09-25T11:10:00Z',
        verifiedAt: '2026-09-28T10:00:00Z',
        verifiedBy: 'Rajiv Mehta',
      },
      {
        id: 'doc-gst',
        name: 'GST / Tax Registration Certificate',
        category: 'tax',
        isRequired: true,
        status: 'verified',
        fileName: 'GST_BAE_06AAACB.pdf',
        fileSize: '650 KB',
        uploadedAt: '2026-09-25T11:12:00Z',
        verifiedAt: '2026-09-28T10:15:00Z',
        verifiedBy: 'Rajiv Mehta',
      },
      {
        id: 'doc-iso9001',
        name: 'ISO 9001:2015 Quality Management Certificate',
        category: 'quality',
        isRequired: true,
        status: 'rejected',
        fileName: 'ISO9001_BAE_Old.pdf',
        fileSize: '1.9 MB',
        uploadedAt: '2026-09-25T11:15:00Z',
        notes: 'Certificate expired in August 2026. Needs current valid certificate.',
      },
      {
        id: 'doc-financial',
        name: 'Audited Financial Statements (Last 2 Fiscal Years)',
        category: 'financial',
        isRequired: true,
        status: 'verified',
        fileName: 'Audit_FY24_FY25_BAE.pdf',
        fileSize: '5.1 MB',
        uploadedAt: '2026-09-25T11:20:00Z',
        verifiedAt: '2026-10-01T14:00:00Z',
        verifiedBy: 'Rajiv Mehta',
      },
      {
        id: 'doc-nda',
        name: 'Anti-Bribery & Supplier Code of Conduct Agreement',
        category: 'compliance',
        isRequired: true,
        status: 'verified',
        fileName: 'Signed_Compliance_BAE.pdf',
        fileSize: '820 KB',
        uploadedAt: '2026-09-25T11:25:00Z',
        verifiedAt: '2026-09-28T10:30:00Z',
        verifiedBy: 'Rajiv Mehta',
      },
    ],
    statusHistory: [
      {
        id: 'sh-004',
        fromStatus: 'Initiated',
        toStatus: 'Pending Review',
        changedBy: 'Vendor Portal (Self-Service)',
        changedAt: '2026-09-25T11:30:00Z',
        reason: 'Initial packet submitted.',
      },
      {
        id: 'sh-005',
        fromStatus: 'Pending Review',
        toStatus: 'Under Audit',
        changedBy: 'Rajiv Mehta',
        changedAt: '2026-09-28T09:45:00Z',
        reason: 'Assigned to reviewer for verification.',
      },
      {
        id: 'sh-006',
        fromStatus: 'Under Audit',
        toStatus: 'Changes Requested',
        changedBy: 'Rajiv Mehta',
        changedAt: '2026-10-08T15:00:00Z',
        reason: 'Expired ISO quality certification requires replacement.',
        comments: 'Vendor contacted via portal. Resubmission deadline: Oct 20.',
      },
    ],
  },
  {
    id: 'onb-004',
    name: 'Zenith Precision Plastics',
    legalName: 'Zenith Engineering & Poly-Components Pvt. Ltd.',
    code: 'ONB-ZPP-004',
    country: 'India',
    location: 'Noida, Uttar Pradesh, India',
    taxId: 'GSTIN09AABCZ1122N1Z4',
    materialsSupplied: ['Molded Armrest Caps', 'Nylon Bushings'],
    primaryContact: {
      name: 'Pooja Verma',
      title: 'Commercial Manager',
      email: 'pooja.verma@zenithplastics.in',
      phone: '+91 98100 88990',
    },
    operationalDetails: {
      monthlyCapacityUnits: 150000,
      quotedLeadTimeDays: 6,
      paymentTerms: 'Net 30 Days',
      currency: 'INR',
    },
    onboardingStage: 'approved',
    submittedAt: '2026-09-10T09:00:00Z',
    updatedAt: '2026-09-28T16:00:00Z',
    initialQualificationScore: 89,
    assignedReviewer: 'Priya Sharma',
    reviewerNotes: 'Full audit passed with zero non-conformances. Onboarded to active ERP vendor directory.',
    documents: [
      {
        id: 'doc-incorp',
        name: 'Certificate of Incorporation',
        category: 'legal',
        isRequired: true,
        status: 'verified',
        fileName: 'COI_Zenith.pdf',
        fileSize: '1.1 MB',
        uploadedAt: '2026-09-10T09:10:00Z',
        verifiedAt: '2026-09-15T11:00:00Z',
        verifiedBy: 'Priya Sharma',
      },
      {
        id: 'doc-gst',
        name: 'GST / Tax Registration Certificate',
        category: 'tax',
        isRequired: true,
        status: 'verified',
        fileName: 'GST_Zenith_09AABCZ.pdf',
        fileSize: '740 KB',
        uploadedAt: '2026-09-10T09:12:00Z',
        verifiedAt: '2026-09-15T11:15:00Z',
        verifiedBy: 'Priya Sharma',
      },
      {
        id: 'doc-iso9001',
        name: 'ISO 9001:2015 Quality Management Certificate',
        category: 'quality',
        isRequired: true,
        status: 'verified',
        fileName: 'ISO9001_Zenith_Valid.pdf',
        fileSize: '2.4 MB',
        uploadedAt: '2026-09-10T09:15:00Z',
        verifiedAt: '2026-09-16T14:00:00Z',
        verifiedBy: 'Priya Sharma',
      },
      {
        id: 'doc-financial',
        name: 'Audited Financial Statements (Last 2 Fiscal Years)',
        category: 'financial',
        isRequired: true,
        status: 'verified',
        fileName: 'Zenith_Fin_FY24_25.pdf',
        fileSize: '3.9 MB',
        uploadedAt: '2026-09-10T09:20:00Z',
        verifiedAt: '2026-09-20T10:00:00Z',
        verifiedBy: 'Priya Sharma',
      },
      {
        id: 'doc-nda',
        name: 'Anti-Bribery & Supplier Code of Conduct Agreement',
        category: 'compliance',
        isRequired: true,
        status: 'verified',
        fileName: 'Zenith_CodeOfConduct.pdf',
        fileSize: '910 KB',
        uploadedAt: '2026-09-10T09:25:00Z',
        verifiedAt: '2026-09-15T12:00:00Z',
        verifiedBy: 'Priya Sharma',
      },
    ],
    statusHistory: [
      {
        id: 'sh-007',
        fromStatus: 'Initiated',
        toStatus: 'Pending Review',
        changedBy: 'Vendor Portal (Self-Service)',
        changedAt: '2026-09-10T09:30:00Z',
        reason: 'Application submitted.',
      },
      {
        id: 'sh-008',
        fromStatus: 'Pending Review',
        toStatus: 'Under Audit',
        changedBy: 'Priya Sharma',
        changedAt: '2026-09-15T10:00:00Z',
        reason: 'Document validation started.',
      },
      {
        id: 'sh-009',
        fromStatus: 'Under Audit',
        toStatus: 'Approved',
        changedBy: 'Priya Sharma',
        changedAt: '2026-09-28T16:00:00Z',
        reason: 'Complete compliance requirements verified. Vendor admitted to ERP registry.',
      },
    ],
  },
];

/**
 * Fetch list of onboarding suppliers with optional stage filter
 */
export function getOnboardingSuppliers(stage?: OnboardingStage | 'all'): OnboardingSupplierRecord[] {
  if (!stage || stage === 'all') return [...ONBOARDING_SUPPLIERS_STORE];
  return ONBOARDING_SUPPLIERS_STORE.filter(s => s.onboardingStage === stage);
}

/**
 * Fetch onboarding supplier by ID
 */
export function getOnboardingSupplierById(id: string): OnboardingSupplierRecord | null {
  return ONBOARDING_SUPPLIERS_STORE.find(s => s.id === id) || null;
}

/**
 * Create a new supplier onboarding application (from Wizard)
 */
export function createOnboardingSupplier(input: OnboardingFormInput): OnboardingSupplierRecord {
  const newId = `onb-${String(ONBOARDING_SUPPLIERS_STORE.length + 1).padStart(3, '0')}`;
  const code = `ONB-${input.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()}-${String(ONBOARDING_SUPPLIERS_STORE.length + 1).padStart(3, '0')}`;

  const docs: OnboardingDocument[] = STANDARD_ONBOARDING_DOCUMENTS.map(tpl => {
    const isUploaded = input.documentIdsUploaded.includes(tpl.id);
    return {
      ...tpl,
      status: isUploaded ? 'uploaded' : 'missing',
      fileName: isUploaded ? `${tpl.id}_${input.name.replace(/\s+/g, '_')}.pdf` : undefined,
      fileSize: isUploaded ? '1.8 MB' : undefined,
      uploadedAt: isUploaded ? new Date().toISOString() : undefined,
    };
  });

  // Calculate preliminary qualification score based on inputs
  const uploadedCount = docs.filter(d => d.status === 'uploaded').length;
  const initialQualificationScore = Math.min(95, Math.max(30, 40 + (uploadedCount * 8)));

  const now = new Date().toISOString();
  const newRecord: OnboardingSupplierRecord = {
    id: newId,
    name: input.name,
    legalName: input.legalName,
    code,
    country: input.country,
    location: input.location,
    taxId: input.taxId,
    materialsSupplied: input.materialsSupplied,
    primaryContact: {
      name: input.contactName,
      email: input.contactEmail,
      phone: input.contactPhone,
      title: input.contactTitle,
    },
    operationalDetails: {
      monthlyCapacityUnits: input.monthlyCapacityUnits,
      quotedLeadTimeDays: input.quotedLeadTimeDays,
      paymentTerms: input.paymentTerms,
      currency: input.currency,
    },
    onboardingStage: 'pending_review',
    documents: docs,
    statusHistory: [
      {
        id: `sh-${Date.now()}`,
        fromStatus: 'Initiated',
        toStatus: 'Pending Review',
        changedBy: 'Procurement Onboarding Wizard',
        changedAt: now,
        reason: 'New supplier qualification packet submitted for review.',
        comments: input.initialNotes,
      },
    ],
    submittedAt: now,
    updatedAt: now,
    initialQualificationScore,
    assignedReviewer: 'Unassigned',
  };

  ONBOARDING_SUPPLIERS_STORE = [newRecord, ...ONBOARDING_SUPPLIERS_STORE];
  return newRecord;
}

/**
 * Process a review decision on an onboarding supplier
 */
export function reviewOnboardingSupplier(payload: ReviewDecisionPayload): OnboardingSupplierRecord | null {
  const index = ONBOARDING_SUPPLIERS_STORE.findIndex(s => s.id === payload.supplierId);
  if (index === -1) return null;

  const current = ONBOARDING_SUPPLIERS_STORE[index];
  const oldStage = current.onboardingStage;

  let newStage: OnboardingStage = 'under_audit';
  if (payload.decision === 'approve') newStage = 'approved';
  if (payload.decision === 'reject') newStage = 'rejected';
  if (payload.decision === 'request_changes') newStage = 'changes_requested';

  // Apply document status updates if provided
  let updatedDocs = [...current.documents];
  if (payload.documentStatusUpdates && payload.documentStatusUpdates.length > 0) {
    const updateMap = new Map(payload.documentStatusUpdates.map(u => [u.docId, u]));
    updatedDocs = updatedDocs.map(doc => {
      const update = updateMap.get(doc.id);
      if (update) {
        return {
          ...doc,
          status: update.status,
          notes: update.notes || doc.notes,
          verifiedAt: update.status === 'verified' ? new Date().toISOString() : doc.verifiedAt,
          verifiedBy: update.status === 'verified' ? payload.reviewerName : doc.verifiedBy,
        };
      }
      return doc;
    });
  }

  const now = new Date().toISOString();
  const historyEntry: SupplierStatusHistoryEntry = {
    id: `sh-${Date.now()}`,
    fromStatus: oldStage.replace('_', ' ').toUpperCase(),
    toStatus: newStage.replace('_', ' ').toUpperCase(),
    changedBy: payload.reviewerName,
    changedAt: now,
    reason: `Reviewer evaluated application: ${payload.decision.toUpperCase()}`,
    comments: payload.comments,
  };

  const updatedRecord: OnboardingSupplierRecord = {
    ...current,
    onboardingStage: newStage,
    documents: updatedDocs,
    statusHistory: [historyEntry, ...current.statusHistory],
    updatedAt: now,
    assignedReviewer: payload.reviewerName,
    reviewerNotes: payload.comments,
  };

  ONBOARDING_SUPPLIERS_STORE[index] = updatedRecord;
  return updatedRecord;
}
