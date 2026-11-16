import React, { useState, useEffect } from "react";
import { Check, Copy, KeyRound, Link2, Plus, ShieldCheck } from "lucide-react";

import { ROUTES } from "@constants/routes";
import ModalBasic from "@components/ui/ModalBasic";

const CompanyCreatedModal = ({ isOpen, onClose, company, onCreateAnother }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCopiedCode(false);
      setCopiedLink(false);
    }
  }, [isOpen, company?.claimCode]);

  // --------------------------------------------------
  // Invitation URL
  // --------------------------------------------------

  const getInvitationUrl = () => {
    if (!company?.claimCode) return "";

    const url = new URL(ROUTES.COMPANIES.VERIFY, window.location.origin);

    url.searchParams.set("claimCode", company.claimCode);

    return url.toString();
  };

  // --------------------------------------------------
  // Copy Claim Code
  // --------------------------------------------------

  const handleCopyCode = async () => {
    if (!company?.claimCode) return;

    try {
      await navigator.clipboard.writeText(company.claimCode);
      setCopiedCode(true);
    } catch (error) {
      console.error("Unable to copy claim code:", error);
    }
  };

  // --------------------------------------------------
  // Copy Invitation Link
  // --------------------------------------------------

  const handleCopyLink = async () => {
    const invitationUrl = getInvitationUrl();

    if (!invitationUrl) return;

    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopiedLink(true);
    } catch (error) {
      console.error("Unable to copy invitation link:", error);
    }
  };

  // --------------------------------------------------
  // Create Another Company
  // --------------------------------------------------

  const handleCreateAnother = () => {
    setCopiedCode(false);
    setCopiedLink(false);
    onCreateAnother?.();
  };

  if (!company?.claimCode) return null;

  return (
    <ModalBasic
      id="company-created-modal"
      title="Company created successfully"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-5 px-5 py-5">
        {/* Claim Code */}
        <div>
          <div className="mb-2.5 flex items-center gap-2">
            <KeyRound size={15} className="text-muted-foreground" />

            <label className="text-sm font-semibold text-foreground">
              Generated Claim Code
            </label>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="break-all font-mono text-[13px] leading-relaxed text-foreground">
              {company.claimCode}
            </p>

            <div className="mt-4 flex justify-end border-t border-border pt-3">
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
              >
                {copiedCode ? <Check size={15} /> : <Copy size={15} />}

                {copiedCode ? "Copied" : "Copy Claim Code"}
              </button>
            </div>
          </div>
        </div>

        {/* Invitation Link */}
        <div>
          <div className="mb-2.5 flex items-center gap-2">
            <Link2 size={15} className="text-muted-foreground" />

            <label className="text-sm font-semibold text-foreground">
              Onboarding Invitation Link
            </label>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              readOnly
              value={getInvitationUrl()}
              onFocus={(e) => e.target.select()}
              className="form-input min-w-0 flex-1 text-xs"
            />

            <button
              type="button"
              onClick={handleCopyLink}
              className="btn btn-primary inline-flex shrink-0 items-center justify-center gap-2"
            >
              {copiedLink ? <Check size={15} /> : <Copy size={15} />}

              {copiedLink ? "Copied" : "Copy Link"}
            </button>
          </div>

          {company.claimExpiresAt && (
            <p className="mt-2.5 text-xs text-muted-foreground">
              <Link2 size={13} className="mr-1 inline-block" />
              Expires on:{" "}
              {new Date(company.claimExpiresAt).toLocaleString("en-IN")}
            </p>
          )}
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-3 rounded-xl bg-sky-500/[0.07] px-4 py-3.5">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-400"
          />

          <div>
            <p className="text-xs font-semibold text-foreground">
              Keep this code secure
            </p>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              This is a single-use onboarding credential. Share it only with the
              intended administrator.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn btn-outline">
            Close
          </button>

          <button
            type="button"
            onClick={handleCreateAnother}
            className="btn btn-primary inline-flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Create Another Company
          </button>
        </div>
      </div>
    </ModalBasic>
  );
};

export default CompanyCreatedModal;
