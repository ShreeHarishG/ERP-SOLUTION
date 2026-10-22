// =============================================================================
// Onchain Insights — Disruption Signal & Shipment Monitoring Mock Store
// Realistic synthetic disruption events, shipment transit telemetry, and timeline audit logs.
// =============================================================================

import type {
  DisruptionSignalDetail,
  ShipmentTransitRecord,
  DisruptionFilterParams,
  ShipmentFilterParams,
  DisruptionStatusUpdatePayload,
} from '@/types/onchain-insights';

// --- Stable Mock Shipments ---
export const MOCK_SHIPMENT_RECORDS: ShipmentTransitRecord[] = [
  {
    id: 'shp-001',
    shipmentNumber: 'SHP-2026-0847',
    carrier: 'Maersk Line Maritime',
    origin: 'Yangon Port (MITT)',
    originCountry: 'Myanmar',
    destination: 'Chennai Sea Port, India',
    supplierId: 'sup-001',
    supplierName: 'Global Timber Exports',
    materialName: 'Teak Wood Planks (A-Grade)',
    sku: 'RM-TEAK-001',
    quantityUnits: 450,
    valueINR: 6525000,
    status: 'delayed',
    departureDate: '2026-10-04',
    expectedDeliveryDate: '2026-10-14',
    revisedDeliveryDate: '2026-10-24',
    delayDays: 10,
    transitProgressPercent: 55,
    relatedDisruptionId: 'dis-001',
    relatedDisruptionTitle: 'Cyclone Warning — Bay of Bengal Shipping Routes',
    riskSeverity: 'critical',
    trackingMilestones: [
      { location: 'Yangon Berth MITT-02', timestamp: '2026-10-04 11:00', status: 'Departed Port', passed: true },
      { location: 'Andaman Sea Staging Point', timestamp: '2026-10-08 16:30', status: 'Speed Reduced (Sea Swell)', passed: true },
      { location: 'Bay of Bengal Deep Water Basin', timestamp: '2026-10-11 09:15', status: 'Rerouted around Cyclone Zone', passed: false },
      { location: 'Chennai Outer Anchorage', timestamp: '2026-10-22 08:00', status: 'Scheduled Customs Inward', passed: false },
    ],
  },
  {
    id: 'shp-002',
    shipmentNumber: 'SHP-2026-0851',
    carrier: 'CMA CGM Express',
    origin: 'Yangon Port (MITT)',
    originCountry: 'Myanmar',
    destination: 'JNPT Port Mumbai, India',
    supplierId: 'sup-001',
    supplierName: 'Global Timber Exports',
    materialName: 'Hardwood Boards (Kiln-Dried)',
    sku: 'RM-TEAK-002',
    quantityUnits: 320,
    valueINR: 4160000,
    status: 'delayed',
    departureDate: '2026-10-06',
    expectedDeliveryDate: '2026-10-17',
    revisedDeliveryDate: '2026-10-25',
    delayDays: 8,
    transitProgressPercent: 40,
    relatedDisruptionId: 'dis-001',
    relatedDisruptionTitle: 'Cyclone Warning — Bay of Bengal Shipping Routes',
    riskSeverity: 'critical',
    trackingMilestones: [
      { location: 'Yangon Wharf', timestamp: '2026-10-06 14:00', status: 'Container Stowed', passed: true },
      { location: 'Strait of Malacca Crossing', timestamp: '2026-10-10 18:00', status: 'Vessel in Transit', passed: true },
      { location: 'Sri Lanka Deep Sea Channel', timestamp: '2026-10-16 12:00', status: 'Estimated Reroute Passage', passed: false },
      { location: 'JNPT Berth 3', timestamp: '2026-10-25 04:00', status: 'Inbound Docking', passed: false },
    ],
  },
  {
    id: 'shp-003',
    shipmentNumber: 'SHP-2026-0842',
    carrier: 'COSCO Shipping Intermodal',
    origin: 'Shenzhen Shekou Port',
    originCountry: 'China',
    destination: 'JNPT Port Mumbai, India',
    supplierId: 'sup-007',
    supplierName: 'Precision Fixings Corp.',
    materialName: 'Precision Bearings 6204-2RS',
    sku: 'RM-BEAR-003',
    quantityUnits: 3500,
    valueINR: 770000,
    status: 'held_customs',
    departureDate: '2026-09-28',
    expectedDeliveryDate: '2026-10-10',
    revisedDeliveryDate: '2026-10-15',
    delayDays: 5,
    transitProgressPercent: 88,
    relatedDisruptionId: 'dis-002',
    relatedDisruptionTitle: 'Port Congestion — JNPT Mumbai',
    riskSeverity: 'high',
    trackingMilestones: [
      { location: 'Shenzhen Shekou Port', timestamp: '2026-09-28 08:30', status: 'Vessel Departed', passed: true },
      { location: 'Singapore Transshipment Hub', timestamp: '2026-10-02 21:00', status: 'Transshipment Feeder Loaded', passed: true },
      { location: 'JNPT Mumbai Anchorage', timestamp: '2026-10-10 10:00', status: 'Vessel Berthed / Dwell Backlog', passed: true },
      { location: 'Customs Clearance Gate 4', timestamp: '2026-10-15 14:00', status: 'Awaiting Bill of Entry Release', passed: false },
    ],
  },
  {
    id: 'shp-004',
    shipmentNumber: 'SHP-2026-0849',
    carrier: 'Concor Dedicated Rail Freight',
    origin: 'Jamshedpur Rail Siding',
    originCountry: 'India',
    destination: 'Chakan Assembly Hub, Pune',
    supplierId: 'sup-004',
    supplierName: 'SteelCraft India Pvt.',
    materialName: 'Heavy Structural Steel Frames',
    sku: 'RM-STEEL-002',
    quantityUnits: 80,
    valueINR: 1920000,
    status: 'delayed',
    departureDate: '2026-10-11',
    expectedDeliveryDate: '2026-10-14',
    revisedDeliveryDate: '2026-10-19',
    delayDays: 5,
    transitProgressPercent: 20,
    relatedDisruptionId: 'dis-003',
    relatedDisruptionTitle: 'Supplier Production Halt — SteelCraft India',
    riskSeverity: 'high',
    trackingMilestones: [
      { location: 'SteelCraft Jamshedpur Works', timestamp: '2026-10-11 15:00', status: 'Batch Partial Release', passed: true },
      { location: 'Tatanagar Rail Freight Yard', timestamp: '2026-10-13 09:00', status: 'Wagon Assignment Awaiting Load', passed: false },
      { location: 'Nagpur Junction Transit Hub', timestamp: '2026-10-16 18:00', status: 'Scheduled Interchange', passed: false },
      { location: 'Pune Chakan Inland Depot', timestamp: '2026-10-19 11:00', status: 'Final Staging Unload', passed: false },
    ],
  },
  {
    id: 'shp-005',
    shipmentNumber: 'SHP-2026-0850',
    carrier: 'VRL Logistics Surface Fleet',
    origin: 'Chennai Ambattur Industrial Area',
    originCountry: 'India',
    destination: 'Pune Central Distribution Hub',
    supplierId: 'sup-005',
    supplierName: 'Varnish Works International',
    materialName: 'Wood Varnish (Gloss Satin 20L)',
    sku: 'RM-VARN-004',
    quantityUnits: 120,
    valueINR: 540000,
    status: 'delayed',
    departureDate: '2026-10-10',
    expectedDeliveryDate: '2026-10-13',
    revisedDeliveryDate: '2026-10-16',
    delayDays: 3,
    transitProgressPercent: 45,
    relatedDisruptionId: 'dis-004',
    relatedDisruptionTitle: 'Quality Deviation — Varnish Batch VW-2026-Q3',
    riskSeverity: 'medium',
    trackingMilestones: [
      { location: 'Chennai Ambattur Warehouse', timestamp: '2026-10-10 17:00', status: 'Dispatched on Truck TN-02-AK-9921', passed: true },
      { location: 'Hosur QC Inspection Checkpoint', timestamp: '2026-10-11 14:00', status: 'Quarantine Sample Tagged', passed: true },
      { location: 'Belagavi Transit Hub', timestamp: '2026-10-14 10:00', status: 'Holding pending QC Release', passed: false },
      { location: 'Pune Central Distribution Hub', timestamp: '2026-10-16 16:00', status: 'Scheduled Bay Receipt', passed: false },
    ],
  },
  {
    id: 'shp-006',
    shipmentNumber: 'SHP-2026-0852',
    carrier: 'TCI Freight Logistics',
    origin: 'Pune Hadapsar Industrial Zone',
    originCountry: 'India',
    destination: 'Bhiwandi Regional Warehouse',
    supplierId: 'sup-006',
    supplierName: 'FoamComfort Industries',
    materialName: 'High-Density Cushion Foam 40D',
    sku: 'RM-FOAM-005',
    quantityUnits: 650,
    valueINR: 845000,
    status: 'delayed',
    departureDate: '2026-10-11',
    expectedDeliveryDate: '2026-10-13',
    revisedDeliveryDate: '2026-10-16',
    delayDays: 3,
    transitProgressPercent: 30,
    relatedDisruptionId: 'dis-006',
    relatedDisruptionTitle: 'Logistics Partner Strike — Regional Trucking',
    riskSeverity: 'medium',
    trackingMilestones: [
      { location: 'Pune Hadapsar Depot', timestamp: '2026-10-11 19:30', status: 'Truck Loaded (MH-12-PQ-4412)', passed: true },
      { location: 'Talegaon Toll Plaza Expressway', timestamp: '2026-10-12 04:00', status: 'Idled due to Trucking Union Action', passed: false },
      { location: 'Bhiwandi Regional Warehouse', timestamp: '2026-10-16 12:00', status: 'Estimated Delivery', passed: false },
    ],
  },
  {
    id: 'shp-007',
    shipmentNumber: 'SHP-2026-0853',
    carrier: 'BlueDart Air Apex Freight',
    origin: 'Ahmedabad GIDC Hub',
    originCountry: 'India',
    destination: 'Bengaluru Fulfillment Center',
    supplierId: 'sup-002',
    supplierName: 'Apex Hardware Co.',
    materialName: 'Soft-Close Telescopic Drawer Slides',
    sku: 'RM-HARD-002',
    quantityUnits: 1200,
    valueINR: 384000,
    status: 'on_schedule',
    departureDate: '2026-10-11',
    expectedDeliveryDate: '2026-10-13',
    revisedDeliveryDate: '2026-10-13',
    delayDays: 0,
    transitProgressPercent: 75,
    riskSeverity: 'low',
    trackingMilestones: [
      { location: 'Ahmedabad GIDC Staging', timestamp: '2026-10-11 10:00', status: 'Consignment Picked Up', passed: true },
      { location: 'Ahmedabad Airport Air Cargo Gate', timestamp: '2026-10-11 18:30', status: 'Air Waybill Cleared', passed: true },
      { location: 'Kempegowda Int. Cargo Complex', timestamp: '2026-10-12 06:15', status: 'Landed / In Transit to Hub', passed: true },
      { location: 'Bengaluru Fulfillment Center', timestamp: '2026-10-13 14:00', status: 'Out for Delivery', passed: false },
    ],
  },
  {
    id: 'shp-008',
    shipmentNumber: 'SHP-2026-0855',
    carrier: 'Gati-KWE Surface Express',
    origin: 'Surat Textile Market Zone',
    originCountry: 'India',
    destination: 'Pune Central Distribution Hub',
    supplierId: 'sup-003',
    supplierName: 'Rajshree Fabrics Ltd.',
    materialName: 'Jacquard Upholstery Fabric (Sapphire)',
    sku: 'RM-FAB-001',
    quantityUnits: 900,
    valueINR: 630000,
    status: 'on_schedule',
    departureDate: '2026-10-10',
    expectedDeliveryDate: '2026-10-13',
    revisedDeliveryDate: '2026-10-13',
    delayDays: 0,
    transitProgressPercent: 85,
    riskSeverity: 'low',
    trackingMilestones: [
      { location: 'Surat Ring Road Warehouse', timestamp: '2026-10-10 16:00', status: 'Bales Dispatched', passed: true },
      { location: 'Navsari Highway Cross', timestamp: '2026-10-11 02:00', status: 'In Transit', passed: true },
      { location: 'Thane Ghodbunder Checkpost', timestamp: '2026-10-11 20:00', status: 'Transit Cleared', passed: true },
      { location: 'Pune Central Distribution Hub', timestamp: '2026-10-13 11:00', status: 'Inbound Gate Inspection', passed: false },
    ],
  },
  {
    id: 'shp-009',
    shipmentNumber: 'SHP-2026-0858',
    carrier: 'SafeExpress Container Fleet',
    origin: 'Peenya Industrial Area, Bengaluru',
    originCountry: 'India',
    destination: 'Pune Central Distribution Hub',
    supplierId: 'sup-008',
    supplierName: 'EcoPanels Green Materials',
    materialName: 'Pre-Laminated Particle Board 18mm',
    sku: 'RM-PANEL-001',
    quantityUnits: 500,
    valueINR: 1100000,
    status: 'on_schedule',
    departureDate: '2026-10-11',
    expectedDeliveryDate: '2026-10-14',
    revisedDeliveryDate: '2026-10-14',
    delayDays: 0,
    transitProgressPercent: 60,
    riskSeverity: 'low',
    trackingMilestones: [
      { location: 'Peenya Plant Bengaluru', timestamp: '2026-10-11 12:00', status: 'Loaded on Container MH-46-H-1102', passed: true },
      { location: 'Tumakuru Highway Corridor', timestamp: '2026-10-11 22:00', status: 'En Route', passed: true },
      { location: 'Kolhapur Transit Checkpoint', timestamp: '2026-10-12 18:00', status: 'Corridor Progress', passed: false },
      { location: 'Pune Central Distribution Hub', timestamp: '2026-10-14 10:00', status: 'Unloading Staging', passed: false },
    ],
  },
  {
    id: 'shp-010',
    shipmentNumber: 'SHP-2026-0860',
    carrier: 'Kuehne+Nagel Intermodal',
    origin: 'Ningbo-Zhoushan Port',
    originCountry: 'China',
    destination: 'Chennai Sea Port, India',
    supplierId: 'sup-007',
    supplierName: 'Precision Fixings Corp.',
    materialName: 'Heavy Duty Caster Wheels 100mm',
    sku: 'RM-CASTER-004',
    quantityUnits: 1800,
    valueINR: 648000,
    status: 'delayed',
    departureDate: '2026-09-25',
    expectedDeliveryDate: '2026-10-12',
    revisedDeliveryDate: '2026-10-18',
    delayDays: 6,
    transitProgressPercent: 80,
    relatedDisruptionId: 'dis-007',
    relatedDisruptionTitle: 'Typhoon Feeder Backlog — East Asia Hubs',
    riskSeverity: 'medium',
    trackingMilestones: [
      { location: 'Ningbo Port Berth 8', timestamp: '2026-09-25 14:00', status: 'Vessel Loaded', passed: true },
      { location: 'Kaohsiung Harbor Berth', timestamp: '2026-10-01 19:00', status: 'Held due to Typhoon Storm Path', passed: true },
      { location: 'Bay of Bengal Open Channel', timestamp: '2026-10-10 11:00', status: 'Steaming at 14 Knots', passed: true },
      { location: 'Chennai Sea Port', timestamp: '2026-10-18 16:00', status: 'Scheduled Inward Berth', passed: false },
    ],
  },
  {
    id: 'shp-011',
    shipmentNumber: 'SHP-2026-0864',
    carrier: 'Delhivery Surface Network',
    origin: 'Surat Industrial Estate',
    originCountry: 'India',
    destination: 'Chennai Staging Facility',
    supplierId: 'sup-003',
    supplierName: 'Rajshree Fabrics Ltd.',
    materialName: 'Velvet Lining Underlay',
    sku: 'RM-FAB-002',
    quantityUnits: 400,
    valueINR: 280000,
    status: 'delivered',
    departureDate: '2026-10-05',
    expectedDeliveryDate: '2026-10-09',
    revisedDeliveryDate: '2026-10-09',
    delayDays: 0,
    transitProgressPercent: 100,
    riskSeverity: 'low',
    trackingMilestones: [
      { location: 'Surat Hub', timestamp: '2026-10-05 11:00', status: 'Dispatched', passed: true },
      { location: 'Hyderabad Gateway Hub', timestamp: '2026-10-07 04:00', status: 'Transit Sorting Complete', passed: true },
      { location: 'Chennai Staging Facility', timestamp: '2026-10-09 15:30', status: 'Delivered & Accepted into ERP Ledger', passed: true },
    ],
  },
  {
    id: 'shp-012',
    shipmentNumber: 'SHP-2026-0868',
    carrier: 'Rivigo Relay Express',
    origin: 'Vadodara Hardware Park',
    originCountry: 'India',
    destination: 'Pune Central Distribution Hub',
    supplierId: 'sup-002',
    supplierName: 'Apex Hardware Co.',
    materialName: 'Hydraulic Cabinet Soft Hinges',
    sku: 'RM-HARD-001',
    quantityUnits: 2500,
    valueINR: 425000,
    status: 'on_schedule',
    departureDate: '2026-10-11',
    expectedDeliveryDate: '2026-10-13',
    revisedDeliveryDate: '2026-10-13',
    delayDays: 0,
    transitProgressPercent: 70,
    riskSeverity: 'low',
    trackingMilestones: [
      { location: 'Vadodara Relay Pitstop', timestamp: '2026-10-11 14:00', status: 'Driver Handover Relay', passed: true },
      { location: 'Surat Relay Hub', timestamp: '2026-10-11 23:00', status: 'En Route', passed: true },
      { location: 'Pune Central Distribution Hub', timestamp: '2026-10-13 10:00', status: 'Scheduled Inward', passed: false },
    ],
  },
];

// --- 16 Rich Synthetic Disruption Signals ---
export const MOCK_DISRUPTIONS_CATALOG: DisruptionSignalDetail[] = [
  {
    id: 'dis-001',
    title: 'Cyclone Warning — Bay of Bengal Shipping Routes',
    description: 'Tropical cyclone forming near Andaman Sea. Expected to impact Chennai-Myanmar shipping lanes within 72 hours. Port authorities have restricted deep-draft container vessels.',
    category: 'weather',
    severity: 'critical',
    status: 'active',
    source: 'weather_service',
    affectedSuppliers: ['sup-001'],
    affectedShipments: ['SHP-2026-0847', 'SHP-2026-0851'],
    affectedMaterials: ['Teak Wood Planks (A-Grade)', 'Hardwood Boards (Kiln-Dried)'],
    affectedOrders: ['SO-2026-0112', 'SO-2026-0115'],
    detectedAt: '2026-10-11T14:30:00Z',
    updatedAt: '2026-10-12T04:15:00Z',
    estimatedImpact: '7–12 day delay on 2 active maritime consignments',
    region: 'Bay of Bengal & Chennai Coastal Corridor',
    recommendedMitigation: 'Activate Kerala domestic wood reserves and temporarily reroute upcoming shipments through Haldia Port feeder.',
    timeline: [
      { id: 't-101', timestamp: '2026-10-11T14:30:00Z', status: 'active', actor: 'Automated IMD Weather Radar Hook', action: 'Signal Ingested', notes: 'Severe cyclonic storm alert triggered for Lat 12.4°N, Long 86.1°E.' },
      { id: 't-102', timestamp: '2026-10-11T16:00:00Z', status: 'acknowledged', actor: 'Priya Sharma (Procurement Lead)', action: 'Signal Acknowledged', notes: 'Notified inbound logistics team to review vessel GPS tracks for SHP-2026-0847.' },
      { id: 't-103', timestamp: '2026-10-12T02:00:00Z', status: 'active', actor: 'Maersk Operations Bulletin', action: 'Reroute Alert', notes: 'Captain advised slowing to 8 knots and tracking 180 nautical miles south of cyclone perimeter.' },
    ],
    affectedOrderDetails: [
      { orderId: 'SO-2026-0112', customerName: 'Oberoi Luxury Suites', value: 3450000, dueDate: '2026-10-20', status: 'at_risk' },
      { orderId: 'SO-2026-0115', customerName: 'Taj Vivanta Interior Fitouts', value: 2800000, dueDate: '2026-10-24', status: 'at_risk' },
    ],
  },
  {
    id: 'dis-002',
    title: 'Port Congestion — JNPT Mumbai Gate In Backlog',
    description: 'Container backlog at Jawaharlal Nehru Port Trust exceeding 48-hour truck dwell times. Customs EDI server maintenance has created clearance backlogs affecting import components.',
    category: 'port_congestion',
    severity: 'high',
    status: 'active',
    source: 'port_authority',
    affectedSuppliers: ['sup-007', 'sup-004'],
    affectedShipments: ['SHP-2026-0842'],
    affectedMaterials: ['Precision Bearings 6204-2RS', 'Heavy Structural Steel Frames'],
    affectedOrders: ['SO-2026-0108', 'SO-2026-0110'],
    detectedAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-12T05:30:00Z',
    estimatedImpact: '3–5 day dwell clearance delay at container terminal',
    region: 'JNPT Nhava Sheva, Navi Mumbai, India',
    recommendedMitigation: 'Request priority customs scanning escort and authorize Direct Port Delivery (DPD) transport pass.',
    timeline: [
      { id: 't-201', timestamp: '2026-10-10T08:00:00Z', status: 'active', actor: 'JNPT Port Operations API', action: 'Dwell Warning', notes: 'Average gate-in dwell increased from 14 hours to 52 hours.' },
      { id: 't-202', timestamp: '2026-10-10T11:45:00Z', status: 'acknowledged', actor: 'Vikram Joshi (Logistics Executive)', action: 'Flagged for expediting', notes: 'Consignment SHP-2026-0842 flagged as critical for assembly plant schedule.' },
      { id: 't-203', timestamp: '2026-10-11T14:20:00Z', status: 'investigating', actor: 'Clearing Agent (M/s Parekh Marine)', action: 'Customs Interfaced', notes: 'Customs duty paid; waiting physical inspection queue at CFS-2.' },
    ],
    affectedOrderDetails: [
      { orderId: 'SO-2026-0108', customerName: 'Godrej Ergonomic Systems', value: 1650000, dueDate: '2026-10-18', status: 'delayed' },
    ],
  },
  {
    id: 'dis-003',
    title: 'Supplier Production Halt — SteelCraft Blast Furnace 2',
    description: 'SteelCraft India reports temporary shutdown of blast furnace line 2 for refractory brick maintenance. Secondary rolling mill output reduced by 40%.',
    category: 'supplier_incident',
    severity: 'high',
    status: 'investigating',
    source: 'supplier_report',
    affectedSuppliers: ['sup-004'],
    affectedShipments: ['SHP-2026-0849'],
    affectedMaterials: ['Heavy Structural Steel Frames', 'Metal Brackets'],
    affectedOrders: ['SO-2026-0110', 'SO-2026-0113'],
    detectedAt: '2026-10-09T11:20:00Z',
    updatedAt: '2026-10-11T16:30:00Z',
    estimatedImpact: '5 business day production delay on pending structural steel fabrications',
    region: 'Jamshedpur Works, Jharkhand, India',
    recommendedMitigation: 'Offload 25% of structural frame volume to secondary vendor SteelTech Kolkata line.',
    timeline: [
      { id: 't-301', timestamp: '2026-10-09T11:20:00Z', status: 'active', actor: 'SteelCraft Dispatch Desk', action: 'Incident Notice', notes: 'Furnace temperature sensor triggered shutdown sequence.' },
      { id: 't-302', timestamp: '2026-10-09T15:00:00Z', status: 'acknowledged', actor: 'Arun Nair (Procurement Director)', action: 'Supplier Review Initiated', notes: 'Requested revised production schedule for SO-2026-0110 batch.' },
      { id: 't-303', timestamp: '2026-10-10T10:00:00Z', status: 'investigating', actor: 'Vendor Audit Team', action: 'Production Audit', notes: 'Expected restart on Oct 16. Existing finished goods inventory released partially.' },
    ],
    affectedOrderDetails: [
      { orderId: 'SO-2026-0110', customerName: 'DLF CyberCity Fitments', value: 2400000, dueDate: '2026-10-22', status: 'at_risk' },
    ],
  },
  {
    id: 'dis-004',
    title: 'Quality Deviation — Varnish Batch VW-2026-Q3 Inspection',
    description: 'Internal QC spectrophotometer test flagged 8% color delta on wood varnish batch VW-2026-Q3. Gloss rating within spec but requires tint recalibration before application.',
    category: 'quality',
    severity: 'medium',
    status: 'investigating',
    source: 'internal',
    affectedSuppliers: ['sup-005'],
    affectedShipments: ['SHP-2026-0850'],
    affectedMaterials: ['Wood Varnish (Gloss Satin 20L)'],
    affectedOrders: ['SO-2026-0114'],
    detectedAt: '2026-10-11T09:45:00Z',
    updatedAt: '2026-10-11T18:00:00Z',
    estimatedImpact: '2–3 day re-inspection and blending recalibration hold',
    region: 'Chennai & Pune Hub Quality Labs',
    recommendedMitigation: 'Isolate affected drum batch in Quarantine Bay 3; use backup tint additive compound.',
    timeline: [
      { id: 't-401', timestamp: '2026-10-11T09:45:00Z', status: 'active', actor: 'QC Chemist (R. Iyer)', action: 'QC Quarantine Flag', notes: 'Delta-E color variance measured 2.8 vs threshold 1.5.' },
      { id: 't-402', timestamp: '2026-10-11T12:00:00Z', status: 'investigating', actor: 'Quality Lead (Deepak Verma)', action: 'Corrective Action Plan', notes: 'Vendor technical representative dispatched with stabilizer pigment.' },
    ],
    affectedOrderDetails: [
      { orderId: 'SO-2026-0114', customerName: 'Prestige Living Showroom', value: 890000, dueDate: '2026-10-19', status: 'monitoring' },
    ],
  },
  {
    id: 'dis-005',
    title: 'Export Regulatory Quota — Myanmar Ministry of Forestry',
    description: 'Myanmar customs notified revision of timber export quotas and forestry royalty verification for Q4 2026. Teak export clearances subject to additional documentation.',
    category: 'geopolitical',
    severity: 'medium',
    status: 'monitoring',
    source: 'news',
    affectedSuppliers: ['sup-001'],
    affectedShipments: [],
    affectedMaterials: ['Teak Wood Planks (A-Grade)', 'Hardwood Boards (Kiln-Dried)'],
    affectedOrders: [],
    detectedAt: '2026-10-08T06:00:00Z',
    updatedAt: '2026-10-10T12:00:00Z',
    estimatedImpact: 'Potential 15–20 day export permit lag on forward Q1 PO contracts',
    region: 'Yangon Ministry of Forestry, Myanmar',
    recommendedMitigation: 'Execute dual-sourcing pre-qualification for Indonesian plantation teak and FSC certified domestic timber.',
    timeline: [
      { id: 't-501', timestamp: '2026-10-08T06:00:00Z', status: 'active', actor: 'Trade Compliance Monitor', action: 'Regulatory Alert', notes: 'Official gazette notification 114/2026 published by Myanmar authorities.' },
      { id: 't-502', timestamp: '2026-10-09T14:00:00Z', status: 'monitoring', actor: 'Compliance Officer (K. Roy)', action: 'Supplier Inquiry', notes: 'Global Timber verified that existing export permits cover orders through December.' },
    ],
  },
  {
    id: 'dis-006',
    title: 'Logistics Partner Strike — Regional Trucking Association',
    description: 'Regional truckers union announced an 72-hour work stoppage across Maharashtra state highway routes impacting container haulage between Pune, Chakan, and Bhiwandi.',
    category: 'logistics',
    severity: 'high',
    status: 'active',
    source: 'news',
    affectedSuppliers: ['sup-006', 'sup-005'],
    affectedShipments: ['SHP-2026-0852', 'SHP-2026-0850'],
    affectedMaterials: ['High-Density Cushion Foam 40D', 'Wood Varnish (Gloss Satin 20L)'],
    affectedOrders: ['SO-2026-0114', 'SO-2026-0116'],
    detectedAt: '2026-10-11T16:00:00Z',
    updatedAt: '2026-10-12T03:00:00Z',
    estimatedImpact: '3-day road transit suspension on western highway freight corridor',
    region: 'Maharashtra State Transit Corridors (NH-48)',
    recommendedMitigation: 'Shift intra-hub shipments to rail parcel rakes or dispatch prior to midnight checkpost blockades.',
    timeline: [
      { id: 't-601', timestamp: '2026-10-11T16:00:00Z', status: 'active', actor: 'Highway Logistics Feed', action: 'Strike Call', notes: 'Transporters union confirmed strike start from Oct 13 06:00.' },
      { id: 't-602', timestamp: '2026-10-11T18:30:00Z', status: 'acknowledged', actor: 'Fleet Manager (P. Shinde)', action: 'Early Dispatch Triggered', notes: 'Advanced 4 truck dispatches ahead of highway blockage window.' },
    ],
  },
  {
    id: 'dis-007',
    title: 'Typhoon Feeder Backlog — East Asia Transshipment Corridors',
    description: 'Typhoon activity in Taiwan Strait caused temporary vessel idling and feeder schedule bunching at Kaohsiung and Ningbo transshipment terminals.',
    category: 'weather',
    severity: 'medium',
    status: 'monitoring',
    source: 'weather_service',
    affectedSuppliers: ['sup-007'],
    affectedShipments: ['SHP-2026-0860'],
    affectedMaterials: ['Heavy Duty Caster Wheels 100mm'],
    affectedOrders: ['SO-2026-0120'],
    detectedAt: '2026-10-07T12:00:00Z',
    updatedAt: '2026-10-10T18:00:00Z',
    estimatedImpact: '4–6 day delayed arrival at Chennai port',
    region: 'East China Sea & Taiwan Strait',
    recommendedMitigation: 'Maintain inventory buffers at Chennai warehouse; verify safety stock coverage.',
    timeline: [
      { id: 't-701', timestamp: '2026-10-07T12:00:00Z', status: 'active', actor: 'Maritime Weather Radar', action: 'Typhoon Advisory', notes: 'Tropical storm warning issued for East Asian maritime lanes.' },
      { id: 't-702', timestamp: '2026-10-09T09:00:00Z', status: 'monitoring', actor: 'Shipping Agent', action: 'Vessel Resume', notes: 'Vessel underway at reduced cruising speed.' },
    ],
  },
  {
    id: 'dis-008',
    title: 'Raw Material Cost Surge — Global Polyol & Isocyanate Prices',
    description: 'Crude chemical feedstocks for polyurethane foam rose by 14% over 30 days due to refinery maintenance in Middle East production centers.',
    category: 'financial',
    severity: 'medium',
    status: 'monitoring',
    source: 'news',
    affectedSuppliers: ['sup-006'],
    affectedShipments: [],
    affectedMaterials: ['High-Density Cushion Foam 40D'],
    affectedOrders: [],
    detectedAt: '2026-10-05T08:00:00Z',
    updatedAt: '2026-10-09T14:00:00Z',
    estimatedImpact: 'Potential 6–8% unit price renegotiation request for Q1 2027 contract renewals',
    region: 'Global Commodity Feedstocks',
    recommendedMitigation: 'Lock in 6-month fixed price volume purchase order with FoamComfort before index reset.',
    timeline: [
      { id: 't-801', timestamp: '2026-10-05T08:00:00Z', status: 'active', actor: 'ICIS Chemical Benchmark Feed', action: 'Index Surge Alert', notes: 'Polyol benchmark jumped $180/MT in Asian spot market.' },
      { id: 't-802', timestamp: '2026-10-06T15:00:00Z', status: 'monitoring', actor: 'Sourcing Manager (G. Sen)', action: 'Hedging Assessment', notes: 'Requested quotation validity confirmation from supplier sales team.' },
    ],
  },
  {
    id: 'dis-009',
    title: 'Customs Duty Reclassification — China Steel Mechanical Hardware',
    description: 'Indian Directorate General of Foreign Trade issued anti-dumping clarification on specific cold-rolled precision hardware imports from East Asia.',
    category: 'geopolitical',
    severity: 'medium',
    status: 'acknowledged',
    source: 'customs',
    affectedSuppliers: ['sup-007'],
    affectedShipments: ['SHP-2026-0842'],
    affectedMaterials: ['Precision Bearings 6204-2RS'],
    affectedOrders: ['SO-2026-0108'],
    detectedAt: '2026-10-04T10:00:00Z',
    updatedAt: '2026-10-08T11:00:00Z',
    estimatedImpact: 'Additional 7.5% safeguard duty on future import manifests',
    region: 'Indian Customs ICEGATE Portal',
    recommendedMitigation: 'Evaluate accelerating Task 4 switching to domestic alternative Apex Hardware or Precision Bearings Pune.',
    timeline: [
      { id: 't-901', timestamp: '2026-10-04T10:00:00Z', status: 'active', actor: 'ICEGATE Customs Feed', action: 'Notification 42/2026', notes: 'HS Code 8482.10 classification guidelines revised.' },
      { id: 't-902', timestamp: '2026-10-05T16:00:00Z', status: 'acknowledged', actor: 'Customs Broker', action: 'Duty Assessment Review', notes: 'Current pending shipments unaffected due to existing Bill of Entry filing.' },
    ],
  },
  {
    id: 'dis-010',
    title: 'Rail Freight Wagon Shortage — South Eastern Railway Depot',
    description: 'Coal transport prioritization by Indian Railways resulted in intermittent shortages of BOXN wagons for industrial steel cargo at Tatanagar.',
    category: 'logistics',
    severity: 'medium',
    status: 'active',
    source: 'port_authority',
    affectedSuppliers: ['sup-004'],
    affectedShipments: ['SHP-2026-0849'],
    affectedMaterials: ['Heavy Structural Steel Frames'],
    affectedOrders: ['SO-2026-0110'],
    detectedAt: '2026-10-08T15:30:00Z',
    updatedAt: '2026-10-11T10:00:00Z',
    estimatedImpact: '3–4 day siding delay before rail freight rake dispatch',
    region: 'Tatanagar Railway Freight Siding, Jharkhand',
    recommendedMitigation: 'Authorize secondary road transport supplement via multi-axle trailers for priority structural components.',
    timeline: [
      { id: 't-1001', timestamp: '2026-10-08T15:30:00Z', status: 'active', actor: 'Concor Dispatch Bulletin', action: 'Rake Delay Notice', notes: 'Wagon rake allocation postponed 48 hours.' },
      { id: 't-1002', timestamp: '2026-10-09T11:00:00Z', status: 'investigating', actor: 'SteelCraft Logistics Lead', action: 'Road Freight Standby', notes: 'Contracted 3 heavy trailers as backup transport.' },
    ],
  },
  {
    id: 'dis-011',
    title: 'Severe Smog & Diesel Truck Entry Curfew — Delhi NCR Belt',
    description: 'Commission for Air Quality Management imposed GRAP Stage IV restrictions prohibiting BS-IV diesel trucks from entering national capital region.',
    category: 'logistics',
    severity: 'low',
    status: 'monitoring',
    source: 'news',
    affectedSuppliers: [],
    affectedShipments: [],
    affectedMaterials: [],
    affectedOrders: [],
    detectedAt: '2026-10-07T14:00:00Z',
    updatedAt: '2026-10-09T17:00:00Z',
    estimatedImpact: 'Minimal direct impact; outbound north deliveries rerouted via Western Peripheral Expressway',
    region: 'Delhi NCR & Kundli Industrial Zone',
    recommendedMitigation: 'Ensure all contracted transport carriers operate BS-VI compliant fleet or CNG vehicles.',
    timeline: [
      { id: 't-1101', timestamp: '2026-10-07T14:00:00Z', status: 'active', actor: 'CAQM Pollution Control Board', action: 'GRAP IV Curfew', notes: 'Diesel commercial trucks banned during night peak hours.' },
      { id: 't-1102', timestamp: '2026-10-08T12:00:00Z', status: 'resolved', actor: 'Logistics Desk', action: 'Reroute Verified', notes: 'Western Expressway bypass validated for transit bypass.' },
    ],
  },
  {
    id: 'dis-012',
    title: 'Equipment Calibration Failure — Varnish Works Blending Line 3',
    description: 'Solvent metering valve failure at Varnish Works Ambattur plant caused 24-hour stoppage for line re-calibration.',
    category: 'supplier_incident',
    severity: 'low',
    status: 'resolved',
    source: 'supplier_report',
    affectedSuppliers: ['sup-005'],
    affectedShipments: [],
    affectedMaterials: ['Wood Varnish (Gloss Satin 20L)'],
    affectedOrders: [],
    detectedAt: '2026-10-03T08:00:00Z',
    updatedAt: '2026-10-05T16:00:00Z',
    estimatedImpact: '1-day minor production delay; fully caught up on double shift',
    region: 'Ambattur Plant, Chennai, India',
    recommendedMitigation: 'No further action required; vendor verified preventive maintenance compliance certificate.',
    timeline: [
      { id: 't-1201', timestamp: '2026-10-03T08:00:00Z', status: 'active', actor: 'Varnish Works Quality Desk', action: 'Maintenance Notification', notes: 'Valve seal replaced and line cleared.' },
      { id: 't-1202', timestamp: '2026-10-04T14:00:00Z', status: 'acknowledged', actor: 'Procurement Specialist', action: 'Batch Tracked', notes: 'Verified safety stock in Pune adequate.' },
      { id: 't-1203', timestamp: '2026-10-05T16:00:00Z', status: 'resolved', actor: 'Plant QA Lead', action: 'Full Recovery', notes: 'Line operating at 100% capacity.' },
    ],
  },
  {
    id: 'dis-013',
    title: 'Monsoon Flooding — Chennai Ennore Port Access Road',
    description: 'Heavy seasonal downpours submerged low-lying sections of Ennore Expressway, causing temporary container traffic diversions toward Chennai Port Central Gate.',
    category: 'weather',
    severity: 'medium',
    status: 'resolved',
    source: 'weather_service',
    affectedSuppliers: ['sup-005', 'sup-001'],
    affectedShipments: [],
    affectedMaterials: ['Teak Wood Planks (A-Grade)'],
    affectedOrders: [],
    detectedAt: '2026-09-29T18:00:00Z',
    updatedAt: '2026-10-02T12:00:00Z',
    estimatedImpact: '12-hour transport slow down during flood drainage',
    region: 'North Chennai & Ennore Port Corridor',
    recommendedMitigation: 'Road cleared; operations restored to normal throughput.',
    timeline: [
      { id: 't-1301', timestamp: '2026-09-29T18:00:00Z', status: 'active', actor: 'Chennai Traffic Control', action: 'Waterlogging Alert', notes: 'Waterlogging cleared with municipal pumps.' },
      { id: 't-1302', timestamp: '2026-10-02T12:00:00Z', status: 'resolved', actor: 'Terminal Coordinator', action: 'Route Cleared', notes: 'Access roads fully open for heavy vehicles.' },
    ],
  },
  {
    id: 'dis-014',
    title: 'Surat Textile Power Grid Maintenance Shutdown',
    description: 'Scheduled Gujarat Energy Transmission grid line overhaul interrupted textile weaving looms in Surat industrial zone for 8 hours on Sunday.',
    category: 'supplier_incident',
    severity: 'low',
    status: 'resolved',
    source: 'supplier_report',
    affectedSuppliers: ['sup-003'],
    affectedShipments: [],
    affectedMaterials: ['Jacquard Upholstery Fabric (Sapphire)'],
    affectedOrders: [],
    detectedAt: '2026-10-01T06:00:00Z',
    updatedAt: '2026-10-03T11:00:00Z',
    estimatedImpact: 'Negligible impact; production offset by auxiliary captive generators',
    region: 'Surat Industrial Estate, Gujarat, India',
    recommendedMitigation: 'No intervention required; supplier maintained full dispatch commitment.',
    timeline: [
      { id: 't-1401', timestamp: '2026-10-01T06:00:00Z', status: 'active', actor: 'Rajshree Fabrics Operations', action: 'Maintenance Notification', notes: 'Grid shutdown completed on schedule.' },
      { id: 't-1402', timestamp: '2026-10-03T11:00:00Z', status: 'resolved', actor: 'Procurement Specialist', action: 'Confirmed Dispatch', notes: 'Consignment SHP-2026-0855 departed on schedule.' },
    ],
  },
  {
    id: 'dis-015',
    title: 'Adhesive Resin Supplier Insolvency — Secondary Panel Subcontractor',
    description: 'A Tier-2 glue resin manufacturer in Southern India filed for bankruptcy proceedings, affecting secondary lamination contractors.',
    category: 'financial',
    severity: 'low',
    status: 'monitoring',
    source: 'news',
    affectedSuppliers: ['sup-008'],
    affectedShipments: [],
    affectedMaterials: ['Pre-Laminated Particle Board 18mm'],
    affectedOrders: [],
    detectedAt: '2026-10-06T11:00:00Z',
    updatedAt: '2026-10-08T16:00:00Z',
    estimatedImpact: 'EcoPanels confirmed alternative resin contract with Pidilite Industries is intact',
    region: 'Bengaluru & Mysuru Manufacturing Belt',
    recommendedMitigation: 'Monitor EcoPanels quarterly supplier health audit to prevent unexpected Tier-2 shortages.',
    timeline: [
      { id: 't-1501', timestamp: '2026-10-06T11:00:00Z', status: 'active', actor: 'Market Financial Monitor', action: 'Bankruptcy Filing Flag', notes: 'Resin Chem Ltd filed NCLT petition.' },
      { id: 't-1502', timestamp: '2026-10-08T16:00:00Z', status: 'monitoring', actor: 'EcoPanels Procurement Desk', action: 'Sub-tier Clarification', notes: 'Confirmed no single-source dependence on insolvent firm.' },
    ],
  },
  {
    id: 'dis-016',
    title: 'Container Seal Security Audit Alert — JNPT Nhava Sheva Terminal',
    description: 'Central Board of Indirect Taxes and Customs launched random verification of ISO container electronic bolt seals, causing temporary 6-hour scanning queues.',
    category: 'port_congestion',
    severity: 'low',
    status: 'resolved',
    source: 'customs',
    affectedSuppliers: ['sup-007'],
    affectedShipments: ['SHP-2026-0842'],
    affectedMaterials: ['Precision Bearings 6204-2RS'],
    affectedOrders: [],
    detectedAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-04T18:00:00Z',
    estimatedImpact: 'Minor gate delay; audit completed without discrepancy',
    region: 'JNPT Nhava Sheva Terminal 2',
    recommendedMitigation: 'All company containers passed seal verification; gate cleared.',
    timeline: [
      { id: 't-1601', timestamp: '2026-10-02T10:00:00Z', status: 'active', actor: 'Customs ICEGATE Notice', action: 'Seal Audit Mandate', notes: 'Mandatory seal scan enforced on import container block.' },
      { id: 't-1602', timestamp: '2026-10-04T18:00:00Z', status: 'resolved', actor: 'Logistics Representative', action: 'Container Cleared', notes: 'All RFID tags verified intact.' },
    ],
  },
];

// --- In-Memory State for Interactive Status Updates ---
let disruptionsStore: DisruptionSignalDetail[] = [...MOCK_DISRUPTIONS_CATALOG];

// --- Query Functions ---

export function getMockDisruptions(filters?: DisruptionFilterParams): { data: DisruptionSignalDetail[]; total: number } {
  let list = [...disruptionsStore];

  if (filters?.severity && filters.severity !== 'all') {
    list = list.filter(d => d.severity === filters.severity);
  }

  if (filters?.category && filters.category !== 'all') {
    list = list.filter(d => d.category === filters.category);
  }

  if (filters?.status && filters.status !== 'all') {
    list = list.filter(d => d.status === filters.status);
  }

  if (filters?.supplierId && filters.supplierId !== 'all') {
    list = list.filter(d => d.affectedSuppliers.includes(filters.supplierId!));
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q) ||
      d.affectedMaterials.some(m => m.toLowerCase().includes(q))
    );
  }

  // Sorting
  const severityRank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  list.sort((a, b) => {
    if (filters?.sortBy === 'severity') {
      const order = severityRank[a.severity] - severityRank[b.severity];
      return filters.sortOrder === 'desc' ? -order : order;
    }
    // Default by detectedAt desc
    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
  });

  return {
    data: list,
    total: list.length,
  };
}

export function getMockDisruptionById(id: string): DisruptionSignalDetail | undefined {
  const signal = disruptionsStore.find(d => d.id === id);
  if (!signal) return undefined;

  // Enrich with live shipment details
  const matchingShipments = MOCK_SHIPMENT_RECORDS.filter(s => s.relatedDisruptionId === id);
  return {
    ...signal,
    affectedShipmentDetails: matchingShipments,
  };
}

export function updateMockDisruptionStatus(id: string, payload: DisruptionStatusUpdatePayload): DisruptionSignalDetail | undefined {
  const index = disruptionsStore.findIndex(d => d.id === id);
  if (index === -1) return undefined;

  const current = disruptionsStore[index];
  const now = new Date().toISOString();

  const newTimelineEvent = {
    id: `t-${Date.now()}`,
    timestamp: now,
    status: payload.status,
    actor: payload.actor || 'Current User (ERP)',
    action: `Status changed to ${payload.status.toUpperCase()}`,
    notes: payload.notes || `Disruption state updated to ${payload.status}.`,
  };

  const updated: DisruptionSignalDetail = {
    ...current,
    status: payload.status,
    updatedAt: now,
    timeline: [newTimelineEvent, ...(current.timeline || [])],
  };

  disruptionsStore[index] = updated;
  return updated;
}

export function getMockShipments(filters?: ShipmentFilterParams): { data: ShipmentTransitRecord[]; total: number } {
  let list = [...MOCK_SHIPMENT_RECORDS];

  if (filters?.status && filters.status !== 'all') {
    list = list.filter(s => s.status === filters.status);
  }

  if (filters?.supplierId && filters.supplierId !== 'all') {
    list = list.filter(s => s.supplierId === filters.supplierId);
  }

  if (filters?.riskSeverity && filters.riskSeverity !== 'all') {
    list = list.filter(s => s.riskSeverity === filters.riskSeverity);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(s =>
      s.shipmentNumber.toLowerCase().includes(q) ||
      s.carrier.toLowerCase().includes(q) ||
      s.materialName.toLowerCase().includes(q) ||
      s.origin.toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q) ||
      s.supplierName.toLowerCase().includes(q)
    );
  }

  return {
    data: list,
    total: list.length,
  };
}

export function getDisruptionsKpis() {
  const activeDisruptions = disruptionsStore.filter(d => d.status === 'active' || d.status === 'investigating' || d.status === 'acknowledged').length;
  const criticalDisruptions = disruptionsStore.filter(d => d.severity === 'critical' || d.severity === 'high').length;
  const delayedShipments = MOCK_SHIPMENT_RECORDS.filter(s => s.status === 'delayed' || s.status === 'held_customs').length;
  const delayedWithDays = MOCK_SHIPMENT_RECORDS.filter(s => s.delayDays > 0);
  const avgDelayDays = delayedWithDays.length > 0
    ? (delayedWithDays.reduce((sum, s) => sum + s.delayDays, 0) / delayedWithDays.length).toFixed(1)
    : '0.0';
  const resolvedCount = disruptionsStore.filter(d => d.status === 'resolved').length;

  return {
    activeDisruptions,
    criticalDisruptions,
    delayedShipments,
    avgDelayDays,
    resolvedCount,
    totalTrackedShipments: MOCK_SHIPMENT_RECORDS.length,
  };
}
