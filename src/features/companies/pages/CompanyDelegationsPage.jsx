import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconShieldCog, IconDeviceFloppy } from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import Alert from "@components/ui/Alert";
import RefreshButton from "@components/ui/RefreshButton";
import { getCompanyDelegations, updateCompanyDelegations } from "@store/slices/company.slice";

const DELEGATION_FLAGS = [
  { key: "siteCreate", label: "Site Creation", desc: "Allow Project Incharges to create new sites under their assigned project." },
  { key: "siteUpdate", label: "Site Updates", desc: "Allow Project Incharges to edit site details & coordinates within their project." },
  { key: "deptManage", label: "Department Management", desc: "Allow Project Incharges to create, edit, and toggle departments in their scope." },
  { key: "employeeOnboard", label: "Worker Onboarding", desc: "Allow PI/PD to onboard new worker profiles directly into in-scope departments." },
  { key: "placement", label: "Membership Placement & Transfer", desc: "Allow PI/PD to add, update, transfer, or end department memberships." },
  { key: "memberSuspend", label: "Workforce Suspend & Reinstate", desc: "Allow PI/PD to temporarily suspend or reinstate workers at a site/project." },
  { key: "memberExit", label: "Workforce Permanent Exit", desc: "Allow PI/PD to mark a worker as permanently exited from a site/project." },
  { key: "scheduleManage", label: "Work Schedule Management", desc: "Allow PI/PM with WORK_SCHEDULE_MANAGE to create or edit project/site schedules." },
];

export default function CompanyDelegationsPage() {
  const dispatch = useDispatch();
  const { delegations, isLoadingDelegations, isUpdatingDelegations } = useSelector(
    (state) => state.company
  );

  const [formState, setFormState] = useState({});

  useEffect(() => {
    dispatch(getCompanyDelegations());
  }, [dispatch]);

  useEffect(() => {
    if (delegations) {
      const next = {};
      for (const f of DELEGATION_FLAGS) {
        next[f.key] = Boolean(delegations[f.key]);
      }
      setFormState(next);
    }
  }, [delegations]);

  const handleToggle = (key) => {
    setFormState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    dispatch(updateCompanyDelegations(formState));
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeaderBanner
        title="Delegation Settings"
        description="Control which scoped administrative actions Project Incharges, Project Directors, and Project Managers may perform."
      />

      <Alert
        type="info"
        variant="flat"
        title="Company-Wide Governance Switches"
        description="All switches default to OFF. Even when a user holds a scoped permission, the backend rejects the action with DELEGATION_DISABLED unless the corresponding switch below is enabled."
      />

      <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] shadow-sm divide-y divide-slate-100 dark:divide-slate-700/60">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <IconShieldCog size={20} className="text-primary-500" />
            <div>
              <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">
                Scoped Capability Switches
              </h3>
              <p className="text-[12.5px] text-slate-400 dark:text-slate-500">
                Changes apply immediately to all scoped role holders across the company.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RefreshButton
              onClick={() => dispatch(getCompanyDelegations())}
              loading={isLoadingDelegations}
              label="Refresh"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isUpdatingDelegations || isLoadingDelegations}
              className="btn btn-primary btn-xs inline-flex items-center gap-1.5"
            >
              <IconDeviceFloppy size={14} />
              <span>{isUpdatingDelegations ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>

        {DELEGATION_FLAGS.map((flag) => {
          const enabled = Boolean(formState[flag.key]);
          return (
            <div
              key={flag.key}
              className="flex items-center justify-between gap-4 px-5 py-3.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {flag.label}
                  </span>
                  <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {flag.key}
                  </code>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {flag.desc}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => handleToggle(flag.key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  enabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
