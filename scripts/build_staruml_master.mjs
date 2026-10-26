import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

let counter = 10000;
function genId(prefix = 'PAS') {
  const hex = (counter++).toString(16).padStart(8, '0');
  const rnd = crypto.randomBytes(6).toString('hex');
  return `AAAAAA${prefix}${hex}${rnd}`.slice(0, 24);
}

function buildMasterProject() {
  const projectId = genId('PRJ');
  const project = {
    _type: 'Project',
    _id: projectId,
    name: 'Passport Automation System',
    author: 'Passport Automation System Development Team',
    company: 'Ministry of External Affairs (Academic Simulation)',
    version: '2.5.0',
    ownedElements: []
  };

  // =========================================================================
  // 1. USE CASE MODEL
  // =========================================================================
  const ucModelId = genId('MDL');
  const ucModel = {
    _type: 'UMLModel',
    _id: ucModelId,
    _parent: { $ref: projectId },
    name: 'Use Case Model',
    ownedElements: []
  };

  const actorNames = [
    { name: 'Public Visitor', desc: 'Unauthenticated citizen browsing public portal' },
    { name: 'Citizen / Applicant', desc: 'Registered citizen applying for passport & scheduling' },
    { name: 'Passport Officer', desc: 'Verifying & Granting officer at PSK' },
    { name: 'Police Authority', desc: 'Jurisdictional police station verification authority' },
    { name: 'System Administrator', desc: 'System administrator managing master data' }
  ];

  const ucActors = {};
  for (const a of actorNames) {
    const actId = genId('ACT');
    ucActors[a.name] = {
      _type: 'UMLActor',
      _id: actId,
      _parent: { $ref: ucModelId },
      name: a.name,
      documentation: a.desc
    };
    ucModel.ownedElements.push(ucActors[a.name]);
  }

  const allUseCases = [
    'UC-01: Browse Services & Gazette Notices',
    'UC-02: Calculate Statutory Fees (GSR 516E)',
    'UC-03: Locate PSK / POPSK Centres',
    'UC-04: Track Application by ARN',
    'UC-05: Register Citizen Account',
    'UC-06: User Login & Session Auth',
    'UC-07: Reset Password via Email',
    'UC-08: Apply for Passport (Fresh/Reissue)',
    'UC-09: Provide Minor Consent Declaration',
    'UC-10: Upload Identity & Address Proofs',
    'UC-11: Pay Application Fee Online',
    'UC-12: Generate Digital Payment Receipt',
    'UC-13: Book PSK Appointment Slot',
    'UC-14: Reschedule PSK Appointment',
    'UC-15: Simulate PSK Counter Flow (A/B/C)',
    'UC-16: Submit Citizen Grievance',
    'UC-17: View Notifications & Alerts',
    'UC-18: Scrutinize Application Dossier',
    'UC-19: Verify Uploaded Documents',
    'UC-20: Request Applicant Clarification',
    'UC-21: Initiate Police Verification',
    'UC-22: Grant Application Approval',
    'UC-23: Issue Passport Booklet & Number',
    'UC-24: Dispatch Passport via India Post',
    'UC-25: Reject Application under Sec 6',
    'UC-26: View Jurisdictional Enquiry Queue',
    'UC-27: Conduct Address & Criminal Verification',
    'UC-28: Submit Police Verification Report (PVR)',
    'UC-29: Manage User Roles & Account States',
    'UC-30: Maintain Passport Services Registry',
    'UC-31: Manage PSK / POPSK Centres',
    'UC-32: Configure Statutory Fee Schedules',
    'UC-33: Publish Public Notices & Melas',
    'UC-34: Import Historical Notices (CSV/JSON)',
    'UC-35: Review Grievances & Provide Redress',
    'UC-36: Audit Logs & Security Sessions'
  ];

  const ucMap = {};
  for (const uc of allUseCases) {
    const uId = genId('UCS');
    ucMap[uc] = {
      _type: 'UMLUseCase',
      _id: uId,
      _parent: { $ref: ucModelId },
      name: uc
    };
    ucModel.ownedElements.push(ucMap[uc]);
  }

  const ucDiagId = genId('DIA');
  const ucDiagram = {
    _type: 'UMLUseCaseDiagram',
    _id: ucDiagId,
    _parent: { $ref: ucModelId },
    name: 'use-case',
    visible: true,
    defaultDiagram: true,
    ownedViews: []
  };

  const actorLayout = [
    { name: 'Public Visitor', x: 40, y: 80 },
    { name: 'Citizen / Applicant', x: 40, y: 380 },
    { name: 'System Administrator', x: 40, y: 780 },
    { name: 'Passport Officer', x: 1040, y: 240 },
    { name: 'Police Authority', x: 1040, y: 620 }
  ];

  for (const pos of actorLayout) {
    const act = ucActors[pos.name];
    if (act) {
      ucDiagram.ownedViews.push({
        _type: 'UMLActorView',
        _id: genId('AVW'),
        _parent: { $ref: ucDiagId },
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

  allUseCases.forEach((ucName, idx) => {
    const uc = ucMap[ucName];
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 200 + col * 400;
    const y = 50 + row * 62;

    ucDiagram.ownedViews.push({
      _type: 'UMLUseCaseView',
      _id: genId('UVW'),
      _parent: { $ref: ucDiagId },
      model: { $ref: uc._id },
      visible: true,
      font: 'Arial;11;0',
      left: x,
      top: y,
      width: 360,
      height: 48
    });
  });

  ucModel.ownedElements.push(ucDiagram);
  project.ownedElements.push(ucModel);

  // =========================================================================
  // 2. CLASS MODEL
  // =========================================================================
  const classModelId = genId('MDL');
  const classModel = {
    _type: 'UMLModel',
    _id: classModelId,
    _parent: { $ref: projectId },
    name: 'Class Model',
    ownedElements: []
  };

  const domainClasses = [
    {
      name: 'User',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'authUserId', type: 'String [Unique]' },
        { name: 'username', type: 'String [Unique]' },
        { name: 'email', type: 'String [Unique]' },
        { name: 'role', type: 'String = "APPLICANT"' },
        { name: 'isActive', type: 'Boolean = true' },
        { name: 'failedLoginAttempts', type: 'Int = 0' },
        { name: 'lockedUntil', type: 'DateTime?' },
        { name: 'lastLoginAt', type: 'DateTime?' },
        { name: 'createdAt', type: 'DateTime' },
        { name: 'updatedAt', type: 'DateTime' }
      ],
      ops: [
        { name: 'validatePassword(plainText: String) : Boolean' },
        { name: 'recordLoginSuccess(ip: String) : Void' },
        { name: 'recordLoginFailure() : Void' },
        { name: 'lockAccount(durationMinutes: Int) : Void' }
      ]
    },
    {
      name: 'Applicant',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'applicantId', type: 'String [Unique]' },
        { name: 'name', type: 'String' },
        { name: 'dob', type: 'DateTime' },
        { name: 'address', type: 'String' },
        { name: 'userId', type: 'Int [FK]' }
      ],
      ops: [
        { name: 'createApplication(service: String) : Application' },
        { name: 'uploadDocument(docType: String, file: File) : Document' },
        { name: 'scheduleAppointment(psk: String, slot: String) : Appointment' },
        { name: 'submitGrievance(subject: String, desc: String) : Grievance' }
      ]
    },
    {
      name: 'PassportOfficer',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'officerId', type: 'String [Unique]' },
        { name: 'branchLocation', type: 'String' },
        { name: 'userId', type: 'Int [FK]' }
      ],
      ops: [
        { name: 'scrutinizeApplication(appId: Int) : Void' },
        { name: 'verifyDocument(docId: Int, status: String) : Void' },
        { name: 'initiatePoliceVerification(appId: Int) : Void' },
        { name: 'grantApproval(appId: Int, remarks: String) : Void' },
        { name: 'issuePassportBooklet(appId: Int) : Passport' },
        { name: 'rejectApplication(appId: Int, reason: String) : Void' }
      ]
    },
    {
      name: 'Police',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'stationCode', type: 'String' },
        { name: 'badgeNumber', type: 'String [Unique]' },
        { name: 'userId', type: 'Int [FK]' }
      ],
      ops: [
        { name: 'fetchStationEnquiries(stationCode: String) : List<Application>' },
        { name: 'conductFieldEnquiry(appId: Int) : Void' },
        { name: 'submitPoliceReport(appId: Int, status: String, remarks: String) : PoliceReport' }
      ]
    },
    {
      name: 'Admin',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'adminCode', type: 'String [Unique]' },
        { name: 'userId', type: 'Int [FK]' }
      ],
      ops: [
        { name: 'updateUserRole(userId: Int, newRole: String) : Void' },
        { name: 'configurePassportCenter(centerData: Object) : PassportCenter' },
        { name: 'updateFeeSchedule(feeData: Object) : FeeSchedule' },
        { name: 'broadcastNotice(noticeData: Object) : Notice' },
        { name: 'resolveGrievance(ticketId: String, res: String) : Void' }
      ]
    },
    {
      name: 'Application',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'applicationId', type: 'String [Unique, ARN]' },
        { name: 'passportType', type: 'String = "REGULAR (36 Pages)"' },
        { name: 'serviceType', type: 'String = "FRESH"' },
        { name: 'applicationCategory', type: 'String = "NORMAL"' },
        { name: 'bookletType', type: 'String = "36_PAGES"' },
        { name: 'rpoLocation', type: 'String = "RPO Chennai"' },
        { name: 'status', type: 'String = "DRAFT"' },
        { name: 'submissionDate', type: 'DateTime?' },
        { name: 'givenName', type: 'String?' },
        { name: 'surname', type: 'String?' },
        { name: 'gender', type: 'String?' },
        { name: 'dob', type: 'DateTime?' },
        { name: 'placeOfBirth', type: 'String?' },
        { name: 'citizenship', type: 'String = "By Birth"' },
        { name: 'isMinor', type: 'Boolean = false' },
        { name: 'priority', type: 'String = "NORMAL"' },
        { name: 'pskStatus', type: 'String = "NOT_ARRIVED"' },
        { name: 'pskToken', type: 'String?' },
        { name: 'applicantId', type: 'Int [FK]' },
        { name: 'officerId', type: 'Int? [FK]' }
      ],
      ops: [
        { name: 'submit() : Void' },
        { name: 'transitionStatus(newStatus: String, actor: String) : Void' },
        { name: 'assignOfficer(officerId: Int) : Void' },
        { name: 'requestClarification(reason: String) : Void' },
        { name: 'recordCounterProgress(stage: String) : Void' }
      ]
    },
    {
      name: 'ApplicationStatusHistory',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'applicationId', type: 'Int [FK]' },
        { name: 'fromStatus', type: 'String' },
        { name: 'toStatus', type: 'String' },
        { name: 'remarks', type: 'String?' },
        { name: 'performedBy', type: 'String?' },
        { name: 'role', type: 'String = "SYSTEM"' },
        { name: 'changedAt', type: 'DateTime' }
      ],
      ops: []
    },
    {
      name: 'Document',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'docId', type: 'String [Unique]' },
        { name: 'documentType', type: 'String' },
        { name: 'fileStatus', type: 'String = "UPLOADED"' },
        { name: 'fileUrl', type: 'String?' },
        { name: 'fileName', type: 'String?' },
        { name: 'fileSize', type: 'Int?' },
        { name: 'verificationStatus', type: 'String = "PENDING"' },
        { name: 'verifiedBy', type: 'String?' },
        { name: 'uploadedAt', type: 'DateTime' },
        { name: 'applicationId', type: 'Int [FK]' }
      ],
      ops: [
        { name: 'markVerified(officerId: String) : Void' },
        { name: 'flagCorrection(reason: String) : Void' }
      ]
    },
    {
      name: 'Appointment',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'appointmentId', type: 'String [Unique]' },
        { name: 'quota', type: 'String = "NORMAL"' },
        { name: 'location', type: 'String' },
        { name: 'date', type: 'DateTime' },
        { name: 'timeSlot', type: 'String' },
        { name: 'status', type: 'String = "BOOKED"' },
        { name: 'rescheduleCount', type: 'Int = 0' },
        { name: 'applicationId', type: 'Int [FK, Unique]' }
      ],
      ops: [
        { name: 'reschedule(newDate: DateTime, newSlot: String) : Void' },
        { name: 'markCompleted() : Void' },
        { name: 'cancel() : Void' }
      ]
    },
    {
      name: 'AppointmentHistory',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'appointmentId', type: 'Int [FK]' },
        { name: 'previousDate', type: 'DateTime' },
        { name: 'previousSlot', type: 'String' },
        { name: 'newDate', type: 'DateTime' },
        { name: 'newSlot', type: 'String' },
        { name: 'location', type: 'String' },
        { name: 'rescheduledAt', type: 'DateTime' }
      ],
      ops: []
    },
    {
      name: 'Payment',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'transactionId', type: 'String [Unique]' },
        { name: 'amount', type: 'Float' },
        { name: 'baseFee', type: 'Float = 1500' },
        { name: 'status', type: 'String = "PENDING"' },
        { name: 'paymentMethod', type: 'String?' },
        { name: 'createdAt', type: 'DateTime' },
        { name: 'applicationId', type: 'Int [FK]' }
      ],
      ops: [
        { name: 'processTransaction(method: String) : Boolean' },
        { name: 'generateReceipt() : Object' }
      ]
    },
    {
      name: 'PoliceReport',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'reportId', type: 'String [Unique, PVR]' },
        { name: 'clearanceStatus', type: 'String' },
        { name: 'remarks', type: 'String?' },
        { name: 'stationCode', type: 'String?' },
        { name: 'verifiedAt', type: 'DateTime?' },
        { name: 'applicationId', type: 'Int [FK]' },
        { name: 'policeId', type: 'Int? [FK]' }
      ],
      ops: [
        { name: 'recordClearance(isClear: Boolean, remarks: String) : Void' }
      ]
    },
    {
      name: 'Passport',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'passportNumber', type: 'String [Unique]' },
        { name: 'issueDate', type: 'DateTime' },
        { name: 'expiryDate', type: 'DateTime' },
        { name: 'dispatchStatus', type: 'String = "PRINTING"' },
        { name: 'trackingNumber', type: 'String?' },
        { name: 'applicationId', type: 'Int [FK, Unique]' }
      ],
      ops: [
        { name: 'generatePassportNumber() : String' },
        { name: 'markPrinted() : Void' },
        { name: 'dispatchBooklet(trackingNo: String) : Void' }
      ]
    },
    {
      name: 'Grievance',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'ticketId', type: 'String [Unique]' },
        { name: 'category', type: 'String' },
        { name: 'subject', type: 'String' },
        { name: 'status', type: 'String = "OPEN"' },
        { name: 'response', type: 'String?' },
        { name: 'userId', type: 'Int [FK]' }
      ],
      ops: [
        { name: 'addResponse(reply: String, author: String) : Void' },
        { name: 'closeTicket() : Void' }
      ]
    },
    {
      name: 'PassportCenter',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'centerCode', type: 'String [Unique]' },
        { name: 'name', type: 'String' },
        { name: 'city', type: 'String' },
        { name: 'state', type: 'String' },
        { name: 'dailyCapacity', type: 'Int = 200' }
      ],
      ops: [
        { name: 'getAvailableSlots(date: DateTime) : List<String>' }
      ]
    },
    {
      name: 'FeeSchedule',
      attrs: [
        { name: 'id', type: 'Int [PK]' },
        { name: 'serviceType', type: 'String' },
        { name: 'normalFee', type: 'Float' },
        { name: 'tatkaalFee', type: 'Float?' },
        { name: 'gazetteReference', type: 'String' }
      ],
      ops: [
        { name: 'calculateFee(age: Int, category: String, pages: String) : Float' }
      ]
    }
  ];

  const classMap = {};
  for (const c of domainClasses) {
    const cId = genId('CLS');
    const uCls = {
      _type: 'UMLClass',
      _id: cId,
      _parent: { $ref: classModelId },
      name: c.name,
      attributes: c.attrs.map(a => ({
        _type: 'UMLAttribute',
        _id: genId('ATT'),
        _parent: { $ref: cId },
        name: a.name,
        type: a.type
      })),
      operations: c.ops.map(o => ({
        _type: 'UMLOperation',
        _id: genId('OPR'),
        _parent: { $ref: cId },
        name: o.name
      }))
    };
    classMap[c.name] = uCls;
    classModel.ownedElements.push(uCls);
  }

  const classDiagId = genId('DIA');
  const classDiagram = {
    _type: 'UMLClassDiagram',
    _id: classDiagId,
    _parent: { $ref: classModelId },
    name: 'class',
    visible: true,
    ownedViews: []
  };

  domainClasses.forEach((c, idx) => {
    const uCls = classMap[c.name];
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const x = 50 + col * 270;
    const y = 50 + row * 260;

    classDiagram.ownedViews.push({
      _type: 'UMLClassView',
      _id: genId('CVW'),
      _parent: { $ref: classDiagId },
      model: { $ref: uCls._id },
      visible: true,
      font: 'Arial;11;0',
      left: x,
      top: y,
      width: 250,
      height: 220
    });
  });

  classModel.ownedElements.push(classDiagram);
  project.ownedElements.push(classModel);

  // =========================================================================
  // 3. STATE MODELS (5 State Machines)
  // =========================================================================
  const stateModelId = genId('MDL');
  const stateModel = {
    _type: 'UMLModel',
    _id: stateModelId,
    _parent: { $ref: projectId },
    name: 'State Models',
    ownedElements: []
  };

  function addStateMachine(name, diagramName, states, transitions) {
    const smId = genId('STM');
    const rgnId = genId('RGN');
    const diagId = genId('DIA');
    const initId = genId('PSD');
    const finalId = genId('PSD');

    const sm = {
      _type: 'UMLStateMachine',
      _id: smId,
      _parent: { $ref: stateModelId },
      name: name,
      regions: [
        {
          _type: 'UMLRegion',
          _id: rgnId,
          _parent: { $ref: smId },
          name: `${name}Region`,
          vertices: [
            { _type: 'UMLPseudostate', _id: initId, _parent: { $ref: rgnId }, name: 'Initial', kind: 'initial' },
            { _type: 'UMLFinalState', _id: finalId, _parent: { $ref: rgnId }, name: 'Final' }
          ],
          transitions: []
        }
      ],
      ownedElements: []
    };

    const stMap = {};
    for (const st of states) {
      const sId = genId('STA');
      stMap[st] = {
        _type: 'UMLState',
        _id: sId,
        _parent: { $ref: rgnId },
        name: st
      };
      sm.regions[0].vertices.push(stMap[st]);
    }

    for (const tr of transitions) {
      const srcObj = tr[0] === 'Initial' ? { _id: initId } : stMap[tr[0]];
      const dstObj = tr[1] === 'Final' ? { _id: finalId } : stMap[tr[1]];
      if (srcObj && dstObj) {
        sm.regions[0].transitions.push({
          _type: 'UMLTransition',
          _id: genId('TRN'),
          _parent: { $ref: rgnId },
          name: tr[2] || '',
          source: { $ref: srcObj._id },
          target: { $ref: dstObj._id }
        });
      }
    }

    const diag = {
      _type: 'UMLStatechartDiagram',
      _id: diagId,
      _parent: { $ref: smId },
      name: diagramName,
      visible: true,
      ownedViews: [
        {
          _type: 'UMLPseudostateView',
          _id: genId('PVW'),
          _parent: { $ref: diagId },
          model: { $ref: initId },
          left: 40,
          top: 60,
          width: 25,
          height: 25
        }
      ]
    };

    states.forEach((st, idx) => {
      const uSt = stMap[st];
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      diag.ownedViews.push({
        _type: 'UMLStateView',
        _id: genId('SVW'),
        _parent: { $ref: diagId },
        model: { $ref: uSt._id },
        visible: true,
        font: 'Arial;11;0',
        left: 90 + col * 260,
        top: 50 + row * 110,
        width: 220,
        height: 60
      });
    });

    sm.ownedElements.push(diag);
    stateModel.ownedElements.push(sm);
  }

  // 3.1 Application State Chart
  addStateMachine(
    'Application State Machine',
    'application-state-chart',
    [
      'DRAFT', 'SUBMITTED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING',
      'PAYMENT_COMPLETED', 'APPOINTMENT_BOOKED', 'DOCUMENT_VERIFICATION',
      'CLARIFICATION_REQUIRED', 'DOCUMENT_VERIFIED', 'POLICE_VERIFICATION_PENDING',
      'POLICE_VERIFICATION_COMPLETED', 'OFFICER_REVIEW', 'APPROVED',
      'PRINTING', 'DISPATCHED', 'DELIVERED', 'REJECTED', 'CANCELLED'
    ],
    [
      ['Initial', 'DRAFT', 'Initiate application'],
      ['DRAFT', 'SUBMITTED', 'Form signed'],
      ['SUBMITTED', 'PAYMENT_PENDING', 'Calculate fee'],
      ['PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'Initiate payment'],
      ['PAYMENT_PROCESSING', 'PAYMENT_COMPLETED', 'Payment SUCCESS'],
      ['PAYMENT_COMPLETED', 'APPOINTMENT_BOOKED', 'Slot reserved'],
      ['APPOINTMENT_BOOKED', 'DOCUMENT_VERIFICATION', 'Counter A check-in'],
      ['DOCUMENT_VERIFICATION', 'CLARIFICATION_REQUIRED', 'Deficient proofs'],
      ['CLARIFICATION_REQUIRED', 'DOCUMENT_VERIFICATION', 'Upload corrected'],
      ['DOCUMENT_VERIFICATION', 'DOCUMENT_VERIFIED', 'Proofs approved'],
      ['DOCUMENT_VERIFIED', 'POLICE_VERIFICATION_PENDING', 'Route to police'],
      ['POLICE_VERIFICATION_PENDING', 'POLICE_VERIFICATION_COMPLETED', 'PVR submitted'],
      ['POLICE_VERIFICATION_COMPLETED', 'OFFICER_REVIEW', 'Counter C review'],
      ['OFFICER_REVIEW', 'APPROVED', 'Grant passport'],
      ['APPROVED', 'PRINTING', 'Security printing'],
      ['PRINTING', 'DISPATCHED', 'India Post dispatch'],
      ['DISPATCHED', 'DELIVERED', 'Delivered to citizen'],
      ['DELIVERED', 'Final', 'Complete']
    ]
  );

  // 3.2 Appointment State Chart
  addStateMachine(
    'Appointment State Machine',
    'appointment-state-chart',
    ['INITIAL', 'BOOKED', 'RESCHEDULED', 'CANCELLED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW'],
    [
      ['Initial', 'INITIAL', 'Fee paid'],
      ['INITIAL', 'BOOKED', 'Select PSK & slot'],
      ['BOOKED', 'RESCHEDULED', 'Modify slot [count < 3]'],
      ['RESCHEDULED', 'BOOKED', 'Confirmed'],
      ['BOOKED', 'CHECKED_IN', 'Counter A check-in'],
      ['CHECKED_IN', 'COMPLETED', 'PSK completed'],
      ['BOOKED', 'CANCELLED', 'Citizen cancel'],
      ['BOOKED', 'NO_SHOW', 'Absent on date'],
      ['COMPLETED', 'Final', 'Done']
    ]
  );

  // 3.3 Document State Chart
  addStateMachine(
    'Document State Machine',
    'document-state-chart',
    ['UPLOADED', 'PENDING_VERIFICATION', 'UNDER_SCRUTINY', 'VERIFIED', 'CORRECTION_REQUIRED', 'REJECTED', 'ARCHIVED'],
    [
      ['Initial', 'UPLOADED', 'Citizen uploads scan'],
      ['UPLOADED', 'PENDING_VERIFICATION', 'Attached to application'],
      ['PENDING_VERIFICATION', 'UNDER_SCRUTINY', 'Counter B opens file'],
      ['UNDER_SCRUTINY', 'VERIFIED', 'Matches original'],
      ['UNDER_SCRUTINY', 'CORRECTION_REQUIRED', 'Illegible proof'],
      ['CORRECTION_REQUIRED', 'UPLOADED', 'Re-uploaded'],
      ['UNDER_SCRUTINY', 'REJECTED', 'Fraud detected'],
      ['VERIFIED', 'ARCHIVED', 'Case finished'],
      ['ARCHIVED', 'Final', 'Stored']
    ]
  );

  // 3.4 Police Verification State Chart
  addStateMachine(
    'Police Verification State Machine',
    'police-verification-state-chart',
    ['INITIATED', 'PENDING', 'IN_PROGRESS', 'CLARIFICATION_REQUIRED', 'CLEARED', 'ADVERSE', 'TRANSMITTED_TO_RPO'],
    [
      ['Initial', 'INITIATED', 'Counter B passed'],
      ['INITIATED', 'PENDING', 'Arrived at station'],
      ['PENDING', 'IN_PROGRESS', 'Field officer assigned'],
      ['IN_PROGRESS', 'CLARIFICATION_REQUIRED', 'Applicant unavailable'],
      ['CLARIFICATION_REQUIRED', 'IN_PROGRESS', 'Re-enquiry'],
      ['IN_PROGRESS', 'CLEARED', 'Clean enquiry'],
      ['IN_PROGRESS', 'ADVERSE', 'Criminal record'],
      ['CLEARED', 'TRANSMITTED_TO_RPO', 'Transmit clear'],
      ['ADVERSE', 'TRANSMITTED_TO_RPO', 'Transmit adverse'],
      ['TRANSMITTED_TO_RPO', 'Final', 'Attached to dossier']
    ]
  );

  // 3.5 Grievance State Chart
  addStateMachine(
    'Grievance State Machine',
    'grievance-state-chart',
    ['OPEN', 'IN_REVIEW', 'RESPONDED', 'RESOLVED', 'CLOSED'],
    [
      ['Initial', 'OPEN', 'Ticket lodged'],
      ['OPEN', 'IN_REVIEW', 'Officer assigned'],
      ['IN_REVIEW', 'RESPONDED', 'Interim update'],
      ['RESPONDED', 'IN_REVIEW', 'Citizen feedback'],
      ['IN_REVIEW', 'RESOLVED', 'Redressal enacted'],
      ['RESOLVED', 'CLOSED', 'Citizen satisfied'],
      ['CLOSED', 'Final', 'Closed']
    ]
  );

  project.ownedElements.push(stateModel);

  // =========================================================================
  // 4. INTERACTION MODELS (6 Sequences)
  // =========================================================================
  const seqModelId = genId('MDL');
  const seqModel = {
    _type: 'UMLModel',
    _id: seqModelId,
    _parent: { $ref: projectId },
    name: 'Interaction Models',
    ownedElements: []
  };

  function addSequenceDiagram(name, diagramName, lifelinesData, messagesData) {
    const intId = genId('INT');
    const diagId = genId('DIA');

    const lifelines = [];
    const llMap = {};
    for (const ll of lifelinesData) {
      const lId = genId('LFL');
      const uLl = {
        _type: 'UMLLifeline',
        _id: lId,
        _parent: { $ref: intId },
        name: ll
      };
      lifelines.push(uLl);
      llMap[ll] = uLl;
    }

    const messages = [];
    for (const m of messagesData) {
      const src = llMap[m[0]];
      const dst = llMap[m[1]];
      if (src && dst) {
        messages.push({
          _type: 'UMLMessage',
          _id: genId('MSG'),
          _parent: { $ref: intId },
          name: m[2],
          source: { $ref: src._id },
          target: { $ref: dst._id }
        });
      }
    }

    const interaction = {
      _type: 'UMLInteraction',
      _id: intId,
      _parent: { $ref: seqModelId },
      name: name,
      lifelines,
      messages,
      ownedElements: []
    };

    const diag = {
      _type: 'UMLSequenceDiagram',
      _id: diagId,
      _parent: { $ref: intId },
      name: diagramName,
      visible: true,
      ownedViews: []
    };

    lifelines.forEach((ll, idx) => {
      diag.ownedViews.push({
        _type: 'UMLSeqLifelineView',
        _id: genId('LVW'),
        _parent: { $ref: diagId },
        model: { $ref: ll._id },
        visible: true,
        font: 'Arial;11;0',
        left: 50 + idx * 165,
        top: 50,
        width: 135,
        height: 480
      });
    });

    interaction.ownedElements.push(diag);
    seqModel.ownedElements.push(interaction);
  }

  // 4.1 Registration Sequence
  addSequenceDiagram(
    'Registration Interaction',
    'registration-sequence',
    ['Citizen', 'ClientUI', 'AuthAPI', 'Security', 'PrismaClient', 'Database', 'Mailer'],
    [
      ['Citizen', 'ClientUI', '1: Fill Registration Form'],
      ['ClientUI', 'AuthAPI', '2: POST /api/auth/register'],
      ['AuthAPI', 'Security', '3: verifyCaptcha(token)'],
      ['AuthAPI', 'Security', '4: hash(password, 10)'],
      ['AuthAPI', 'PrismaClient', '5: $transaction(User + Applicant)'],
      ['PrismaClient', 'Database', '6: INSERT User & Applicant'],
      ['AuthAPI', 'Mailer', '7: sendWelcomeEmail()'],
      ['AuthAPI', 'ClientUI', '8: 201 Created'],
      ['ClientUI', 'Citizen', '9: Redirect to Login']
    ]
  );

  // 4.2 Application Sequence
  addSequenceDiagram(
    'Application Submission Interaction',
    'application-sequence',
    ['Citizen', 'ApplyWizard', 'ApplicationAPI', 'AuthGuard', 'FSMEngine', 'FeeEngine', 'PrismaClient', 'Database'],
    [
      ['Citizen', 'ApplyWizard', '1: Submit Form'],
      ['ApplyWizard', 'ApplicationAPI', '2: POST /api/applications'],
      ['ApplicationAPI', 'AuthGuard', '3: verifySession()'],
      ['ApplicationAPI', 'FSMEngine', '4: canTransition(DRAFT, SUBMITTED)'],
      ['ApplicationAPI', 'FeeEngine', '5: calculateStatutoryFee()'],
      ['ApplicationAPI', 'PrismaClient', '6: $transaction(save Application)'],
      ['PrismaClient', 'Database', '7: INSERT Application & History'],
      ['ApplicationAPI', 'ApplyWizard', '8: 201 Created { ARN, feeAmount }'],
      ['ApplyWizard', 'Citizen', '9: Render Submission Receipt']
    ]
  );

  // 4.3 Payment Sequence
  addSequenceDiagram(
    'Fee Payment Interaction',
    'payment-sequence',
    ['Citizen', 'PaymentModal', 'PaymentAPI', 'Gateway', 'FSMEngine', 'PrismaClient', 'Database', 'Notify'],
    [
      ['Citizen', 'PaymentModal', '1: Select Payment Method'],
      ['PaymentModal', 'PaymentAPI', '2: POST /api/payments'],
      ['PaymentAPI', 'Gateway', '3: createOrder()'],
      ['Gateway', 'Citizen', '4: Authorize UPI/NetBanking'],
      ['Citizen', 'PaymentAPI', '5: verifySignature()'],
      ['PaymentAPI', 'FSMEngine', '6: canTransition(PAY_PENDING, PAY_COMPLETED)'],
      ['PaymentAPI', 'PrismaClient', '7: UPDATE Payment & Application'],
      ['PaymentAPI', 'Notify', '8: sendReceiptAlert()'],
      ['PaymentAPI', 'PaymentModal', '9: 200 OK (Payment Verified)']
    ]
  );

  // 4.4 Appointment Sequence
  addSequenceDiagram(
    'Appointment Booking Interaction',
    'appointment-sequence',
    ['Citizen', 'ApptPage', 'AppointmentAPI', 'SlotManager', 'FSMEngine', 'PrismaClient', 'Database'],
    [
      ['Citizen', 'ApptPage', '1: View Available Slots'],
      ['ApptPage', 'AppointmentAPI', '2: GET /api/appointments/slots'],
      ['AppointmentAPI', 'SlotManager', '3: getAvailableSlots()'],
      ['Citizen', 'ApptPage', '4: Select Slot & Confirm'],
      ['ApptPage', 'AppointmentAPI', '5: POST /api/appointments'],
      ['AppointmentAPI', 'SlotManager', '6: generateToken()'],
      ['AppointmentAPI', 'FSMEngine', '7: canTransition(PAY_COMPLETED, APPT_BOOKED)'],
      ['AppointmentAPI', 'PrismaClient', '8: INSERT Appointment'],
      ['AppointmentAPI', 'ApptPage', '9: 201 Created { TokenNumber }']
    ]
  );

  // 4.5 Police Verification Sequence
  addSequenceDiagram(
    'Police Verification Interaction',
    'police-verification-sequence',
    ['PoliceOfficer', 'Citizen', 'PolicePortal', 'PoliceAPI', 'CCTNSDB', 'FSMEngine', 'PrismaClient', 'Database'],
    [
      ['PoliceOfficer', 'PolicePortal', '1: View Assigned Station Cases'],
      ['PolicePortal', 'PoliceAPI', '2: GET /api/police/pending'],
      ['PoliceOfficer', 'Citizen', '3: Physical Address Enquiry'],
      ['PoliceOfficer', 'CCTNSDB', '4: Check Criminal Record'],
      ['PoliceOfficer', 'PolicePortal', '5: Submit PVR (CLEARED/ADVERSE)'],
      ['PolicePortal', 'PoliceAPI', '6: POST /api/police/reports'],
      ['PoliceAPI', 'FSMEngine', '7: updateStatus(POLICE_VERIFICATION_COMPLETED)'],
      ['PoliceAPI', 'PrismaClient', '8: UPDATE PoliceReport & Application'],
      ['PoliceAPI', 'PolicePortal', '9: 200 OK (PVR Transmitted to RPO)']
    ]
  );

  // 4.6 Application Tracking Sequence
  addSequenceDiagram(
    'Application Tracking Interaction',
    'tracking-sequence',
    ['Citizen', 'TrackPage', 'TrackAPI', 'Security', 'PrismaClient', 'Database', 'IndiaPost'],
    [
      ['Citizen', 'TrackPage', '1: Enter ARN, DOB, Captcha'],
      ['TrackPage', 'TrackAPI', '2: GET /api/applications/track'],
      ['TrackAPI', 'Security', '3: verifyCaptcha()'],
      ['TrackAPI', 'PrismaClient', '4: findApplicationWithRelations()'],
      ['PrismaClient', 'Database', '5: SELECT Application & History'],
      ['TrackAPI', 'IndiaPost', '6: getSpeedPostConsignmentStatus()'],
      ['TrackAPI', 'TrackPage', '7: 200 OK { Stage, History, PostalStatus }'],
      ['TrackPage', 'Citizen', '8: Render Progress Stepper & Milestones']
    ]
  );

  project.ownedElements.push(seqModel);

  // =========================================================================
  // 5. OBJECT MODEL
  // =========================================================================
  const objModelId = genId('MDL');
  const objModel = {
    _type: 'UMLModel',
    _id: objModelId,
    _parent: { $ref: projectId },
    name: 'Object Model',
    ownedElements: []
  };

  const objList = [
    { name: 'usr_9041 : User', classifier: 'User' },
    { name: 'app_8210 : Applicant', classifier: 'Applicant' },
    { name: 'pas_app_501 : Application', classifier: 'Application' },
    { name: 'pay_301 : Payment', classifier: 'Payment' },
    { name: 'appt_401 : Appointment', classifier: 'Appointment' },
    { name: 'psk_dl01 : PassportCenter', classifier: 'PassportCenter' },
    { name: 'doc_101 : Document', classifier: 'Document' },
    { name: 'doc_102 : Document', classifier: 'Document' },
    { name: 'pol_801 : Police', classifier: 'Police' },
    { name: 'pvr_201 : PoliceReport', classifier: 'PoliceReport' },
    { name: 'off_102 : PassportOfficer', classifier: 'PassportOfficer' },
    { name: 'pass_701 : Passport', classifier: 'Passport' }
  ];

  const objMap = {};
  for (const o of objList) {
    const oId = genId('OBJ');
    objMap[o.name] = {
      _type: 'UMLObject',
      _id: oId,
      _parent: { $ref: objModelId },
      name: o.name
    };
    objModel.ownedElements.push(objMap[o.name]);
  }

  const objDiagId = genId('DIA');
  const objDiagram = {
    _type: 'UMLObjectDiagram',
    _id: objDiagId,
    _parent: { $ref: objModelId },
    name: 'object',
    visible: true,
    ownedViews: []
  };

  objList.forEach((o, idx) => {
    const uObj = objMap[o.name];
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    objDiagram.ownedViews.push({
      _type: 'UMLObjectView',
      _id: genId('OVW'),
      _parent: { $ref: objDiagId },
      model: { $ref: uObj._id },
      visible: true,
      font: 'Arial;11;0',
      left: 60 + col * 320,
      top: 60 + row * 160,
      width: 260,
      height: 100
    });
  });

  objModel.ownedElements.push(objDiagram);
  project.ownedElements.push(objModel);

  // =========================================================================
  // 6. COMPONENT MODEL
  // =========================================================================
  const compModelId = genId('MDL');
  const compModel = {
    _type: 'UMLModel',
    _id: compModelId,
    _parent: { $ref: projectId },
    name: 'Component Model',
    ownedElements: []
  };

  const compList = [
    'CitizenPortalUI', 'OfficerDeskUI', 'PoliceStationUI', 'AdminDashboardUI',
    'NextJsAPIRoutes', 'FSMEngine', 'FeeEngine', 'SlotManager',
    'PrismaORMClient', 'RelationalDatabase', 'PaymentGateway', 'IndiaPostLogistics'
  ];

  const compMap = {};
  for (const c of compList) {
    const cId = genId('CMP');
    compMap[c] = {
      _type: 'UMLComponent',
      _id: cId,
      _parent: { $ref: compModelId },
      name: c
    };
    compModel.ownedElements.push(compMap[c]);
  }

  const compDiagId = genId('DIA');
  const compDiagram = {
    _type: 'UMLComponentDiagram',
    _id: compDiagId,
    _parent: { $ref: compModelId },
    name: 'component',
    visible: true,
    ownedViews: []
  };

  compList.forEach((c, idx) => {
    const uC = compMap[c];
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    compDiagram.ownedViews.push({
      _type: 'UMLComponentView',
      _id: genId('CPV'),
      _parent: { $ref: compDiagId },
      model: { $ref: uC._id },
      visible: true,
      font: 'Arial;11;0',
      left: 60 + col * 260,
      top: 60 + row * 170,
      width: 220,
      height: 90
    });
  });

  compModel.ownedElements.push(compDiagram);
  project.ownedElements.push(compModel);

  // =========================================================================
  // 7. DEPLOYMENT MODEL
  // =========================================================================
  const depModelId = genId('MDL');
  const depModel = {
    _type: 'UMLModel',
    _id: depModelId,
    _parent: { $ref: projectId },
    name: 'Deployment Model',
    ownedElements: []
  };

  const nodeList = [
    { name: 'Citizen Client Device (Desktop/Mobile)', stereotype: 'device' },
    { name: 'PSK Workstation + Biometric Scanner', stereotype: 'device' },
    { name: 'Police Station Terminal', stereotype: 'device' },
    { name: 'Vercel Global Edge Network & CDN', stereotype: 'executionEnvironment' },
    { name: 'Vercel Serverless Node.js Runtime', stereotype: 'executionEnvironment' },
    { name: 'Supabase PostgreSQL Managed Cluster', stereotype: 'database' },
    { name: 'External Payment Gateway (SBI ePay/UPI)', stereotype: 'cloud' },
    { name: 'India Post Logistics Network', stereotype: 'cloud' }
  ];

  const nodeMap = {};
  for (const n of nodeList) {
    const nId = genId('NOD');
    nodeMap[n.name] = {
      _type: 'UMLNode',
      _id: nId,
      _parent: { $ref: depModelId },
      name: n.name,
      stereotype: n.stereotype
    };
    depModel.ownedElements.push(nodeMap[n.name]);
  }

  const depDiagId = genId('DIA');
  const depDiagram = {
    _type: 'UMLDeploymentDiagram',
    _id: depDiagId,
    _parent: { $ref: depModelId },
    name: 'deployment',
    visible: true,
    ownedViews: []
  };

  nodeList.forEach((n, idx) => {
    const uN = nodeMap[n.name];
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    depDiagram.ownedViews.push({
      _type: 'UMLNodeView',
      _id: genId('NDV'),
      _parent: { $ref: depDiagId },
      model: { $ref: uN._id },
      visible: true,
      font: 'Arial;11;0',
      left: 60 + col * 340,
      top: 60 + row * 220,
      width: 280,
      height: 150
    });
  });

  depModel.ownedElements.push(depDiagram);
  project.ownedElements.push(depModel);

  // =========================================================================
  // 8. COMMUNICATION MODEL
  // =========================================================================
  const commModelId = genId('MDL');
  const commModel = {
    _type: 'UMLModel',
    _id: commModelId,
    _parent: { $ref: projectId },
    name: 'Communication Model',
    ownedElements: []
  };

  const commIntId = genId('INT');
  const commDiagId = genId('DIA');

  const commActors = [
    ':Citizen', 'portal:CitizenPortal', 'ctrl:ApplicationCtrl',
    'fsm:FSMEngine', 'fee:FeeEngine', 'officer:OfficerDesk', 'police:PoliceStation'
  ];

  const commLifelines = [];
  const commMap = {};
  for (const ca of commActors) {
    const lId = genId('LFL');
    const uL = {
      _type: 'UMLLifeline',
      _id: lId,
      _parent: { $ref: commIntId },
      name: ca
    };
    commLifelines.push(uL);
    commMap[ca] = uL;
  }

  const commInteraction = {
    _type: 'UMLInteraction',
    _id: commIntId,
    _parent: { $ref: commModelId },
    name: 'Collaboration Flow',
    lifelines: commLifelines,
    messages: [
      {
        _type: 'UMLMessage',
        _id: genId('MSG'),
        _parent: { $ref: commIntId },
        name: '1: submitApplication()',
        source: { $ref: commMap[':Citizen']._id },
        target: { $ref: commMap['portal:CitizenPortal']._id }
      },
      {
        _type: 'UMLMessage',
        _id: genId('MSG'),
        _parent: { $ref: commIntId },
        name: '2: postApplication()',
        source: { $ref: commMap['portal:CitizenPortal']._id },
        target: { $ref: commMap['ctrl:ApplicationCtrl']._id }
      },
      {
        _type: 'UMLMessage',
        _id: genId('MSG'),
        _parent: { $ref: commIntId },
        name: '3: validateTransition()',
        source: { $ref: commMap['ctrl:ApplicationCtrl']._id },
        target: { $ref: commMap['fsm:FSMEngine']._id }
      },
      {
        _type: 'UMLMessage',
        _id: genId('MSG'),
        _parent: { $ref: commIntId },
        name: '4: calculateFee()',
        source: { $ref: commMap['ctrl:ApplicationCtrl']._id },
        target: { $ref: commMap['fee:FeeEngine']._id }
      },
      {
        _type: 'UMLMessage',
        _id: genId('MSG'),
        _parent: { $ref: commIntId },
        name: '5: verifyProofs()',
        source: { $ref: commMap['officer:OfficerDesk']._id },
        target: { $ref: commMap['fsm:FSMEngine']._id }
      },
      {
        _type: 'UMLMessage',
        _id: genId('MSG'),
        _parent: { $ref: commIntId },
        name: '6: submitPVR(CLEARED)',
        source: { $ref: commMap['police:PoliceStation']._id },
        target: { $ref: commMap['fsm:FSMEngine']._id }
      }
    ],
    ownedElements: []
  };

  const commDiagram = {
    _type: 'UMLCommunicationDiagram',
    _id: commDiagId,
    _parent: { $ref: commIntId },
    name: 'collaboration',
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
      font: 'Arial;11;0',
      left: 60 + col * 260,
      top: 60 + row * 180,
      width: 200,
      height: 70
    });
  });

  commInteraction.ownedElements.push(commDiagram);
  commModel.ownedElements.push(commInteraction);
  project.ownedElements.push(commModel);

  return project;
}

// Write project file to UML/StarUML/Passport-Automation-System.mdj
const starUmlDir = path.resolve(process.cwd(), 'UML', 'StarUML');
if (!fs.existsSync(starUmlDir)) {
  fs.mkdirSync(starUmlDir, { recursive: true });
}

const masterProj = buildMasterProject();
const projFile = path.join(starUmlDir, 'Passport-Automation-System.mdj');
fs.writeFileSync(projFile, JSON.stringify(masterProj, null, 2), 'utf8');

console.log(`Generated master StarUML file: ${projFile}`);
console.log(`File size: ${fs.statSync(projFile).size} bytes`);
