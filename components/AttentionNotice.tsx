"use client";

import { AlertTriangle, Info, ShieldAlert } from "lucide-react";

interface AttentionNoticeProps {
  className?: string;
  maxHeight?: string;
}

export function AttentionNotice({ className = "", maxHeight = "max-h-64" }: AttentionNoticeProps) {
  return (
    <div
      className={`rounded-xl border border-slate-300/80 bg-white shadow-xs overflow-hidden ${className}`}
    >
      {/* Alert Header */}
      <div className="bg-slate-100/90 border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-500 text-white shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Attention – Please Read Before Proceeding
          </h3>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase tracking-wider">
          Notice
        </span>
      </div>

      {/* Scrollable Content (Modeled strictly on official Passport Seva portal advisory) */}
      <div className={`p-4 ${maxHeight} overflow-y-auto text-xs text-slate-700 space-y-3 leading-relaxed`}>
        <div className="flex items-start gap-2">
          <span className="text-slate-400 font-bold text-base leading-none select-none">•</span>
          <p>
            If an applicant wants to <strong>Reissue</strong> his/her passport from a different Regional
            Passport Office other than the one where his/her present passport is issued, then he/she is
            required to create a new login ID on the Passport Seva Portal. The new login ID can be created
            using the same email ID that was previously used.
          </p>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-slate-400 font-bold text-base leading-none select-none">•</span>
          <p>
            To create a new login ID, click on <strong>&ldquo;Register&rdquo;</strong>. After completing the
            registration process, select <strong>&ldquo;Passport Office&rdquo;</strong> and then choose any
            PSK/RPO from the available options as per your convenience.
          </p>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-slate-400 font-bold text-base leading-none select-none">•</span>
          <p>
            Applicants may apply for passport services at <strong>any PSK/POPSK/RPO</strong> across India
            based on their preference without geographic restrictions.
          </p>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-slate-400 font-bold text-base leading-none select-none">•</span>
          <p>
            Please ensure that your mobile number and email ID entered during registration are active. All
            appointment schedules, police verification notices, and tracking numbers (ARN/Speed Post) are
            dispatched electronically.
          </p>
        </div>
      </div>
    </div>
  );
}
