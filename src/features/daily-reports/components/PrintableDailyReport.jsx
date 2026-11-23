import React from "react";
import {
  IconSun,
  IconCloudRain,
  IconShieldCheck,
  IconAlertTriangle,
  IconLock,
  IconCheck,
} from "@tabler/icons-react";

const CATEGORY_LABELS = {
  CAT_A_STAFF: "Category A: Staff & Supervision",
  CAT_B_DIRECT_LABOUR: "Category B: Direct Site Labour",
  CAT_C_SUBCONTRACTOR: "Category C: Subcontractor Gangs",
};

export default function PrintableDailyReport({ report }) {
  if (!report) return null;

  const isLocked = report.status === "LOCKED";
  const isApproved = report.status === "APPROVED";
  const labourSummaries = Array.isArray(report.labourSummaries)
    ? report.labourSummaries
    : [];

  const formattedDate = report.businessDate
    ? new Date(report.businessDate + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="hidden print:block font-sans text-black bg-white p-8 space-y-6 max-w-[900px] mx-auto text-xs leading-normal">
      {/* Print Document Header */}
      <div className="border-b-2 border-black pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">
              Sarjan Construction
            </h1>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-neutral-600 mt-0.5">
              Daily Site Report & Statutory Muster Roll (DSR / DPR)
            </p>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              Certified Legal Record for Payroll Disbursements and Client Billing
            </p>
          </div>
          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 font-bold text-xs uppercase border border-black ${
                isLocked
                  ? "bg-neutral-900 text-white"
                  : isApproved
                  ? "bg-neutral-200 text-black"
                  : "bg-white text-black"
              }`}
            >
              Status: {report.status}
            </span>
            <p className="text-[10px] font-mono mt-1 text-neutral-600">
              Ref: {report.id}
            </p>
          </div>
        </div>
      </div>

      {/* Site & Project Information Grid */}
      <div className="border border-neutral-300 divide-y divide-neutral-300">
        <div className="grid grid-cols-2 divide-x divide-neutral-300 bg-neutral-100 p-2 font-bold uppercase text-[11px]">
          <div>Project Details</div>
          <div>Site & Date Information</div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-neutral-300 p-3">
          <div className="space-y-1 pr-3">
            <p>
              <span className="font-semibold text-neutral-600">Project:</span>{" "}
              <strong>{report.project?.name || "—"}</strong>{" "}
              {report.project?.code && `(${report.project.code})`}
            </p>
            <p>
              <span className="font-semibold text-neutral-600">Site Location:</span>{" "}
              <strong>{report.site?.name || "—"}</strong>{" "}
              {report.site?.code && `[${report.site.code}]`}
            </p>
          </div>
          <div className="space-y-1 pl-3">
            <p>
              <span className="font-semibold text-neutral-600">Business Date:</span>{" "}
              <strong>{formattedDate}</strong>
            </p>
            <p>
              <span className="font-semibold text-neutral-600">Report Version:</span>{" "}
              <span>v{report.version ?? 0} • Audit Trail Verified</span>
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate Workforce Metrics */}
      <div className="grid grid-cols-4 gap-2 border border-neutral-300 p-3 text-center bg-neutral-50">
        <div>
          <p className="text-[10px] uppercase font-bold text-neutral-600">
            Total Headcount
          </p>
          <p className="text-base font-bold mt-0.5">
            {report.totalWorkersHeadcount ?? 0}
          </p>
          <span className="text-[9px] text-neutral-500">Physical on-site</span>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-neutral-600">
            Present Units (Hazri)
          </p>
          <p className="text-base font-bold mt-0.5">
            {report.totalPresentUnits ?? "0.0"}
          </p>
          <span className="text-[9px] text-neutral-500">1.0 & 0.5 units</span>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-neutral-600">
            Overtime Recorded
          </p>
          <p className="text-base font-bold mt-0.5">
            {report.totalOvertimeHours ?? "0.0"}h
          </p>
          <span className="text-[9px] text-neutral-500">Billable hours</span>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-neutral-600">
            Workforce Mix
          </p>
          <p className="text-[11px] font-semibold mt-0.5">
            Staff: {report.catAStaffCount ?? 0} • Direct: {report.catBDirectCount ?? 0}
          </p>
          <span className="text-[9px] text-neutral-500">
            Contractors: {report.catCSubconCount ?? 0}
          </span>
        </div>
      </div>

      {/* Weather, Diary & Safety Section */}
      <div className="border border-neutral-300 divide-y divide-neutral-300">
        <div className="bg-neutral-100 p-2 font-bold uppercase text-[11px]">
          Site Conditions & Operational Diary
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-6">
            <p>
              <span className="font-semibold text-neutral-600">Weather:</span>{" "}
              <strong>{report.weather}</strong>
            </p>
            <p>
              <span className="font-semibold text-neutral-600">Rain Stoppage:</span>{" "}
              <strong>{report.weatherStoppageHours ?? "0.0"} hours</strong>
            </p>
            <p>
              <span className="font-semibold text-neutral-600">Safety Status:</span>{" "}
              <strong>
                {report.safetyIncidentReported
                  ? "INCIDENT REPORTED"
                  : "Zero Incidents (Clear)"}
              </strong>
            </p>
          </div>

          <div>
            <span className="font-semibold text-neutral-700 block">
              Work Progress & Site Diary Notes:
            </span>
            <p className="text-neutral-800 mt-0.5 whitespace-pre-wrap">
              {report.workProgressNotes || "No site diary notes recorded for this date."}
            </p>
          </div>

          {report.siteObstaclesRemarks && (
            <div>
              <span className="font-semibold text-neutral-700 block">
                Site Bottlenecks / Hindrances:
              </span>
              <p className="text-neutral-800 mt-0.5 whitespace-pre-wrap">
                {report.siteObstaclesRemarks}
              </p>
            </div>
          )}

          {report.safetyIncidentReported && report.safetyNotes && (
            <div className="border-l-2 border-black pl-3 py-1">
              <span className="font-bold uppercase text-neutral-900 block">
                Safety Incident Brief & Corrective Measures:
              </span>
              <p className="text-neutral-800 mt-0.5">{report.safetyNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Workforce Breakdown Table */}
      <div className="border border-neutral-300">
        <div className="bg-neutral-100 p-2 font-bold uppercase text-[11px] border-b border-neutral-300">
          Workforce Breakdown by Trade & Subcontractor
        </div>
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-neutral-300 bg-neutral-50 font-semibold">
              <th className="py-2 px-3">Category</th>
              <th className="py-2 px-3">Subcontractor / Trade</th>
              <th className="py-2 px-3 text-center">Headcount</th>
              <th className="py-2 px-3 text-center">Present Units</th>
              <th className="py-2 px-3 text-center">OT Hours</th>
              <th className="py-2 px-3">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {labourSummaries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-neutral-500 italic">
                  No labour summary entries logged.
                </td>
              </tr>
            ) : (
              labourSummaries.map((item) => (
                <tr key={item.id}>
                  <td className="py-1.5 px-3 font-medium">
                    {CATEGORY_LABELS[item.category] || item.category}
                  </td>
                  <td className="py-1.5 px-3">
                    <strong>{item.tradeCategory}</strong>
                    {item.subcontractorName && (
                      <span className="text-neutral-600 block text-[10px]">
                        {item.subcontractorName}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 px-3 text-center font-bold">
                    {item.headcount}
                  </td>
                  <td className="py-1.5 px-3 text-center font-bold">
                    {item.presentUnits}
                  </td>
                  <td className="py-1.5 px-3 text-center font-mono">
                    {Number(item.overtimeHours || 0) > 0 ? `${item.overtimeHours}h` : "—"}
                  </td>
                  <td className="py-1.5 px-3 text-neutral-600 text-[10px]">
                    {item.remarks || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Statutory Sign-Off & Verification Box */}
      <div className="border border-black mt-8">
        <div className="bg-neutral-100 p-2 font-bold uppercase text-[11px] border-b border-black">
          Statutory Verification & Authorization Sign-Off
        </div>
        <div className="grid grid-cols-3 divide-x divide-black p-4 min-h-[120px]">
          {/* 1. Prepared by */}
          <div className="flex flex-col justify-between pr-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-neutral-600">
                1. Prepared By (Site In-Charge)
              </p>
              <p className="font-bold text-[11px] mt-1">
                {report.submittedBy?.displayName || "—"}
              </p>
              <p className="text-[10px] text-neutral-500">
                {report.submittedBy?.employeeCode ? `Emp ID: ${report.submittedBy.employeeCode}` : ""}
              </p>
              <p className="text-[9px] text-neutral-500 mt-0.5">
                {report.submittedAt ? new Date(report.submittedAt).toLocaleString("en-IN") : "Not submitted"}
              </p>
            </div>
            <div className="border-t border-dashed border-neutral-400 pt-1 mt-6">
              <span className="text-[9px] text-neutral-500 uppercase">Supervisor Signature</span>
            </div>
          </div>

          {/* 2. Approved by */}
          <div className="flex flex-col justify-between px-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-neutral-600">
                2. Approved By (Project Manager)
              </p>
              <p className="font-bold text-[11px] mt-1">
                {report.approvedBy?.displayName || "—"}
              </p>
              <p className="text-[10px] text-neutral-500">
                {report.approvedBy?.employeeCode ? `Emp ID: ${report.approvedBy.employeeCode}` : ""}
              </p>
              <p className="text-[9px] text-neutral-500 mt-0.5">
                {report.approvedAt ? new Date(report.approvedAt).toLocaleString("en-IN") : "Pending Approval"}
              </p>
            </div>
            <div className="border-t border-dashed border-neutral-400 pt-1 mt-6">
              <span className="text-[9px] text-neutral-500 uppercase">PM Signature</span>
            </div>
          </div>

          {/* 3. Locked by */}
          <div className="flex flex-col justify-between pl-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-neutral-600">
                3. Final Lock (HO Admin / Finance)
              </p>
              <p className="font-bold text-[11px] mt-1">
                {report.lockedBy?.displayName || (isLocked ? "Central Administration" : "Pending Lock")}
              </p>
              <p className="text-[9px] text-neutral-500 mt-0.5">
                {report.lockedAt ? new Date(report.lockedAt).toLocaleString("en-IN") : "Not locked"}
              </p>
            </div>
            <div className="border-t border-dashed border-neutral-400 pt-1 mt-6">
              <span className="text-[9px] text-neutral-500 uppercase">Official Seal & Signature</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="pt-4 border-t border-neutral-300 text-center text-[9px] text-neutral-500">
        <p>
          Generated automatically by Sarjan Construction ERP • Tamper-evident Audit Trail Attached
        </p>
        <p className="mt-0.5">
          This document is an immutable statutory muster roll and daily site diary. Alteration of this printed record is prohibited by company policy and construction labor regulations.
        </p>
      </div>
    </div>
  );
}
