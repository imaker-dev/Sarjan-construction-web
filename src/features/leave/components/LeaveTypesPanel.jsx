import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IconPlus, IconPencil, IconArchive, IconTag } from "@tabler/icons-react";
import DataTable from "@components/ui/DataTable";
import ModalBasic from "@components/ui/ModalBasic";
import StatusBadge, { getStatusTone } from "@components/ui/StatusBadge";
import RefreshButton from "@components/ui/RefreshButton";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import { TextareaField } from "@components/fields/TextareaField";
import {
  listLeaveTypes,
  createLeaveType,
  updateLeaveType,
  archiveLeaveType,
} from "@store/slices/leave.slice";
import { LEAVE_TYPE_OPTIONS } from "./ApplyLeaveModal";

const ENUM_MAPPING_OPTIONS = [
  { label: "None (Custom type)", value: "" },
  ...LEAVE_TYPE_OPTIONS,
];

export default function LeaveTypesPanel() {
  const dispatch = useDispatch();
  const { leaveTypes, isLoadingLeaveTypes, isMutatingLeave } = useSelector((state) => state.leave);
  const [modalTarget, setModalTarget] = useState(null); // null | "create" | typeObj

  const loadTypes = useCallback(() => {
    dispatch(listLeaveTypes());
  }, [dispatch]);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  const isEdit = Boolean(modalTarget && modalTarget !== "create");

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      code: isEdit ? modalTarget.code || "" : "",
      name: isEdit ? modalTarget.name || "" : "",
      leaveType: isEdit ? modalTarget.leaveType || "" : "",
      description: isEdit ? modalTarget.description || "" : "",
    },
    validationSchema: Yup.object({
      code: isEdit
        ? Yup.string().nullable()
        : Yup.string().trim().max(20, "Max 20 chars").required("Code is required"),
      name: Yup.string().trim().required("Name is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        if (isEdit) {
          await dispatch(
            updateLeaveType({
              id: modalTarget.id,
              values: {
                name: values.name.trim(),
                description: values.description.trim() || null,
                expectedVersion: modalTarget.version ?? 0,
              },
            })
          ).unwrap();
        } else {
          await dispatch(
            createLeaveType({
              code: values.code.trim().toUpperCase(),
              name: values.name.trim(),
              ...(values.description.trim() ? { description: values.description.trim() } : {}),
              ...(values.leaveType ? { leaveType: values.leaveType } : {}),
            })
          ).unwrap();
        }
        resetForm();
        setModalTarget(null);
        loadTypes();
      } catch {
        // handled in slice
      }
    },
  });

  const columns = useMemo(
    () => [
      {
        key: "code",
        header: "Code",
        render: (t) => <span className="font-mono font-semibold text-xs">{t.code}</span>,
      },
      {
        key: "name",
        header: "Leave Type",
        render: (t) => (
          <div>
            <span className="font-semibold text-xs block text-slate-800 dark:text-slate-100">
              {t.name}
            </span>
            {t.description && (
              <span className="text-[11px] text-slate-400">{t.description}</span>
            )}
          </div>
        ),
      },
      {
        key: "leaveType",
        header: "Request Mapping",
        render: (t) => (
          <StatusBadge
            label={t.leaveType || "CUSTOM"}
            tone={t.leaveType ? "indigo" : "slate"}
            size="xs"
          />
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (t) => (
          <StatusBadge
            label={t.status || "ACTIVE"}
            tone={getStatusTone(t.status || "ACTIVE")}
            size="xs"
          />
        ),
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        label: "Edit",
        icon: IconPencil,
        onClick: (t) => setModalTarget(t),
      },
      {
        label: "Archive",
        icon: IconArchive,
        hidden: (t) => t.status === "ARCHIVED",
        onClick: async (t) => {
          try {
            await dispatch(archiveLeaveType(t.id)).unwrap();
            loadTypes();
          } catch {
            // handled
          }
        },
      },
    ],
    [dispatch, loadTypes]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setModalTarget("create")}
          className="btn btn-primary btn-sm h-9 inline-flex items-center gap-1.5"
        >
          <IconPlus size={15} />
          <span>Add Leave Type</span>
        </button>
        <RefreshButton
          onClick={loadTypes}
          loading={isLoadingLeaveTypes}
          className="h-9 w-9 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/60"
        />
      </div>

      <DataTable
        columns={columns}
        data={leaveTypes}
        actions={actions}
        loading={isLoadingLeaveTypes}
        empty={{
          icon: IconTag,
          title: "No Leave Types",
          description: "Create leave type definitions (e.g. CL, SL, EL) for your company.",
        }}
      />

      <ModalBasic
        isOpen={Boolean(modalTarget)}
        onClose={() => setModalTarget(null)}
        title={isEdit ? "Edit Leave Type" : "Create Leave Type"}
        size="md"
      >
        <form onSubmit={formik.handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              id="ltCode"
              name="code"
              label="Code"
              required={!isEdit}
              disabled={isEdit}
              placeholder="e.g. CL"
              value={formik.values.code}
              onChange={formik.handleChange}
              error={formik.touched.code && formik.errors.code}
            />
            <InputField
              id="ltName"
              name="name"
              label="Name"
              required
              placeholder="e.g. Casual Leave"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && formik.errors.name}
            />
          </div>
          {!isEdit && (
            <SelectField
              id="ltEnum"
              name="leaveType"
              label="Request Enum Mapping"
              options={ENUM_MAPPING_OPTIONS}
              value={formik.values.leaveType}
              onChange={formik.handleChange}
            />
          )}
          <TextareaField
            id="ltDesc"
            name="description"
            label="Description (Optional)"
            value={formik.values.description}
            onChange={formik.handleChange}
          />
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => setModalTarget(null)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isMutatingLeave}>
              {isMutatingLeave ? "Saving..." : isEdit ? "Save Changes" : "Create Type"}
            </button>
          </div>
        </form>
      </ModalBasic>
    </div>
  );
}
