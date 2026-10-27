import React from "react";
import { Download } from "lucide-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import Avatar from "@components/ui/Avatar";

const STATUS_STYLES = {
  Active: "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400",
  Pending: "bg-amber-50 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400",
  Completed: "bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400",
  Cancel: "bg-rose-50 text-rose-400 dark:bg-rose-500/15 dark:text-rose-400",
};

const DEFAULT_STATUS_STYLE = "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400";

const DEFAULT_ROWS = [
  {
    id: 1,
    name: "Sunil Joshi",
    role: "Web Designer",
    project: "Elite Admin",
    team: [
      { initial: "S", color: "#3B9EF5" },
      { initial: "D", color: "#F0876E" },
    ],
    status: "Active",
    budget: "$3.9k",
  },
  {
    id: 2,
    name: "Andrew McDownland",
    role: "Project Manager",
    project: "Real Homes WP Theme",
    team: [
      { initial: "A", color: "#6D6FEF" },
      { initial: "X", color: "#F4B95A" },
      { initial: "N", color: "#3FC1E3" },
    ],
    status: "Pending",
    budget: "$24.5k",
  },
  {
    id: 3,
    name: "Christopher Jamil",
    role: "Project Manager",
    project: "MedicalPro WP Theme",
    team: [{ initial: "X", color: "#F0876E" }],
    status: "Completed",
    budget: "$12.8k",
  },
  {
    id: 4,
    name: "Nirav Joshi",
    role: "Frontend Engineer",
    project: "Hosting Press HTML",
    team: [
      { initial: "Y", color: "#6D6FEF" },
      { initial: "X", color: "#F0876E" },
    ],
    status: "Active",
    budget: "$2.4k",
  },
  {
    id: 5,
    name: "Micheal Doe",
    role: "Content Writer",
    project: "Helping Hands WP Theme",
    team: [{ initial: "S", color: "#3B9EF5" }],
    status: "Cancel",
    budget: "$9.3k",
  },
];



function TeamAvatars({ team }) {
  return (
    <div className="flex">
      {team.map((member, i) => (
        <div
          key={i}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-2 ring-white dark:ring-[#202B3E]"
          style={{ backgroundColor: member.color, marginLeft: i === 0 ? 0 : -10 }}
        >
          {member.initial}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded px-2.5 py-1 text-[12px] font-medium ${STATUS_STYLES[status] || DEFAULT_STATUS_STYLE}`}>
      {status}
    </span>
  );
}

export default function AllUsersPage({ title = "Basic Table", rows = DEFAULT_ROWS, onDownload }) {
  return (
    <div className="space-y-5">
      <PageHeaderBanner title="All Users" />

      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1C2536]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700 sm:px-6">
          <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white">{title}</h2>

          <button
            type="button"
            onClick={onDownload}
            aria-label="Download table"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
          >
            <Download size={17} strokeWidth={2} />
          </button>
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-slate-800 dark:text-slate-200">
                <th className="whitespace-nowrap px-6 py-3 font-semibold">Users</th>
                <th className="whitespace-nowrap px-6 py-3 font-semibold">Project Name</th>
                <th className="whitespace-nowrap px-6 py-3 font-semibold">Team</th>
                <th className="whitespace-nowrap px-6 py-3 font-semibold">Status</th>
                <th className="whitespace-nowrap px-6 py-3 font-semibold">Budget</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/60 dark:border-slate-700/70 dark:hover:bg-slate-700/20">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                                          <Avatar name={row.name} size={34} />


                     
                      <div className="leading-tight">
                        <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{row.name}</div>
                        <div className="text-[12.5px] text-slate-400 dark:text-slate-500">{row.role}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-3.5">
                    <a
                      href={row.projectHref || "#"}
                      className="text-[13.5px] font-medium text-secondary-500 hover:text-secondary-600 dark:text-secondary-400 dark:hover:text-secondary-300"
                    >
                      {row.project}
                    </a>
                  </td>

                  <td className="px-6 py-3.5"><TeamAvatars team={row.team} /></td>
                  <td className="px-6 py-3.5"><StatusBadge status={row.status} /></td>
                  <td className="px-6 py-3.5 text-[13.5px] font-semibold text-slate-700 dark:text-slate-200">{row.budget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700 sm:hidden">
          {rows.map((row) => (
            <div key={row.id} className="px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  
                  <Avatar name={row.name} size={38} />
                  <div className="leading-tight">
                    <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{row.name}</div>
                    <div className="text-[12.5px] text-slate-400 dark:text-slate-500">{row.role}</div>
                  </div>
                </div>

                <StatusBadge status={row.status} />
              </div>

              <div className="grid grid-cols-2 gap-y-2 pl-1 text-[12.5px]">
                <div className="text-slate-400 dark:text-slate-500">Project</div>
                <div className="text-right">
                  <a href={row.projectHref || "#"} className="font-medium text-secondary-500 dark:text-secondary-400">
                    {row.project}
                  </a>
                </div>

                <div className="text-slate-400 dark:text-slate-500">Team</div>
                <div className="flex justify-end"><TeamAvatars team={row.team} /></div>

                <div className="text-slate-400 dark:text-slate-500">Budget</div>
                <div className="text-right font-semibold text-slate-700 dark:text-slate-200">{row.budget}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}