import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

let counter = 1000;
function genId(prefix = 'PAS') {
  const hex = (counter++).toString(16).padStart(8, '0');
  const rnd = crypto.randomBytes(6).toString('hex');
  return `AAAAAA${prefix}${hex}${rnd}`.slice(0, 24);
}

function createStarUMLProject() {
  const projectId = genId('PRJ');
  const modelId = genId('MDL');

  const project = {
    _type: 'Project',
    _id: projectId,
    name: 'Passport Automation System',
    author: 'Passport Automation System Development Team',
    company: 'Ministry of External Affairs (Academic Simulation)',
    copyright: 'Copyright 2026 Passport Automation System',
    version: '2.5.0',
    ownedElements: []
  };

  const model = {
    _type: 'UMLModel',
    _id: modelId,
    _parent: { $ref: projectId },
    name: 'Passport Automation System Architecture',
    ownedElements: []
  };
  project.ownedElements.push(model);

  // ==========================================
  // 1. USE CASE PACKAGE & DIAGRAM
  // ==========================================
  const useCasePkgId = genId('PKG');
  const useCaseDiagId = genId('DIA');
  const useCasePkg = {
    _type: 'UMLPackage',
    _id: useCasePkgId,
    _parent: { $ref: modelId },
    name: '01 - Use Case View',
    ownedElements: []
  };

  const actors = [
    { name: 'Public Visitor', desc: 'Unauthenticated citizen browsing public portal' },
    { name: 'Applicant', desc: 'Registered citizen applying for passport & scheduling' },
    { name: 'Passport Officer', desc: 'Verifying & Granting officer at PSK' },
    { name: 'Police Officer', desc: 'Jurisdictional police station verification authority' },
    { name: 'Administrator', desc: 'System administrator managing master data' }
  ];

  const actorModels = {};
  for (const a of actors) {
    const actId = genId('ACT');
    actorModels[a.name] = {
      _type: 'UMLActor',
      _id: actId,
      _parent: { $ref: useCasePkgId },
      name: a.name,
      documentation: a.desc
    };
    useCasePkg.ownedElements.push(actorModels[a.name]);
  }

  const useCasesList = [
    'Register Account & Verify Captcha',
    'Login & Multi-Factor Auth',
    'Fill Passport Application (Fresh/Reissue)',
    'Calculate Statutory Fees (GSR 516E)',
    'Pay Statutory Fee (SBI ePay/UPI)',
    'Book PSK Appointment Slot',
    'Reschedule / Cancel Appointment',
    'Upload Proof Documents',
    'Check In at PSK (Counter A)',
    'Scrutinize Original Proofs (Counter B)',
    'Request Citizen Clarification',
    'Granting Scrutiny & Approval (Counter C)',
    'Security Booklet Personalization & Printing',
    'Dispatch via India Post Speed Post',
    'Conduct Physical Address Enquiry',
    'Search CCTNS Criminal Database',
    'Submit Police Verification Report (PVR)',
    'Track Application Status by ARN',
    'Lodge Public Grievance Ticket',
    'Investigate & Resolve Grievance',
    'Manage PSK Regional Centres',
    'Manage Statutory Fee Schedules',
    'Manage Gazette Notices & Circulars',
    'Audit System Security Logs'
  ];

  const ucModels = {};
  for (const uc of useCasesList) {
    const ucId = genId('UCS');
    ucModels[uc] = {
      _type: 'UMLUseCase',
      _id: ucId,
      _parent: { $ref: useCasePkgId },
      name: uc
    };
    useCasePkg.ownedElements.push(ucModels[uc]);
  }

  const ucDiagram = {
    _type: 'UMLUseCaseDiagram',
    _id: useCaseDiagId,
    _parent: { $ref: useCasePkgId },
    name: '01 - System Use Case Diagram',
    visible: true,
    defaultDiagram: true,
    ownedViews: []
  };

  const actorPositions = [
    { name: 'Public Visitor', x: 50, y: 80 },
    { name: 'Applicant', x: 50, y: 320 },
    { name: 'Administrator', x: 50, y: 700 },
    { name: 'Passport Officer', x: 950, y: 220 },
    { name: 'Police Officer', x: 950, y: 560 }
  ];

  for (const pos of actorPositions) {
    const act = actorModels[pos.name];
    if (act) {
      ucDiagram.ownedViews.push({
        _type: 'UMLActorView',
        _id: genId('AVW'),
        _parent: { $ref: useCaseDiagId },
        model: { $ref: act._id },
        visible: true,
        font: 'Arial;13;0',
        left: pos.x,
        top: pos.y,
        width: 80,
        height: 100
      });
    }
  }

  useCasesList.forEach((ucName, idx) => {
    const uc = ucModels[ucName];
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 240 + col * 340;
    const y = 60 + row * 80;

    ucDiagram.ownedViews.push({
      _type: 'UMLUseCaseView',
      _id: genId('UVW'),
      _parent: { $ref: useCaseDiagId },
      model: { $ref: uc._id },
      visible: true,
      font: 'Arial;12;0',
      left: x,
      top: y,
      width: 290,
      height: 60
    });
  });

  useCasePkg.ownedElements.push(ucDiagram);
  model.ownedElements.push(useCasePkg);

  // ==========================================
  // 2. CLASS PACKAGE & DIAGRAM (All Prisma Models)
  // ==========================================
  const classPkgId = genId('PKG');
  const classDiagId = genId('DIA');
  const classPkg = {
    _type: 'UMLPackage',
    _id: classPkgId,
    _parent: { $ref: modelId },
    name: '02 - Domain Class View',
    ownedElements: []
  };

  const domainClasses = [
    {
      name: 'User',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'email', type: 'String', vis: 'public' },
        { name: 'passwordHash', type: 'String', vis: 'private' },
        { name: 'role', type: 'Role', vis: 'public' },
        { name: 'isActive', type: 'Boolean', vis: 'public' },
        { name: 'failedAttempts', type: 'Int', vis: 'public' },
        { name: 'lockedUntil', type: 'DateTime', vis: 'public' },
        { name: 'emailVerified', type: 'Boolean', vis: 'public' }
      ],
      ops: [
        { name: 'validatePassword(pwd)', vis: 'public' },
        { name: 'isAccountLocked()', vis: 'public' },
        { name: 'resetFailedAttempts()', vis: 'public' }
      ]
    },
    {
      name: 'Applicant',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'userId', type: 'String', vis: 'public' },
        { name: 'fullName', type: 'String', vis: 'public' },
        { name: 'gender', type: 'Gender', vis: 'public' },
        { name: 'dateOfBirth', type: 'DateTime', vis: 'public' },
        { name: 'placeOfBirth', type: 'String', vis: 'public' },
        { name: 'phone', type: 'String', vis: 'public' },
        { name: 'address', type: 'String', vis: 'public' }
      ],
      ops: [
        { name: 'getProfile()', vis: 'public' },
        { name: 'updateAddress(addr)', vis: 'public' }
      ]
    },
    {
      name: 'Application',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'arn', type: 'String', vis: 'public' },
        { name: 'applicantId', type: 'String', vis: 'public' },
        { name: 'serviceType', type: 'ServiceType', vis: 'public' },
        { name: 'schemeType', type: 'SchemeType', vis: 'public' },
        { name: 'bookletType', type: 'BookletType', vis: 'public' },
        { name: 'status', type: 'ApplicationStatus', vis: 'public' },
        { name: 'feeAmount', type: 'Decimal', vis: 'public' },
        { name: 'isPaid', type: 'Boolean', vis: 'public' }
      ],
      ops: [
        { name: 'submit()', vis: 'public' },
        { name: 'transitionTo(nextStatus)', vis: 'public' },
        { name: 'calculateFee()', vis: 'public' }
      ]
    },
    {
      name: 'ApplicationStatusHistory',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'applicationId', type: 'String', vis: 'public' },
        { name: 'fromStatus', type: 'String', vis: 'public' },
        { name: 'toStatus', type: 'String', vis: 'public' },
        { name: 'changedBy', type: 'String', vis: 'public' },
        { name: 'changedAt', type: 'DateTime', vis: 'public' },
        { name: 'remarks', type: 'String', vis: 'public' }
      ],
      ops: []
    },
    {
      name: 'Document',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'applicationId', type: 'String', vis: 'public' },
        { name: 'type', type: 'DocumentType', vis: 'public' },
        { name: 'fileName', type: 'String', vis: 'public' },
        { name: 'fileUrl', type: 'String', vis: 'public' },
        { name: 'fileSize', type: 'Int', vis: 'public' },
        { name: 'status', type: 'DocumentStatus', vis: 'public' },
        { name: 'verifiedBy', type: 'String', vis: 'public' }
      ],
      ops: [
        { name: 'verify(officerId)', vis: 'public' },
        { name: 'reject(remarks)', vis: 'public' }
      ]
    },
    {
      name: 'Appointment',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'applicationId', type: 'String', vis: 'public' },
        { name: 'centerId', type: 'String', vis: 'public' },
        { name: 'tokenNumber', type: 'String', vis: 'public' },
        { name: 'appointmentDate', type: 'DateTime', vis: 'public' },
        { name: 'timeSlot', type: 'String', vis: 'public' },
        { name: 'status', type: 'AppointmentStatus', vis: 'public' }
      ],
      ops: [
        { name: 'bookSlot()', vis: 'public' },
        { name: 'reschedule(newDate, newSlot)', vis: 'public' },
        { name: 'checkIn()', vis: 'public' }
      ]
    },
    {
      name: 'Payment',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'applicationId', type: 'String', vis: 'public' },
        { name: 'txnId', type: 'String', vis: 'public' },
        { name: 'amount', type: 'Decimal', vis: 'public' },
        { name: 'method', type: 'PaymentMethod', vis: 'public' },
        { name: 'status', type: 'PaymentStatus', vis: 'public' },
        { name: 'paidAt', type: 'DateTime', vis: 'public' }
      ],
      ops: [
        { name: 'initiateOrder()', vis: 'public' },
        { name: 'verifySignature(sig)', vis: 'public' }
      ]
    },
    {
      name: 'PoliceReport',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'applicationId', type: 'String', vis: 'public' },
        { name: 'policeId', type: 'String', vis: 'public' },
        { name: 'pvrNumber', type: 'String', vis: 'public' },
        { name: 'status', type: 'PvrStatus', vis: 'public' },
        { name: 'criminalRecord', type: 'Boolean', vis: 'public' },
        { name: 'addressVerified', type: 'Boolean', vis: 'public' },
        { name: 'applicantMet', type: 'Boolean', vis: 'public' }
      ],
      ops: [
        { name: 'submitClearReport()', vis: 'public' },
        { name: 'submitAdverseReport(grounds)', vis: 'public' }
      ]
    },
    {
      name: 'Passport',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'applicationId', type: 'String', vis: 'public' },
        { name: 'passportNumber', type: 'String', vis: 'public' },
        { name: 'trackingNumber', type: 'String', vis: 'public' },
        { name: 'issueDate', type: 'DateTime', vis: 'public' },
        { name: 'expiryDate', type: 'DateTime', vis: 'public' },
        { name: 'status', type: 'PassportStatus', vis: 'public' }
      ],
      ops: [
        { name: 'generateBookletNumber()', vis: 'public' },
        { name: 'dispatchSpeedPost(trackingNo)', vis: 'public' }
      ]
    },
    {
      name: 'PassportOfficer',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'userId', type: 'String', vis: 'public' },
        { name: 'employeeId', type: 'String', vis: 'public' },
        { name: 'counterType', type: 'CounterType', vis: 'public' }
      ],
      ops: [
        { name: 'scrutinizeDocuments(docList)', vis: 'public' },
        { name: 'grantPassport(appId)', vis: 'public' }
      ]
    },
    {
      name: 'Police',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'userId', type: 'String', vis: 'public' },
        { name: 'stationName', type: 'String', vis: 'public' },
        { name: 'district', type: 'String', vis: 'public' },
        { name: 'badgeNumber', type: 'String', vis: 'public' }
      ],
      ops: [
        { name: 'conductFieldEnquiry(appId)', vis: 'public' }
      ]
    },
    {
      name: 'PassportCenter',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'code', type: 'String', vis: 'public' },
        { name: 'name', type: 'String', vis: 'public' },
        { name: 'city', type: 'String', vis: 'public' },
        { name: 'dailyCapacity', type: 'Int', vis: 'public' }
      ],
      ops: [
        { name: 'getAvailableSlots(date)', vis: 'public' }
      ]
    },
    {
      name: 'Grievance',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'ticketNumber', type: 'String', vis: 'public' },
        { name: 'userId', type: 'String', vis: 'public' },
        { name: 'applicationId', type: 'String', vis: 'public' },
        { name: 'category', type: 'GrievanceCategory', vis: 'public' },
        { name: 'subject', type: 'String', vis: 'public' },
        { name: 'status', type: 'GrievanceStatus', vis: 'public' },
        { name: 'priority', type: 'Priority', vis: 'public' }
      ],
      ops: [
        { name: 'lodgeTicket()', vis: 'public' },
        { name: 'resolveTicket(notes, officerId)', vis: 'public' }
      ]
    },
    {
      name: 'FeeSchedule',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'serviceType', type: 'ServiceType', vis: 'public' },
        { name: 'scheme', type: 'SchemeType', vis: 'public' },
        { name: 'pages', type: 'Int', vis: 'public' },
        { name: 'baseFee', type: 'Decimal', vis: 'public' },
        { name: 'tatkaalSurcharge', type: 'Decimal', vis: 'public' }
      ],
      ops: []
    },
    {
      name: 'Notice',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'title', type: 'String', vis: 'public' },
        { name: 'slug', type: 'String', vis: 'public' },
        { name: 'category', type: 'String', vis: 'public' },
        { name: 'isGazette', type: 'Boolean', vis: 'public' },
        { name: 'publishedAt', type: 'DateTime', vis: 'public' }
      ],
      ops: []
    },
    {
      name: 'AuditLog',
      attrs: [
        { name: 'id', type: 'String', vis: 'public' },
        { name: 'userId', type: 'String', vis: 'public' },
        { name: 'action', type: 'String', vis: 'public' },
        { name: 'resource', type: 'String', vis: 'public' },
        { name: 'ipAddress', type: 'String', vis: 'public' },
        { name: 'createdAt', type: 'DateTime', vis: 'public' }
      ],
      ops: []
    }
  ];

  const classModels = {};
  for (const c of domainClasses) {
    const cId = genId('CLS');
    const uClass = {
      _type: 'UMLClass',
      _id: cId,
      _parent: { $ref: classPkgId },
      name: c.name,
      attributes: c.attrs.map(a => ({
        _type: 'UMLAttribute',
        _id: genId('ATT'),
        _parent: { $ref: cId },
        name: a.name,
        type: a.type,
        visibility: a.vis
      })),
      operations: c.ops.map(o => ({
        _type: 'UMLOperation',
        _id: genId('OPR'),
        _parent: { $ref: cId },
        name: o.name,
        visibility: o.vis
      }))
    };
    classModels[c.name] = uClass;
    classPkg.ownedElements.push(uClass);
  }

  const classDiagram = {
    _type: 'UMLClassDiagram',
    _id: classDiagId,
    _parent: { $ref: classPkgId },
    name: '02 - Domain Class Diagram',
    visible: true,
    ownedViews: []
  };

  domainClasses.forEach((c, idx) => {
    const uClass = classModels[c.name];
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const x = 50 + col * 260;
    const y = 50 + row * 240;

    classDiagram.ownedViews.push({
      _type: 'UMLClassView',
      _id: genId('CVW'),
      _parent: { $ref: classDiagId },
      model: { $ref: uClass._id },
      visible: true,
      font: 'Arial;12;0',
      left: x,
      top: y,
      width: 230,
      height: 190
    });
  });

  classPkg.ownedElements.push(classDiagram);
  model.ownedElements.push(classPkg);

  // ==========================================
  // 3. STATE MACHINE PACKAGE & STATECHART (FSM)
  // ==========================================
  const smPkgId = genId('PKG');
  const smId = genId('STM');
  const smRegionId = genId('RGN');
  const smDiagId = genId('DIA');

  const smPkg = {
    _type: 'UMLPackage',
    _id: smPkgId,
    _parent: { $ref: modelId },
    name: '03 - Statechart View',
    ownedElements: []
  };

  const stateNames = [
    'DRAFT', 'SUBMITTED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING',
    'PAYMENT_COMPLETED', 'APPOINTMENT_BOOKED', 'DOCUMENT_VERIFICATION',
    'CLARIFICATION_REQUIRED', 'DOCUMENT_VERIFIED', 'POLICE_VERIFICATION_PENDING',
    'POLICE_VERIFICATION_COMPLETED', 'OFFICER_REVIEW', 'APPROVED',
    'PRINTING', 'DISPATCHED', 'DELIVERED', 'REJECTED', 'CANCELLED'
  ];

  const stateModels = {};
  const initPseudoId = genId('PSD');
  const finalPseudoId = genId('PSD');

  const region = {
    _type: 'UMLRegion',
    _id: smRegionId,
    _parent: { $ref: smId },
    name: 'ApplicationFSMRegion',
    vertices: [
      {
        _type: 'UMLPseudostate',
        _id: initPseudoId,
        _parent: { $ref: smRegionId },
        name: 'Initial',
        kind: 'initial'
      },
      {
        _type: 'UMLFinalState',
        _id: finalPseudoId,
        _parent: { $ref: smRegionId },
        name: 'Completed'
      }
    ],
    transitions: []
  };

  for (const st of stateNames) {
    const stId = genId('STA');
    const uState = {
      _type: 'UMLState',
      _id: stId,
      _parent: { $ref: smRegionId },
      name: st
    };
    stateModels[st] = uState;
    region.vertices.push(uState);
  }

  const transitionPairs = [
    ['DRAFT', 'SUBMITTED'],
    ['SUBMITTED', 'PAYMENT_PENDING'],
    ['PAYMENT_PENDING', 'PAYMENT_PROCESSING'],
    ['PAYMENT_PROCESSING', 'PAYMENT_COMPLETED'],
    ['PAYMENT_COMPLETED', 'APPOINTMENT_BOOKED'],
    ['APPOINTMENT_BOOKED', 'DOCUMENT_VERIFICATION'],
    ['DOCUMENT_VERIFICATION', 'CLARIFICATION_REQUIRED'],
    ['CLARIFICATION_REQUIRED', 'DOCUMENT_VERIFICATION'],
    ['DOCUMENT_VERIFICATION', 'DOCUMENT_VERIFIED'],
    ['DOCUMENT_VERIFIED', 'POLICE_VERIFICATION_PENDING'],
    ['POLICE_VERIFICATION_PENDING', 'POLICE_VERIFICATION_COMPLETED'],
    ['POLICE_VERIFICATION_COMPLETED', 'OFFICER_REVIEW'],
    ['OFFICER_REVIEW', 'APPROVED'],
    ['APPROVED', 'PRINTING'],
    ['PRINTING', 'DISPATCHED'],
    ['DISPATCHED', 'DELIVERED'],
    ['DELIVERED', 'Completed'],
    ['DOCUMENT_VERIFICATION', 'REJECTED'],
    ['OFFICER_REVIEW', 'REJECTED']
  ];

  for (const [src, dst] of transitionPairs) {
    const srcObj = stateModels[src];
    const dstObj = dst === 'Completed' ? { _id: finalPseudoId } : stateModels[dst];
    if (srcObj && dstObj) {
      region.transitions.push({
        _type: 'UMLTransition',
        _id: genId('TRN'),
        _parent: { $ref: smRegionId },
        source: { $ref: srcObj._id },
        target: { $ref: dstObj._id }
      });
    }
  }

  const stateMachine = {
    _type: 'UMLStateMachine',
    _id: smId,
    _parent: { $ref: smPkgId },
    name: 'Application Finite State Machine',
    regions: [region]
  };

  const stateDiagram = {
    _type: 'UMLStatechartDiagram',
    _id: smDiagId,
    _parent: { $ref: smId },
    name: '03 - Application Lifecycle Statechart',
    visible: true,
    ownedViews: []
  };

  stateDiagram.ownedViews.push({
    _type: 'UMLPseudostateView',
    _id: genId('PVW'),
    _parent: { $ref: smDiagId },
    model: { $ref: initPseudoId },
    left: 40,
    top: 60,
    width: 25,
    height: 25
  });

  stateNames.forEach((name, idx) => {
    const uState = stateModels[name];
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const x = 100 + col * 260;
    const y = 50 + row * 110;

    stateDiagram.ownedViews.push({
      _type: 'UMLStateView',
      _id: genId('SVW'),
      _parent: { $ref: smDiagId },
      model: { $ref: uState._id },
      visible: true,
      font: 'Arial;12;0',
      left: x,
      top: y,
      width: 210,
      height: 55
    });
  });

  stateMachine.ownedElements = [stateDiagram];
  smPkg.ownedElements.push(stateMachine);
  model.ownedElements.push(smPkg);

  // ==========================================
  // 4. SEQUENCE / INTERACTION PACKAGE
  // ==========================================
  const seqPkgId = genId('PKG');
  const interactionId = genId('INT');
  const seqDiagId = genId('DIA');

  const seqPkg = {
    _type: 'UMLPackage',
    _id: seqPkgId,
    _parent: { $ref: modelId },
    name: '04 - Sequence Views',
    ownedElements: []
  };

  const lifelinesData = [
    { name: 'citizen', type: 'Citizen' },
    { name: 'ui', type: 'BrowserUI' },
    { name: 'api', type: 'ApplicationAPI' },
    { name: 'fsm', type: 'FSMEngine' },
    { name: 'fee', type: 'FeeCalculator' },
    { name: 'prisma', type: 'PrismaClient' },
    { name: 'db', type: 'Database' }
  ];

  const lifelines = [];
  const lifelineModels = {};

  for (const ll of lifelinesData) {
    const llId = genId('LFL');
    const uLifeline = {
      _type: 'UMLLifeline',
      _id: llId,
      _parent: { $ref: interactionId },
      name: `${ll.name} : ${ll.type}`
    };
    lifelines.push(uLifeline);
    lifelineModels[ll.name] = uLifeline;
  }

  const messagesData = [
    { from: 'citizen', to: 'ui', name: '1: submitApplication(formData)' },
    { from: 'ui', to: 'api', name: '2: POST /api/applications' },
    { from: 'api', to: 'fsm', name: '3: canTransition(DRAFT, SUBMITTED)' },
    { from: 'api', to: 'fee', name: '4: calculateFee(service, scheme)' },
    { from: 'api', to: 'prisma', name: '5: $transaction(create Application)' },
    { from: 'prisma', to: 'db', name: '6: INSERT INTO Application & History' },
    { from: 'api', to: 'ui', name: '7: 201 Created { ARN, feeAmount }' },
    { from: 'ui', to: 'citizen', name: '8: Render Submission Slip & Fee Card' }
  ];

  const messages = [];
  for (const msg of messagesData) {
    const src = lifelineModels[msg.from];
    const dst = lifelineModels[msg.to];
    messages.push({
      _type: 'UMLMessage',
      _id: genId('MSG'),
      _parent: { $ref: interactionId },
      name: msg.name,
      source: { $ref: src._id },
      target: { $ref: dst._id }
    });
  }

  const interaction = {
    _type: 'UMLInteraction',
    _id: interactionId,
    _parent: { $ref: seqPkgId },
    name: 'Passport Application Submission Flow',
    lifelines,
    messages,
    ownedElements: []
  };

  const seqDiagram = {
    _type: 'UMLSequenceDiagram',
    _id: seqDiagId,
    _parent: { $ref: interactionId },
    name: '04 - Application Submission Sequence Diagram',
    visible: true,
    ownedViews: []
  };

  lifelines.forEach((ll, idx) => {
    seqDiagram.ownedViews.push({
      _type: 'UMLSeqLifelineView',
      _id: genId('LVW'),
      _parent: { $ref: seqDiagId },
      model: { $ref: ll._id },
      visible: true,
      font: 'Arial;12;0',
      left: 60 + idx * 160,
      top: 50,
      width: 130,
      height: 480
    });
  });

  interaction.ownedElements.push(seqDiagram);
  seqPkg.ownedElements.push(interaction);
  model.ownedElements.push(seqPkg);

  // ==========================================
  // 5. OBJECT VIEW PACKAGE & DIAGRAM
  // ==========================================
  const objPkgId = genId('PKG');
  const objDiagId = genId('DIA');
  const objPkg = {
    _type: 'UMLPackage',
    _id: objPkgId,
    _parent: { $ref: modelId },
    name: '05 - Object View',
    ownedElements: []
  };

  const snapshotObjects = [
    { name: 'usr_9041 : User', type: 'User' },
    { name: 'app_8210 : Applicant', type: 'Applicant' },
    { name: 'pas_app_501 : Application', type: 'Application' },
    { name: 'pay_301 : Payment', type: 'Payment' },
    { name: 'appt_401 : Appointment', type: 'Appointment' },
    { name: 'psk_dl01 : PassportCenter', type: 'PassportCenter' },
    { name: 'doc_101 : Document', type: 'Document' },
    { name: 'pvr_201 : PoliceReport', type: 'PoliceReport' },
    { name: 'pass_701 : Passport', type: 'Passport' },
    { name: 'off_102 : PassportOfficer', type: 'PassportOfficer' }
  ];

  const objModels = {};
  for (const obj of snapshotObjects) {
    const oId = genId('OBJ');
    const uObj = {
      _type: 'UMLObject',
      _id: oId,
      _parent: { $ref: objPkgId },
      name: obj.name
    };
    objModels[obj.name] = uObj;
    objPkg.ownedElements.push(uObj);
  }

  const objDiagram = {
    _type: 'UMLObjectDiagram',
    _id: objDiagId,
    _parent: { $ref: objPkgId },
    name: '05 - System Runtime Snapshot (Object Diagram)',
    visible: true,
    ownedViews: []
  };

  snapshotObjects.forEach((obj, idx) => {
    const uObj = objModels[obj.name];
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 60 + col * 320;
    const y = 60 + row * 160;

    objDiagram.ownedViews.push({
      _type: 'UMLObjectView',
      _id: genId('OVW'),
      _parent: { $ref: objDiagId },
      model: { $ref: uObj._id },
      visible: true,
      font: 'Arial;12;0',
      left: x,
      top: y,
      width: 260,
      height: 100
    });
  });

  objPkg.ownedElements.push(objDiagram);
  model.ownedElements.push(objPkg);

  // ==========================================
  // 6. COMPONENT PACKAGE & DIAGRAM
  // ==========================================
  const compPkgId = genId('PKG');
  const compDiagId = genId('DIA');
  const compPkg = {
    _type: 'UMLPackage',
    _id: compPkgId,
    _parent: { $ref: modelId },
    name: '06 - Component View',
    ownedElements: []
  };

  const components = [
    { name: 'CitizenPortalUI', desc: 'React Client Application Wizard' },
    { name: 'OfficerDeskUI', desc: 'Counter Scrutiny & Granting Portal' },
    { name: 'PoliceStationUI', desc: 'Police Verification Enquiry Portal' },
    { name: 'AdminDashboardUI', desc: 'Administrative & Notice Manager' },
    { name: 'NextJsAPIRoutes', desc: 'REST Controllers & Server Actions' },
    { name: 'FSMEngine', desc: 'Finite State Machine (lib/fsm.ts)' },
    { name: 'FeeEngine', desc: 'Statutory Fee Calculator (lib/feeCalculator.ts)' },
    { name: 'PrismaORMClient', desc: 'Data Access Layer (lib/prisma.ts)' },
    { name: 'RelationalDatabase', desc: 'PostgreSQL / SQLite Storage Engine' }
  ];

  const compModels = {};
  for (const c of components) {
    const cId = genId('CMP');
    const uComp = {
      _type: 'UMLComponent',
      _id: cId,
      _parent: { $ref: compPkgId },
      name: c.name,
      documentation: c.desc
    };
    compModels[c.name] = uComp;
    compPkg.ownedElements.push(uComp);
  }

  const compDiagram = {
    _type: 'UMLComponentDiagram',
    _id: compDiagId,
    _parent: { $ref: compPkgId },
    name: '06 - Component Architecture Diagram',
    visible: true,
    ownedViews: []
  };

  components.forEach((c, idx) => {
    const uComp = compModels[c.name];
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 60 + col * 320;
    const y = 60 + row * 160;

    compDiagram.ownedViews.push({
      _type: 'UMLComponentView',
      _id: genId('CPV'),
      _parent: { $ref: compDiagId },
      model: { $ref: uComp._id },
      visible: true,
      font: 'Arial;12;0',
      left: x,
      top: y,
      width: 250,
      height: 90
    });
  });

  compPkg.ownedElements.push(compDiagram);
  model.ownedElements.push(compPkg);

  // ==========================================
  // 7. DEPLOYMENT PACKAGE & DIAGRAM
  // ==========================================
  const depPkgId = genId('PKG');
  const depDiagId = genId('DIA');
  const depPkg = {
    _type: 'UMLPackage',
    _id: depPkgId,
    _parent: { $ref: modelId },
    name: '07 - Deployment View',
    ownedElements: []
  };

  const nodes = [
    { name: 'Citizen Client Device (Desktop/Mobile)', stereotype: 'device' },
    { name: 'PSK Officer Workstation + Biometrics', stereotype: 'device' },
    { name: 'Vercel Global Edge Network & CDN', stereotype: 'executionEnvironment' },
    { name: 'Vercel Serverless Node.js Runtime', stereotype: 'executionEnvironment' },
    { name: 'Supabase PostgreSQL Managed Cluster', stereotype: 'database' },
    { name: 'External Payment Gateway (SBI ePay/UPI)', stereotype: 'cloud' }
  ];

  const nodeModels = {};
  for (const n of nodes) {
    const nId = genId('NOD');
    const uNode = {
      _type: 'UMLNode',
      _id: nId,
      _parent: { $ref: depPkgId },
      name: n.name,
      stereotype: n.stereotype
    };
    nodeModels[n.name] = uNode;
    depPkg.ownedElements.push(uNode);
  }

  const depDiagram = {
    _type: 'UMLDeploymentDiagram',
    _id: depDiagId,
    _parent: { $ref: depPkgId },
    name: '07 - Physical & Cloud Deployment Diagram',
    visible: true,
    ownedViews: []
  };

  nodes.forEach((n, idx) => {
    const uNode = nodeModels[n.name];
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 60 + col * 340;
    const y = 60 + row * 220;

    depDiagram.ownedViews.push({
      _type: 'UMLNodeView',
      _id: genId('NDV'),
      _parent: { $ref: depDiagId },
      model: { $ref: uNode._id },
      visible: true,
      font: 'Arial;12;0',
      left: x,
      top: y,
      width: 280,
      height: 150
    });
  });

  depPkg.ownedElements.push(depDiagram);
  model.ownedElements.push(depPkg);

  // ==========================================
  // 8. COLLABORATION / COMMUNICATION PACKAGE & DIAGRAM
  // ==========================================
  const commPkgId = genId('PKG');
  const commInteractionId = genId('INT');
  const commDiagId = genId('DIA');

  const commPkg = {
    _type: 'UMLPackage',
    _id: commPkgId,
    _parent: { $ref: modelId },
    name: '08 - Collaboration View',
    ownedElements: []
  };

  const commParticipants = [
    ':Citizen', 'portal:CitizenPortal', 'ctrl:ApplicationCtrl',
    'fsm:FSMEngine', 'fee:FeeEngine', 'officer:OfficerDesk', 'police:PoliceStation'
  ];

  const commLifelines = [];
  const commLifelineMap = {};

  for (const p of commParticipants) {
    const lId = genId('LFL');
    const uLifeline = {
      _type: 'UMLLifeline',
      _id: lId,
      _parent: { $ref: commInteractionId },
      name: p
    };
    commLifelines.push(uLifeline);
    commLifelineMap[p] = uLifeline;
  }

  const commInteraction = {
    _type: 'UMLInteraction',
    _id: commInteractionId,
    _parent: { $ref: commPkgId },
    name: 'Application Issuance Collaboration Flow',
    lifelines: commLifelines,
    messages: [
      {
        _type: 'UMLMessage',
        _id: genId('MSG'),
        _parent: { $ref: commInteractionId },
        name: '1: submitApplication()',
        source: { $ref: commLifelineMap[':Citizen']._id },
        target: { $ref: commLifelineMap['portal:CitizenPortal']._id }
      },
      {
        _type: 'UMLMessage',
        _id: genId('MSG'),
        _parent: { $ref: commInteractionId },
        name: '2: postApplication()',
        source: { $ref: commLifelineMap['portal:CitizenPortal']._id },
        target: { $ref: commLifelineMap['ctrl:ApplicationCtrl']._id }
      },
      {
        _type: 'UMLMessage',
        _id: genId('MSG'),
        _parent: { $ref: commInteractionId },
        name: '3: validateTransition()',
        source: { $ref: commLifelineMap['ctrl:ApplicationCtrl']._id },
        target: { $ref: commLifelineMap['fsm:FSMEngine']._id }
      },
      {
        _type: 'UMLMessage',
        _id: genId('MSG'),
        _parent: { $ref: commInteractionId },
        name: '4: calculateFee()',
        source: { $ref: commLifelineMap['ctrl:ApplicationCtrl']._id },
        target: { $ref: commLifelineMap['fee:FeeEngine']._id }
      },
      {
        _type: 'UMLMessage',
        _id: genId('MSG'),
        _parent: { $ref: commInteractionId },
        name: '5: verifyProofs()',
        source: { $ref: commLifelineMap['officer:OfficerDesk']._id },
        target: { $ref: commLifelineMap['fsm:FSMEngine']._id }
      },
      {
        _type: 'UMLMessage',
        _id: genId('MSG'),
        _parent: { $ref: commInteractionId },
        name: '6: routeToStation()',
        source: { $ref: commLifelineMap['fsm:FSMEngine']._id },
        target: { $ref: commLifelineMap['police:PoliceStation']._id }
      }
    ],
    ownedElements: []
  };

  const commDiagram = {
    _type: 'UMLCommunicationDiagram',
    _id: commDiagId,
    _parent: { $ref: commInteractionId },
    name: '08 - Application Processing Collaboration Diagram',
    visible: true,
    ownedViews: []
  };

  commLifelines.forEach((ll, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    commDiagram.ownedViews.push({
      _type: 'UMLCommLifelineView',
      _id: genId('CLV'),
      _parent: { $ref: commDiagId },
      model: { $ref: ll._id },
      visible: true,
      font: 'Arial;12;0',
      left: 60 + col * 260,
      top: 60 + row * 180,
      width: 200,
      height: 70
    });
  });

  commInteraction.ownedElements.push(commDiagram);
  commPkg.ownedElements.push(commInteraction);
  model.ownedElements.push(commPkg);

  return project;
}

const projectData = createStarUMLProject();
const outPath = path.resolve(process.cwd(), 'UML', 'passport-automation-system.mdj');
fs.writeFileSync(outPath, JSON.stringify(projectData, null, 2), 'utf8');

console.log(`Successfully generated StarUML Project (.mdj) at: ${outPath}`);
console.log(`File size: ${fs.statSync(outPath).size} bytes`);
