import React, { useState } from "react";
import ModalBasic from "@components/ui/ModalBasic";
import { useDispatch, useSelector } from "react-redux";
import { updateCompanyStatus } from "@store/slices/platform.slice";
import { IconAlertTriangle, IconShieldCheck, IconArchive } from "@tabler/icons-react";

export default function StatusChangeModal({ isOpen, onClose, company }) {
  const dispatch = useDispatch();
  const { isUpdatingStatus } = useSelector((state) => state.platform);

  const currentStatus = company?.status || "ACTIVE";
  const expectedVersion = company?.version;

  // Determine allowed target statuses based on transition rules
  const getAllowedTargets = () => {
    if (currentStatus === "ACTIVE") {
      return [
        {
          value: "SUSPENDED",
          label: "Suspend Company",
          description: "Temporarily freeze access for all users in this tenant company.",
          color: "amber",
        },
        {
          value: "ARCHIVED",
          label: "Archive Company",
          description: "Permanently retire this company tenant. This action is terminal.",
          color: "red",
        },
      ];
    }
    if (currentStatus === "SUSPENDED") {
      return [
        {
          value: "ACTIVE",
          label: "Reactivate Company",
          description: "Restore normal operational access for this customer company.",
          color: "emerald",
        },
        {
          value: "ARCHIVED",
          label: "Archive Company",
          description: "Permanently retire this company tenant. This action is terminal.",
          color: "red",
        },
      ];
    }
    return [];
  };

  const allowedTargets = getAllowedTargets();
  const [selectedTarget, setSelectedTarget] = useState(
    allowedTargets[0]?.value || ""
  );

  // Sync default target if company changes
  React.useEffect(() => {
    const targets = getAllowedTargets();
    if (targets.length > 0) {
      setSelectedTarget(targets[0].value);
    }
  }, [company?.id, company?.status]);

  if (!company) return null;

  const isTerminal = currentStatus === "ARCHIVED";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTarget) return;

    try {
      await dispatch(
        updateCompanyStatus({
          companyId: company.id,
          to: selectedTarget,
          expectedVersion,
        })
      ).unwrap();
      onClose();
    } catch {
      // error handled in slice
    }
  };

  return (
    <ModalBasic
      isOpen={isOpen}
      onClose={onClose}
      title={`Change Status: ${company.name || company.code}`}
      description="Update company tenant status with optimistic locking."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {isTerminal ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-400">
            <div className="flex items-center gap-2 font-semibold">
              <IconAlertTriangle size={18} />
              ARCHIVED Status is Terminal
            </div>
            <p className="mt-1">
              This company has been archived and cannot be transitioned to any other state.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60">
              <div>
                <span className="text-xs text-slate-400">Current Status:</span>
                <p className="text-sm font-semibold text-foreground">
                  {currentStatus}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Lock Version:</span>
                <p className="font-mono text-sm font-semibold text-foreground">
                  v{expectedVersion ?? 1}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Transition To
              </label>

              <div className="space-y-2">
                {allowedTargets.map((target) => (
                  <label
                    key={target.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                      selectedTarget === target.value
                        ? "border-primary-500 bg-primary-500/5 ring-1 ring-primary-500/20"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="toStatus"
                      value={target.value}
                      checked={selectedTarget === target.value}
                      onChange={() => setSelectedTarget(target.value)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {target.value === "ACTIVE" && (
                          <IconShieldCheck size={16} className="text-emerald-500" />
                        )}
                        {target.value === "SUSPENDED" && (
                          <IconAlertTriangle size={16} className="text-amber-500" />
                        )}
                        {target.value === "ARCHIVED" && (
                          <IconArchive size={16} className="text-red-500" />
                        )}
                        <span className="text-sm font-semibold text-foreground">
                          {target.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {target.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {selectedTarget === "ARCHIVED" && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                <strong>Warning:</strong> Once archived, this tenant is permanently disabled and cannot be reactivated.
              </div>
            )}
          </>
        )}

        {/* Modal actions */}
        <div className="flex justify-end gap-2.5 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            disabled={isUpdatingStatus}
          >
            Cancel
          </button>
          {!isTerminal && (
            <button
              type="submit"
              disabled={isUpdatingStatus || !selectedTarget}
              className={`btn ${
                selectedTarget === "ARCHIVED"
                  ? "btn-danger"
                  : selectedTarget === "SUSPENDED"
                    ? "btn-warning"
                    : "btn-primary"
              }`}
            >
              {isUpdatingStatus ? "Updating Status..." : `Confirm ${selectedTarget}`}
            </button>
          )}
        </div>
      </form>
    </ModalBasic>
  );
}

