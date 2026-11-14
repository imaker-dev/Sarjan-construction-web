import Alert from "@components/ui/Alert";
import Avatar from "@components/ui/Avatar";
import ModalBasic from "@components/ui/ModalBasic";
import { formatDate } from "@utils/date.utils";
import { Check, Copy, MailPlus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const SendInviteModal = ({
  isOpen,
  onClose,
  loading = false,
  employee,
  inviteResult,
  onSubmit,
}) => {
  const [loginId, setLoginId] = useState("");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId.trim());

  // Build invitation URL.
  const invitationUrl = inviteResult?.claimCode
    ? `${window.location.origin}/verify-user?token=${encodeURIComponent(
        inviteResult.claimCode,
      )}`
    : "";

  // Copy invitation URL.
  const handleCopyInviteLink = async () => {
    if (!invitationUrl) return;

    try {
      await navigator.clipboard.writeText(invitationUrl);
      toast.success("Invitation link copied successfully!");
    } catch {
      toast.error("Unable to copy invitation link");
    }
  };

  return (
    <ModalBasic
      id={"send-invite-modal"}
      title={inviteResult ? "Invitation Created" : "Send Employee Invitation"}
      description={
        inviteResult
          ? "The invitation link is ready to share."
          : "Review the employee details before sending an invitation."
      }
      isOpen={isOpen}
      onClose={onClose}
    >
      {/* Modal Body */}
      <div className="space-y-5 p-5">
        {/* Employee Information */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
          <Avatar name={employee?.displayName} size={42} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {employee?.displayName}
            </p>

            <p className="text-xs text-muted-foreground">
              {employee?.employeeCode}
            </p>
          </div>
        </div>

        {!inviteResult ? (
          <>
            {/* Login Email */}
            <div>
              <label htmlFor="invite-login-email" className="form-label">
                Login Email <span className="text-red-500">*</span>
              </label>

              <input
                id="invite-login-email"
                type="email"
                className="form-input w-full"
                placeholder="Enter employee email"
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                disabled={loading}
              />

              <p className="form-hint">
                The invitation will be generated for this email address.
              </p>
            </div>

            <Alert
              title="Invitation Link Generated"
              description="Once confirmed, an invitation link will be generated. Share the link with the employee so they can verify their account and set their password."
              size="sm"
              type="warning"
            />
          </>
        ) : (
          <>
            {/* Success */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div className="flex items-center gap-2">
                <Check
                  size={17}
                  className="text-emerald-600 dark:text-emerald-400"
                />

                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Invitation successfully generated
                </p>
              </div>

              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Share this link with {employee?.displayName}.
              </p>
            </div>

            {/* Invitation URL */}
            <div>
              <label className="form-label">Invitation Link</label>

              <div className="flex gap-2">
                <input
                  readOnly
                  value={invitationUrl}
                  className="form-input min-w-0 flex-1 text-xs"
                  onFocus={(event) => event.target.select()}
                />

                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="btn btn-outline shrink-0"
                >
                  <Copy size={16} />
                  Copy
                </button>
              </div>
            </div>

            {/* Expiry */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground">Invitation expires</span>

              <span className="font-medium text-foreground">
                {formatDate(inviteResult.expiresAt)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Modal Footer */}
      <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
        {!inviteResult ? (
          <>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-outline"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                onSubmit({
                  id: employee.id,
                  values: {
                    loginId: loginId.trim(),
                    loginIdType: "EMAIL",
                  },
                })
              }
              disabled={loading || !loginId.trim() || !isValidEmail}
              className="btn btn-primary"
            >
              {loading ? (
                "Generating Invitation..."
              ) : (
                <>
                  <MailPlus size={17} />
                  Confirm & Send Invite
                </>
              )}
            </button>
          </>
        ) : (
          <button type="button" onClick={onClose} className="btn btn-primary">
            Done
          </button>
        )}
      </div>
    </ModalBasic>
  );
};

export default SendInviteModal;
