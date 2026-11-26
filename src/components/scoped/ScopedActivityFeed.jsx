import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconHistory } from "@tabler/icons-react";
import RefreshButton from "@components/ui/RefreshButton";
import { getScopeHandler } from "./scope.config";
import { formatDate } from "@utils/date.utils";

export default function ScopedActivityFeed({ scopeType, scopeId }) {
  const dispatch = useDispatch();
  const handler = getScopeHandler(scopeType);
  const scopeState = useSelector((state) => state[handler.sliceKey]);
  const activityItems = scopeState[handler.activityKey];
  const isLoadingActivity = scopeState[handler.activityLoadingKey];

  const loadActivity = () => {
    if (!scopeId) return;
    dispatch(handler.fetchActivity({ [handler.idKey]: scopeId, params: { limit: 50 } }));
  };

  useEffect(() => {
    loadActivity();
  }, [scopeType, scopeId]);

  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <IconHistory size={18} className="text-primary-500" />
          <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">
            Scoped Activity Feed
          </h3>
        </div>
        <RefreshButton onClick={loadActivity} loading={isLoadingActivity} />
      </div>

      {activityItems.length === 0 ? (
        <p className="p-6 text-center text-xs text-slate-400">
          {isLoadingActivity ? "Loading activity..." : "No activity recorded in this scope."}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {activityItems.map((item, idx) => (
            <li key={item.id || idx} className="px-5 py-3 text-xs flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {item.action || item.eventType || "EVENT"}
                </span>
                {item.entityType && (
                  <span className="ml-2 text-slate-400 font-mono">{item.entityType}</span>
                )}
              </div>
              <span className="text-slate-400 tabular-nums shrink-0">
                {formatDate(item.createdAt || item.timestamp)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
