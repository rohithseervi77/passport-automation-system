# Actor–Use Case Matrix and Structural Relationships

## 1. Actor–Use Case Participation Matrix

The following matrix delineates operational boundaries across the five distinct user roles. Participation is strictly audited against system middleware and API authorization guards (`lib/auth.ts`).

- **✓** = Direct Actor Participation (Authorized)
- **—** = No Participation (Forbidden / Restricted)

| ID | Use Case Name | Public User | Applicant | Passport Officer | Police Authority | Administrator |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **UC-01** | Browse Services Directory | ✓ | ✓ | ✓ | ✓ | ✓ |
| **UC-02** | View Gazette Notices & Advisories | ✓ | ✓ | ✓ | ✓ | ✓ |
| **UC-03** | Calculate Statutory Fee (GSR 516E) | ✓ | ✓ | ✓ | ✓ | ✓ |
| **UC-04** | Locate PSK / POPSK Regional Centres | ✓ | ✓ | ✓ | ✓ | ✓ |
| **UC-05** | Query Document Advisor Checklist | ✓ | ✓ | ✓ | ✓ | ✓ |
| **UC-06** | Track Application Status by ARN (Public) | ✓ | ✓ | — | — | — |
| **UC-07** | Lodge Public Grievance Ticket | ✓ | ✓ | — | — | — |
| **UC-08** | Register Citizen Account | — | ✓ | — | — | — |
| **UC-09** | Citizen Login & Session Initialization | — | ✓ | — | — | — |
| **UC-10** | Reset Password via Email Recovery | — | ✓ | — | — | — |
| **UC-11** | Initiate Passport Application (Fresh/Reissue) | — | ✓ | — | — | — |
| **UC-12** | Save Application Form Draft | — | ✓ | — | — | — |
| **UC-13** | Declare Minor & Parental Consent | — | ✓ | — | — | — |
| **UC-14** | Submit Final Passport Application | — | ✓ | — | — | — |
| **UC-15** | Upload Scanned Proof Documents | — | ✓ | — | — | — |
| **UC-16** | Import Documents via DigiLocker (Simulated)| — | ✓ | — | — | — |
| **UC-17** | Settle Statutory Application Fee Online | — | ✓ | — | — | — |
| **UC-18** | Download Digital Payment Receipt | — | ✓ | — | — | — |
| **UC-19** | Query Available PSK Appointment Slots | — | ✓ | — | — | — |
| **UC-20** | Book PSK Appointment Slot | — | ✓ | — | — | — |
| **UC-21** | Reschedule PSK Appointment | — | ✓ | — | — | — |
| **UC-22** | Cancel PSK Appointment | — | ✓ | — | — | — |
| **UC-23** | Simulate PSK Counter Flow (Counters A/B/C)| — | ✓ | — | — | — |
| **UC-24** | View Application Lifecycle Dashboard | — | ✓ | — | — | — |
| **UC-25** | Respond to Officer Clarification Request | — | ✓ | — | — | — |
| **UC-26** | Track Registered Grievance Status | — | ✓ | — | — | — |
| **UC-27** | View Officer Scrutiny Dossier Queue | — | — | ✓ | — | — |
| **UC-28** | Scrutinize Uploaded Proof Documents | — | — | ✓ | — | — |
| **UC-29** | Verify Document Proofs (Counter B) | — | — | ✓ | — | — |
| **UC-30** | Request Citizen Clarification / Correction | — | — | ✓ | — | — |
| **UC-31** | Transmit Dossier to Police Station | — | — | ✓ | — | — |
| **UC-32** | Review Police Verification Report (PVR) | — | — | ✓ | — | — |
| **UC-33** | Grant Passport Application Approval (Counter C)| — | — | ✓ | — | — |
| **UC-34** | Reject Application under Passports Act Sec 6 | — | — | ✓ | — | — |
| **UC-35** | Queue Booklet for Security Printing | — | — | ✓ | — | — |
| **UC-36** | Dispatch Booklet via India Post Speed Post | — | — | ✓ | — | — |
| **UC-37** | View Assigned Police Enquiry Queue | — | — | — | ✓ | — |
| **UC-38** | Conduct Address & Field Reference Enquiry | — | — | — | ✓ | — |
| **UC-39** | Search Criminal Records in CCTNS Database | — | — | — | ✓ | — |
| **UC-40** | Submit Electronic Police Verification Report| — | — | — | ✓ | — |
| **UC-41** | Administrator Login & Credential Verification| — | — | — | — | ✓ |
| **UC-42** | Monitor Operational Analytics & Health | — | — | — | — | ✓ |
| **UC-43** | Manage User Accounts, Roles & Lockouts | — | — | — | — | ✓ |
| **UC-44** | Configure Passport Services Directory | — | — | — | — | ✓ |
| **UC-45** | Manage PSK & POPSK Regional Centres | — | — | — | — | ✓ |
| **UC-46** | Maintain Statutory Fee Schedules (GSR 516E)| — | — | — | — | ✓ |
| **UC-47** | Publish & Manage Official Gazette Notices | — | — | — | — | ✓ |
| **UC-48** | Triage & Redress Citizen Grievance Tickets | — | — | — | — | ✓ |

---

## 2. Use Case Stereotypes & Structural Relationships

In UML 2.5 modeling, relationships between use cases establish reuse, conditional behavior, and specialization.

```
                      <<include>>
[UC-11: Initiate App] ----------> [UC-15: Upload Proofs]
         |
         | <<extend>> (Condition: applicant.isMinor == true)
         v
[UC-13: Declare Minor Consent]

                      <<include>>
[UC-17: Settle Fee] ------------> [UC-18: Download Receipt]

                      <<extend>> (Condition: applicant.reschedules < 3)
[UC-20: Book Appt] <------------- [UC-21: Reschedule Appt]

                      <<include>>
[UC-28: Scrutinize] ------------> [UC-29: Verify Proofs]
         |
         | <<extend>> (Condition: proofs.isDeficient == true)
         v
[UC-30: Request Clarification]

                      <<include>>
[UC-33: Grant App] -------------> [UC-35: Queue Printing]
                                         |
                                         | <<include>>
                                         v
                                  [UC-36: Dispatch Speed Post]
```

### 2.1 «include» Relationships
An `<<include>>` dependency indicates that the executing base use case unconditionally requires the functionality of the included use case to successfully complete its contract:

1. **`UC-14: Submit Final Application` $\xrightarrow{<<include>>}$ `UC-15: Upload Scanned Proof Documents`**
   - *Rationale:* Under the Passports Act, an application cannot be accepted without attaching mandatory proof of present address and proof of date of birth.
2. **`UC-17: Settle Statutory Fee` $\xrightarrow{<<include>>}$ `UC-18: Download Digital Payment Receipt`**
   - *Rationale:* Upon electronic financial settlement, the system automatically persists transaction details and generates a digital receipt required for PSK entry.
3. **`UC-28: Scrutinize Uploaded Proofs` $\xrightarrow{<<include>>}$ `UC-29: Verify Document Proofs (Counter B)`**
   - *Rationale:* Scrutinizing the citizen dossier mandates verifying each individual attached KYC document against original certificates.
4. **`UC-33: Grant Application Approval` $\xrightarrow{<<include>>}$ `UC-35: Queue Booklet for Security Printing`**
   - *Rationale:* When Counter C grants statutory approval, the system atomically issues a passport number and queues the document for laser engraving and contactless chip personalization.
5. **`UC-35: Queue Booklet for Security Printing` $\xrightarrow{<<include>>}$ `UC-36: Dispatch Booklet via India Post`**
   - *Rationale:* Printing completion automatically triggers consignment handover to India Post Speed Post with barcode tracking generation.
6. **`UC-38: Conduct Address Enquiry` $\xrightarrow{<<include>>}$ `UC-39: Search Criminal Records in CCTNS Database`**
   - *Rationale:* A police verification report cannot be legally submitted without cross-checking the national crime database for pending warrants or FIRs.

### 2.2 «extend» Relationships
An `<<extend>>` dependency models conditional, optional, or exceptional behavior inserted into a base use case only when specific extension points or guard conditions are met:

1. **`UC-11: Initiate Application` $\xleftarrow{<<extend>>}$ `UC-13: Declare Minor & Parental Consent`**
   - *Extension Point:* `AgeEvaluationPoint`
   - *Condition:* `[applicant.isMinor == true]` (Citizen age $< 18$ years).
   - *Rationale:* Adult applicants bypass minor consent, but minor applications dynamically activate Annexure D/C parental consent declarations.
2. **`UC-20: Book Appointment Slot` $\xleftarrow{<<extend>>}$ `UC-21: Reschedule PSK Appointment`**
   - *Extension Point:* `SlotModificationPoint`
   - *Condition:* `[appointment.status == "BOOKED" && rescheduleCount < 3]`.
   - *Rationale:* Rescheduling modifies an existing reservation up to the statutory limit of 3 times.
3. **`UC-28: Scrutinize Proof Documents` $\xleftarrow{<<extend>>}$ `UC-30: Request Citizen Clarification`**
   - *Extension Point:* `ProofDeficiencyPoint`
   - *Condition:* `[document.verificationStatus == "CORRECTION_REQUIRED"]`.
   - *Rationale:* Triggered only if submitted documents are illegible, expired, or discrepant.
4. **`UC-28: Scrutinize Proof Documents` $\xleftarrow{<<extend>>}$ `UC-34: Reject Application under Sec 6`**
   - *Extension Point:* `DisqualificationPoint`
   - *Condition:* `[hasFraudulentProofs == true || applicant.isDisqualified == true]`.
   - *Rationale:* Activated if forged documents or statutory disqualifications are discovered.
5. **`UC-47: Publish Gazette Notices` $\xleftarrow{<<extend>>}$ `UC-48: Batch Import Notices (CSV/JSON)`**
   - *Extension Point:* `BulkDataIngestionPoint`
   - *Condition:* `[admin.isBatchMode == true]`.
   - *Rationale:* Optional bulk import facility for loading historical departmental gazette archives.

---

## 3. Generalization Relationships
- **Actor Generalization:** `Public User` $\Leftarrow$ `Citizen / Applicant`.
  - The `Applicant` inherits all public browsing, fee calculation, centre locating, and public tracking capabilities while possessing authenticated private state capabilities.
- **Service Generalization:** Abstract `PassportService` $\Leftarrow$ Concrete services: `FreshPassportService`, `ReissuePassportService`, `TatkaalService`, `PCCService`.
