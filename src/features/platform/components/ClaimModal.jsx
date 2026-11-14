import React, { useState } from "react";
import ModalBasic from "@components/ui/ModalBasic";
import { IconCheck, IconCopy, IconKey, IconClock, IconExternalLink } from "@tabler/icons-react";
import { toast } from "sonner";

export default function ClaimModal({ isOpen, onClose, data }) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!data) return null;

  const { claimCode, claimUrl, claimExpiresAt, companyCode } = data;

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "url") {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const formattedExpiry = claimExpiresAt
    ? new Date(claimExpiresAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "24 hours";

  return (
    <ModalBasic
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Onboarding Claim Link"
      description={
        companyCode
          ? `Generated onboarding claim invitation for ${companyCode}`
          : "Share this link with the company admin to complete onboarding."
      }
      size="lg"
    >
      <div className="space-y-5 p-6">
        {/* Expiry Alert */}
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-300">
          <IconClock size={22} className="shrink-0" />
          <div className="text-xs">
            <span className="font-semibold">Time-Sensitive:</span> This claim
            link expires on <strong className="font-semibold">{formattedExpiry}</strong>. The admin must claim the account before then.
          </div>
        </div>

        {/* Claim URL */}
        {claimUrl && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Claim URL (Invite Link)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={claimUrl}
                className="form-input flex-1 truncate bg-slate-50 font-mono text-xs dark:bg-slate-900"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(claimUrl, "url")}
                className="btn btn-primary shrink-0"
              >
                {copiedUrl ? <IconCheck size={16} /> : <IconCopy size={16} />}
                <span>{copiedUrl ? "Copied" : "Copy Link"}</span>
              </button>
              <a
                href={claimUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-light shrink-0"
                title="Open in new tab"
              >
                <IconExternalLink size={16} />
              </a>
            </div>
          </div>
        )}

        {/* Raw Claim Code */}
        {claimCode && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Raw Claim Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-lg border border-border bg-slate-50 p-2.5 font-mono text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <IconKey size={14} className="mr-1.5 inline text-slate-400" />
                {claimCode}
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(claimCode, "code")}
                className="btn btn-outline shrink-0"
              >
                {copiedCode ? <IconCheck size={16} /> : <IconCopy size={16} />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-border">
          <button type="button" onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </ModalBasic>
  );
}

