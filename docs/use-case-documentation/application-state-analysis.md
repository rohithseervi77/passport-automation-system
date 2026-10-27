# Application Lifecycle and State Machine Analysis

## 1. Architectural Overview of the Passport Finite State Machine (FSM)

The passport issuance lifecycle under the Indian Passports Act, 1967 is a strictly regulated administrative process. In the **Passport Automation System (PAS)**, this lifecycle is governed by a centralized **Finite State Machine (FSM)** implemented in `lib/fsm.ts`.

The FSM guarantees:
1. **Deterministic State Transitions:** An application can only advance through legally permitted state transitions (`ALLOWED_TRANSITIONS` lookup dictionary).
2. **Role-Based Transition Guards:** Specific state transitions can only be triggered by authorized actors (e.g., only a `PassportOfficer` can approve an application, and only a `Police` authority can clear a police report).
3. **Audit Immutability:** Every transition automatically generates an entry in the `ApplicationStatusHistory` ledger, preserving the timestamp, acting user ID, and regulatory justification.
4. **Milestone Mapping:** All 37 discrete internal statuses map deterministically into **8 citizen-facing milestone stages** (`stageIndex: 0` to `7`) for public tracking.

---

## 2. All 37 Application Statuses and Citizen Milestone Stages

The system defines 37 discrete status constants in `lib/fsm.ts`:

| State Constant | Citizen Label | Milestone Stage | Description |
| :--- | :--- | :---: | :--- |
| `DRAFT` | Draft | Stage 0 | Application being composed by applicant; biographical edits unlocked. |
| `SUBMITTED` | Submitted | Stage 1 | Form finalized and submitted online; biographical fields locked. |
| `PAYMENT_PENDING` | Payment Pending | Stage 1 | Statutory fee calculated under GSR 516(E); awaiting payment gateway settlement. |
| `PAYMENT_PROCESSING` | Payment Processing | Stage 1 | Payment gateway transaction initiated; awaiting bank webhook/callback. |
| `PAYMENT_FAILED` | Payment Failed | Stage 1 | Gateway declined, timed out, or rejected transaction; retry permitted. |
| `PAYMENT_COMPLETED` | Payment Completed | Stage 1 | Fee settled successfully; appointment booking quota unlocked. |
| `APPOINTMENT_PENDING` | Appointment Pending | Stage 1 | Awaiting citizen selection of PSK centre, date, and slot. |
| `APPOINTMENT_BOOKED` | Appointment Scheduled | Stage 2 | PSK slot reserved; queue token and appointment slip generated. |
| `APPOINTMENT_SCHEDULED` | Appointment Scheduled | Stage 2 | Synonymous milestone indicating active confirmed PSK slot. |
| `APPOINTMENT_COMPLETED` | PSK Arrival Completed | Stage 2 | Citizen checked in at PSK Counter A; biometrics captured. |
| `DOCUMENT_VERIFICATION` | Document Verification | Stage 3 | Verifying Officer at Counter B scrutinizing original certificates. |
| `DOCUMENT_REVIEW` | Document Under Review | Stage 3 | Dossier queued in Counter B scrutiny portal. |
| `DOCUMENT_CORRECTION_REQUIRED` | Correction Required | Stage 3 | Illegible or deficient proofs detected; replacement upload slot opened. |
| `DOCUMENT_VERIFIED` | Documents Verified | Stage 3 | Counter B approves all mandatory KYC proofs; biometrics locked. |
| `UNDER_OFFICER_VERIFICATION`| Under Scrutiny | Stage 3 | Intermediate state during physical counter verification. |
| `POLICE_VERIFICATION_PENDING` | Police Verification Pending | Stage 4 | Electronic dossier transmitted to jurisdictional Police Station. |
| `POLICE_VERIFICATION_ASSIGNED`| Police Enquiry Assigned | Stage 4 | Station In-Charge assigned case to Field Verification Officer. |
| `POLICE_VERIFICATION_IN_PROGRESS`| Police Enquiry in Progress| Stage 4 | Field officer conducting site visit and witness interviews. |
| `POLICE_VERIFICATION_COMPLETED`| Police Report Received | Stage 4 | Electronic PVR submitted; attached to RPO application dossier. |
| `POLICE_CLEARED` | Police Clearance Granted | Stage 4 | Favourable PVR confirmed (zero criminal records, address verified). |
| `POLICE_VERIFICATION_FAILED` | Police Verification Adverse| Stage 4 | Adverse PVR submitted (FIR found, disputed residence, or non-citizen).|
| `CLARIFICATION_REQUIRED` | Clarification Required | Stage 5 | Action required: Passport Office demands additional affidavits or proofs. |
| `OFFICER_REVIEW` | Under Officer Review | Stage 5 | Senior Granting Officer (Counter C) evaluating statutory eligibility under Sec 6. |
| `FINAL_REVIEW` | Final Review | Stage 5 | Final evaluation before formal grant or refusal order. |
| `APPROVED` | Passport Approved | Stage 6 | Granting Officer signs approval; unique passport number generated. |
| `PRINTING` | Passport Printing | Stage 6 | Dossier queued for secure laser engraving and contactless chip encoding. |
| `PASSPORT_PRINTING` | Security Printing | Stage 6 | Physical passport booklet currently inside personalization printer. |
| `PASSPORT_ISSUED` | Passport Booklet Issued | Stage 6 | Booklet personalization quality inspection passed. |
| `DISPATCHED` | Dispatched via Speed Post | Stage 7 | Handed over to India Post; Speed Post barcode active. |
| `PASSPORT_DISPATCHED` | In Postal Transit | Stage 7 | Speed Post consignment in transit through National Sorting Hub (NSH). |
| `DELIVERED` | Delivered | Stage 7 | Physical consignment delivered to applicant's present address. |
| `COMPLETED` | Service Completed | Stage 7 | Terminal state: travel document successfully in citizen custody. |
| `REJECTED` | Application Rejected | Stage 5 | Terminal state: formal refusal order issued under Section 6 of Passports Act. |
| `CANCELLED` | Application Cancelled | Stage 0/1 | Terminal state: citizen explicitly withdrew application before processing. |
| `ON_HOLD` | On Hold | Stage 3/5 | Processing suspended pending court order, vigilance inquiry, or gazette review. |
| `EXPIRED` | Application Expired | Stage 1 | Fee unpaid or appointment abandoned beyond statutory limitation window. |

---

## 3. State Transition Matrix

The table below catalogs every legal state transition enforced by `lib/fsm.ts`:

| Current State | Triggering Event / Action | Next State | Authorized Actor |
| :--- | :--- | :--- | :--- |
| `DRAFT` | Citizen finalizes and submits application form | `SUBMITTED` | Citizen / Applicant |
| `DRAFT` | System assesses statutory fees upon submission | `PAYMENT_PENDING` | System Engine |
| `DRAFT` | Citizen abandons or withdraws draft | `CANCELLED` | Citizen / Applicant |
| `SUBMITTED` | Fee engine computes statutory rate | `PAYMENT_PENDING` | System Engine |
| `SUBMITTED` | Direct payment flow confirmation | `PAYMENT_COMPLETED` | System / Payment Gateway |
| `SUBMITTED` | Exemption category / fee waiver applied | `APPOINTMENT_PENDING` | System Administrator |
| `SUBMITTED` | Immediate PSK slot allocation | `APPOINTMENT_BOOKED` | Citizen / Applicant |
| `SUBMITTED` | Prior fee clearance detected | `DOCUMENT_VERIFICATION` | Passport Officer |
| `SUBMITTED` | Prior scrutiny exemption (PCC scheme) | `POLICE_VERIFICATION_PENDING` | Passport Officer |
| `SUBMITTED` | Statutory disqualification detected on form face | `REJECTED` | Passport Officer |
| `SUBMITTED` | Citizen cancels application | `CANCELLED` | Citizen / Applicant |
| `PAYMENT_PENDING` | Citizen initiates gateway transaction | `PAYMENT_PROCESSING` | Citizen / Applicant |
| `PAYMENT_PENDING` | Gateway confirms successful transaction | `PAYMENT_COMPLETED` | Payment Gateway / System |
| `PAYMENT_PENDING` | Gateway declines or times out | `PAYMENT_FAILED` | Payment Gateway / System |
| `PAYMENT_PENDING` | Citizen cancels application | `CANCELLED` | Citizen / Applicant |
| `PAYMENT_PENDING` | Payment unpaid beyond statutory period (90 days) | `EXPIRED` | System Scheduler |
| `PAYMENT_PROCESSING` | Bank transaction settlement confirmed | `PAYMENT_COMPLETED` | Payment Gateway |
| `PAYMENT_PROCESSING` | Bank transaction declined / aborted | `PAYMENT_FAILED` | Payment Gateway |
| `PAYMENT_FAILED` | Citizen retries payment transaction | `PAYMENT_PENDING` | Citizen / Applicant |
| `PAYMENT_FAILED` | Immediate successful retry | `PAYMENT_COMPLETED` | Citizen / Gateway |
| `PAYMENT_FAILED` | Citizen cancels application | `CANCELLED` | Citizen / Applicant |
| `PAYMENT_COMPLETED` | Unlocks appointment scheduling | `APPOINTMENT_PENDING` | System Engine |
| `PAYMENT_COMPLETED` | Citizen selects PSK slot and confirms | `APPOINTMENT_BOOKED` | Citizen / Applicant |
| `PAYMENT_COMPLETED` | Walk-in appointment approved (Senior/Tatkaal) | `APPOINTMENT_SCHEDULED` | Passport Officer |
| `PAYMENT_COMPLETED` | Direct counter routing (Walk-in Tatkaal) | `DOCUMENT_VERIFICATION` | Passport Officer |
| `PAYMENT_COMPLETED` | Statutory refusal order issued | `REJECTED` | Passport Officer |
| `APPOINTMENT_BOOKED` | Citizen arrives at PSK and checks in at Counter A | `DOCUMENT_VERIFICATION` | Passport Officer |
| `APPOINTMENT_BOOKED` | Citizen reschedules appointment (within 3 limits) | `APPOINTMENT_BOOKED` | Citizen / Applicant |
| `APPOINTMENT_BOOKED` | Citizen cancels appointment slot | `APPOINTMENT_PENDING` | Citizen / Applicant |
| `APPOINTMENT_BOOKED` | Biometrics captured and exit token issued | `APPOINTMENT_COMPLETED` | Passport Officer |
| `APPOINTMENT_BOOKED` | Application cancelled by citizen | `CANCELLED` | Citizen / Applicant |
| `APPOINTMENT_COMPLETED` | Transferred to Counter B scrutiny queue | `DOCUMENT_VERIFICATION` | Passport Officer |
| `DOCUMENT_VERIFICATION` | Counter B approves all mandatory KYC proofs | `DOCUMENT_VERIFIED` | Passport Officer |
| `DOCUMENT_VERIFICATION` | Missing, expired, or illegible proof detected | `CLARIFICATION_REQUIRED` | Passport Officer |
| `DOCUMENT_VERIFICATION` | Document defect flagged for citizen replacement | `DOCUMENT_CORRECTION_REQUIRED`| Passport Officer |
| `DOCUMENT_VERIFICATION` | Transmit directly to police station (Tatkaal) | `POLICE_VERIFICATION_PENDING` | Passport Officer |
| `DOCUMENT_VERIFICATION` | Fraudulent proofs or forged certificates detected| `REJECTED` | Passport Officer |
| `DOCUMENT_VERIFICATION` | Case paused for administrative inquiry | `ON_HOLD` | Passport Officer / Admin |
| `DOCUMENT_CORRECTION_REQUIRED`| Citizen uploads replacement document scan | `DOCUMENT_VERIFICATION` | Citizen / Applicant |
| `CLARIFICATION_REQUIRED` | Citizen submits requested clarification & affidavit| `DOCUMENT_VERIFICATION` | Citizen / Applicant |
| `CLARIFICATION_REQUIRED` | Clarification submitted directly to police station | `POLICE_VERIFICATION_IN_PROGRESS`| Citizen / Police |
| `CLARIFICATION_REQUIRED` | Clarification submitted to Granting Officer | `OFFICER_REVIEW` | Citizen / Officer |
| `DOCUMENT_VERIFIED` | Automated routing to jurisdictional police station | `POLICE_VERIFICATION_PENDING` | System Engine |
| `DOCUMENT_VERIFIED` | Post-police verification exemption (Government/Tatkaal)| `OFFICER_REVIEW` | Passport Officer |
| `DOCUMENT_VERIFIED` | Immediate approval granted | `APPROVED` | Passport Officer |
| `POLICE_VERIFICATION_PENDING` | Station In-Charge assigns docket to field officer | `POLICE_VERIFICATION_ASSIGNED` | Police Authority |
| `POLICE_VERIFICATION_PENDING` | Field officer initiates physical address visit | `POLICE_VERIFICATION_IN_PROGRESS`| Police Authority |
| `POLICE_VERIFICATION_PENDING` | Direct clear PVR submitted | `POLICE_VERIFICATION_COMPLETED` | Police Authority |
| `POLICE_VERIFICATION_IN_PROGRESS`| Field officer completes enquiry with clear report | `POLICE_VERIFICATION_COMPLETED` | Police Authority |
| `POLICE_VERIFICATION_IN_PROGRESS`| Clear PVR submitted | `POLICE_CLEARED` | Police Authority |
| `POLICE_VERIFICATION_IN_PROGRESS`| Criminal record or false address discovered | `POLICE_VERIFICATION_FAILED` | Police Authority |
| `POLICE_VERIFICATION_IN_PROGRESS`| Applicant untraceable at declared address | `CLARIFICATION_REQUIRED` | Police Authority |
| `POLICE_VERIFICATION_COMPLETED`| PVR docket forwarded to Granting Officer | `OFFICER_REVIEW` | System / Officer |
| `POLICE_VERIFICATION_COMPLETED`| Escalated to senior RPO review | `FINAL_REVIEW` | Passport Officer |
| `OFFICER_REVIEW` | Granting Officer approves passport issuance | `APPROVED` | Passport Officer |
| `OFFICER_REVIEW` | Officer demands additional declarations under Sec 6 | `CLARIFICATION_REQUIRED` | Passport Officer |
| `OFFICER_REVIEW` | Re-enquiry demanded from Police | `POLICE_VERIFICATION_PENDING` | Passport Officer |
| `OFFICER_REVIEW` | Statutory refusal order issued under Section 6 | `REJECTED` | Passport Officer |
| `APPROVED` | Transmitted to security booklet printing facility | `PRINTING` | Passport Officer / System |
| `PRINTING` | Laser engraving and chip encoding active | `PASSPORT_PRINTING` | Security Printing Engine |
| `PRINTING` | Handed over to India Post Speed Post | `DISPATCHED` | Passport Officer |
| `DISPATCHED` | Speed Post tracking barcode active in transit | `PASSPORT_DISPATCHED` | India Post Logistics API |
| `DISPATCHED` | Consignment delivered to citizen present address | `DELIVERED` | India Post Logistics API |
| `DELIVERED` | Service delivery finalized | `COMPLETED` | System Engine |

---

## 4. Illegal State Transitions and Enforcement Constraints

The FSM strictly prevents unauthorized or invalid state transitions to ensure statutory compliance:

```
[DRAFT] ──────────❌ ILLEGAL JUMP ──────────▶ [APPROVED]
(Blocked: Mandatory fee payment and KYC scrutiny required)

[PAYMENT_PENDING] ──❌ ILLEGAL JUMP ──────────▶ [APPOINTMENT_BOOKED]
(Blocked: Fee settlement is an absolute precondition for slot quota)

[POLICE_VERIFICATION] ─❌ ILLEGAL JUMP ──────▶ [DISPATCHED]
(Blocked: Granting Officer approval and booklet printing required)
```

| Attempted Illegal Transition | Business Reason for Prohibition | Enforcement Mechanism |
| :--- | :--- | :--- |
| `DRAFT` $\rightarrow$ `APPROVED` | Bypasses statutory fee payment, document verification, and police enquiry. | `canTransition()` returns `false`; API throws `400 Bad Request`. |
| `PAYMENT_PENDING` $\rightarrow$ `APPOINTMENT_BOOKED` | Appointment slots are finite public resources unlocked strictly upon fee settlement. | Controller checks `application.status === "PAYMENT_COMPLETED"`. |
| `DOCUMENT_VERIFICATION` $\rightarrow$ `APPROVED` | In normal schemes, police verification is a statutory prerequisite under Passports Act. | FSM requires routing through `POLICE_VERIFICATION_PENDING`. |
| `POLICE_VERIFICATION_IN_PROGRESS` $\rightarrow$ `DISPATCHED` | Bypasses Granting Officer scrutiny and booklet printing. | FSM forbids transitions from police states directly to logistics states. |
| `APPROVED` $\rightarrow$ `DELIVERED` | Physical booklet manufacturing, laser engraving, and postal transit cannot be skipped. | FSM mandates `APPROVED` $\rightarrow$ `PRINTING` $\rightarrow$ `DISPATCHED` $\rightarrow$ `DELIVERED`. |
| `DELIVERED` $\rightarrow$ `DRAFT` | An issued and delivered travel document cannot be reverted to draft composition. | Terminal state: `ALLOWED_TRANSITIONS["DELIVERED"]` allows only `COMPLETED`. |
| `CANCELLED` $\rightarrow$ `APPROVED` | A withdrawn application cannot be approved. Terminal state allows no outgoing transitions. | `ALLOWED_TRANSITIONS["CANCELLED"] = []`. |
