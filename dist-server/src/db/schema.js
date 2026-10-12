import { pgTable, text, serial, integer, real, timestamp } from 'drizzle-orm/pg-core';
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    uid: text('uid').notNull().unique(), // Firebase Auth UID
    email: text('email').notNull(),
    name: text('name').default('Solar Specialist'),
    role: text('role').default('admin'),
    createdAt: timestamp('created_at').defaultNow(),
});
export const customers = pgTable('customers', {
    id: text('id').primaryKey(), // e.g. CUST-1001
    uuid: text('uuid').notNull().unique(),
    userId: text('user_id').notNull(), // Per-user Gmail isolation
    type: text('type').notNull().default('residential'),
    name: text('name').notNull(),
    contactPerson: text('contact_person'),
    phone: text('phone').notNull(),
    email: text('email'),
    address: text('address').notNull(),
    city: text('city').notNull(),
    province: text('province').notNull(),
    postalCode: text('postal_code'),
    notes: text('notes'),
    status: text('status').notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
export const installations = pgTable('installations', {
    id: text('id').primaryKey(), // e.g. INST-1001
    uuid: text('uuid').notNull().unique(),
    userId: text('user_id').notNull(), // Per-user Gmail isolation
    customerId: text('customer_id').notNull().references(() => customers.id),
    projectName: text('project_name').notNull(),
    siteAddress: text('site_address').notNull(),
    capacityKwp: real('capacity_kwp').notNull(),
    systemType: text('system_type').notNull().default('grid-tied'),
    startDate: text('start_date'),
    completionDate: text('completion_date'),
    commissioningDate: text('commissioning_date'),
    turnoverDate: text('turnover_date'),
    assignedTechnicianId: text('assigned_technician_id'),
    status: text('status').notNull().default('Draft'),
    notes: text('notes'),
    referenceNumber: text('reference_number'),
    statusUpdatedAt: text('status_updated_at'),
    createdAt: timestamp('created_at').defaultNow(),
});
export const equipment = pgTable('equipment', {
    id: text('id').primaryKey(), // e.g. EQ-1001
    uuid: text('uuid').notNull().unique(),
    userId: text('user_id').notNull(), // Per-user Gmail isolation
    installationId: text('installation_id').notNull().references(() => installations.id),
    category: text('category').notNull(),
    brand: text('brand').notNull(),
    model: text('model').notNull(),
    serialNumber: text('serial_number'),
    quantity: integer('quantity').notNull().default(1),
    unit: text('unit').default('pcs'),
    specifications: text('specifications'),
    supplier: text('supplier'),
    purchaseDate: text('purchase_date'),
    installationDate: text('installation_date'),
    status: text('status').notNull().default('Operational'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
});
export const warranties = pgTable('warranties', {
    id: text('id').primaryKey(), // e.g. WAR-1001
    uuid: text('uuid').notNull().unique(),
    userId: text('user_id').notNull(), // Per-user Gmail isolation
    installationId: text('installation_id').notNull().references(() => installations.id),
    equipmentId: text('equipment_id'),
    provider: text('provider').notNull(),
    type: text('type').notNull(),
    referenceNumber: text('reference_number'),
    description: text('description'),
    startDate: text('start_date').notNull(),
    endDate: text('end_date').notNull(),
    terms: text('terms'),
    status: text('status').notNull().default('Active'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
});
export const warrantyClaims = pgTable('warranty_claims', {
    id: text('id').primaryKey(), // e.g. CLM-1001
    uuid: text('uuid').notNull().unique(),
    userId: text('user_id').notNull(), // Per-user Gmail isolation
    warrantyId: text('warranty_id').notNull().references(() => warranties.id),
    equipmentId: text('equipment_id'),
    dateReported: text('date_reported').notNull(),
    problemDescription: text('problem_description').notNull(),
    providerReference: text('provider_reference'),
    status: text('status').notNull().default('Draft'),
    assignedStaffId: text('assigned_staff_id'),
    resolutionNotes: text('resolution_notes'),
    resolutionDate: text('resolution_date'),
    createdAt: timestamp('created_at').defaultNow(),
});
export const serviceRequests = pgTable('service_requests', {
    id: text('id').primaryKey(), // e.g. SRV-1001
    uuid: text('uuid').notNull().unique(),
    userId: text('user_id').notNull(), // Per-user Gmail isolation
    installationId: text('installation_id').notNull().references(() => installations.id),
    dateReported: text('date_reported').notNull(),
    problemCategory: text('problem_category').notNull(),
    description: text('description').notNull(),
    priority: text('priority').notNull().default('Medium'),
    assignedTechnicianId: text('assigned_technician_id'),
    scheduledVisitDate: text('scheduled_visit_date'),
    status: text('status').notNull().default('Open'),
    workPerformed: text('work_performed'),
    partsReplaced: text('parts_replaced'),
    completionNotes: text('completion_notes'),
    createdAt: timestamp('created_at').defaultNow(),
});
export const documents = pgTable('documents', {
    id: text('id').primaryKey(),
    uuid: text('uuid').notNull().unique(),
    userId: text('user_id').notNull(), // Per-user Gmail isolation
    type: text('type').notNull(),
    filename: text('filename').notNull(),
    originalName: text('original_name').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    installationId: text('installation_id'),
    equipmentId: text('equipment_id'),
    warrantyId: text('warranty_id'),
    claimId: text('claim_id'),
    serviceRequestId: text('service_request_id'),
    uploadedById: text('uploaded_by_id'),
    createdAt: timestamp('created_at').defaultNow(),
});
