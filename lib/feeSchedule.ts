/**
 * Passport Automation System (PAS)
 * Centralized Statutory Fee Schedule Engine
 *
 * Modeled on Official Gazette of India Notification G.S.R. 516(E) dated 25 June 2026,
 * effective from 1 July 2026 under the Passports Act, 1967.
 *
 * Source: https://www.passportindia.gov.in/psp/Notification
 */

export interface FeeCalculationParams {
  serviceType: "FRESH" | "REISSUE" | "LOST_DAMAGED" | "PCC" | "MISCELLANEOUS";
  applicationCategory: "NORMAL" | "TATKAAL";
  bookletType: "36_PAGES" | "60_PAGES" | "NA";
  age: number; // in years
  isLostOrDamaged?: boolean;
}

export interface FeeCalculationResult {
  serviceType: string;
  applicationCategory: string;
  bookletType: string;
  applicantAge: number;
  ageCategory: "MINOR_UNDER_8" | "MINOR_9_TO_17" | "ADULT" | "SENIOR_CITIZEN";
  baseFee: number;
  tatkaalSupplement: number;
  grossFee: number;
  discountPercentage: number;
  discountAmount: number;
  totalFee: number;
  isDiscountEligible: boolean;
  discountReason?: string;
  tatkaalSupported: boolean;
  effectiveDate: string;
  gazetteReference: string;
  sourceUrl: string;
  lastVerifiedDate: string;
  breakdown: {
    label: string;
    amount: number;
    isDeduction?: boolean;
  }[];
}

export function calculatePassportFee(params: FeeCalculationParams): FeeCalculationResult {
  const { serviceType, applicationCategory, bookletType, age, isLostOrDamaged } = params;

  let ageCategory: "MINOR_UNDER_8" | "MINOR_9_TO_17" | "ADULT" | "SENIOR_CITIZEN" = "ADULT";
  if (age <= 8) {
    ageCategory = "MINOR_UNDER_8";
  } else if (age < 18) {
    ageCategory = "MINOR_9_TO_17";
  } else if (age >= 60) {
    ageCategory = "SENIOR_CITIZEN";
  }

  const isTatkaal = applicationCategory === "TATKAAL";
  const isMinor = age < 18;

  let baseFee = 2500;
  let totalTatkaalFee = 5000;
  let tatkaalSupported = true;

  // 1. Determine baseline fees based on official 1 July 2026 GSR 516(E) schedule
  if (serviceType === "PCC" || serviceType === "MISCELLANEOUS") {
    baseFee = 750;
    totalTatkaalFee = 750;
    tatkaalSupported = false;
  } else if (serviceType === "LOST_DAMAGED" || isLostOrDamaged) {
    if (isMinor) {
      baseFee = 4250;
      totalTatkaalFee = 6750;
    } else {
      if (bookletType === "60_PAGES") {
        baseFee = 6000;
        totalTatkaalFee = 8500;
      } else {
        baseFee = 5000;
        totalTatkaalFee = 7500;
      }
    }
  } else if (isMinor) {
    baseFee = 1750;
    totalTatkaalFee = 4250;
  } else {
    // Adult fresh or reissue
    if (bookletType === "60_PAGES") {
      baseFee = 3500;
      totalTatkaalFee = 6000;
    } else {
      baseFee = 2500;
      totalTatkaalFee = 5000;
    }
  }

  // 2. Tatkaal Surcharge calculation
  const tatkaalSupplement = isTatkaal && tatkaalSupported ? Math.max(0, totalTatkaalFee - baseFee) : 0;
  const grossFee = baseFee + tatkaalSupplement;

  // 3. Official 10% Discount: Applies ONLY to FRESH applications for minors <= 8 yrs or seniors >= 60 yrs
  // Does NOT apply to re-issue or Tatkaal surcharge
  let discountPercentage = 0;
  let discountAmount = 0;
  let isDiscountEligible = false;
  let discountReason = "";

  if (serviceType === "FRESH") {
    if (age <= 8) {
      discountPercentage = 10;
      discountAmount = Math.round(baseFee * 0.1);
      isDiscountEligible = true;
      discountReason = "10% Statutory Concession for Child Applicants (Age ≤ 8 years) on Fresh Application";
    } else if (age >= 60) {
      discountPercentage = 10;
      discountAmount = Math.round(baseFee * 0.1);
      isDiscountEligible = true;
      discountReason = "10% Statutory Concession for Senior Citizens (Age ≥ 60 years) on Fresh Application";
    }
  }

  const totalFee = grossFee - discountAmount;

  // 4. Construct Itemized Breakdown
  const breakdown: { label: string; amount: number; isDeduction?: boolean }[] = [
    { label: "Basic Statutory Application Fee", amount: baseFee },
  ];

  if (tatkaalSupplement > 0) {
    breakdown.push({ label: "Tatkaal Expedited Surcharge", amount: tatkaalSupplement });
  }

  if (discountAmount > 0) {
    breakdown.push({
      label: `Special Statutory Concession (${discountPercentage}%)`,
      amount: discountAmount,
      isDeduction: true,
    });
  }

  return {
    serviceType,
    applicationCategory: isTatkaal && tatkaalSupported ? "TATKAAL" : "NORMAL",
    bookletType: serviceType === "PCC" ? "NA" : bookletType,
    applicantAge: age,
    ageCategory,
    baseFee,
    tatkaalSupplement,
    grossFee,
    discountPercentage,
    discountAmount,
    totalFee,
    isDiscountEligible,
    discountReason: discountReason || undefined,
    tatkaalSupported,
    effectiveDate: "1 July 2026",
    gazetteReference: "Gazette Notification G.S.R. 516(E) dated 25 June 2026",
    sourceUrl: "https://www.passportindia.gov.in/psp/Notification",
    lastVerifiedDate: "26 October 2026",
    breakdown,
  };
}
