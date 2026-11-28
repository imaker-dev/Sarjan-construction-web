import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IconCalendarEvent, IconPlus, IconTag, IconTrash } from "@tabler/icons-react";
import DataTable from "@components/ui/DataTable";
import ModalBasic from "@components/ui/ModalBasic";
import StatusBadge, { getStatusTone } from "@components/ui/StatusBadge";
import RefreshButton from "@components/ui/RefreshButton";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import {
  listHolidayCategories,
  createHolidayCategory,
  listHolidayCalendars,
  createHolidayCalendar,
  listCalendarHolidays,
  bulkAddHolidays,
  cancelHoliday,
} from "@store/slices/schedule.slice";
import { formatDate } from "@utils/date.utils";

export default function HolidayCalendarsPanel({ canManage = false }) {
  const dispatch = useDispatch();
  const {
    holidayCategories,
    holidayCalendars,
    calendarHolidays,
    isLoadingHolidays,
    isMutatingSchedule,
  } = useSelector((state) => state.schedule);

  const currentYear = new Date().getFullYear();
  const [selectedCalendarId, setSelectedCalendarId] = useState("");
  const [fromDate, setFromDate] = useState(`${currentYear}-01-01`);
  const [toDate, setToDate] = useState(`${currentYear}-12-31`);

  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isCalOpen, setIsCalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const loadMeta = useCallback(() => {
    dispatch(listHolidayCategories());
    dispatch(listHolidayCalendars());
  }, [dispatch]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    if (!selectedCalendarId && holidayCalendars.length > 0) {
      setSelectedCalendarId(holidayCalendars[0].id);
    }
  }, [holidayCalendars, selectedCalendarId]);

  const loadHolidays = useCallback(() => {
    if (!selectedCalendarId) return;
    dispatch(
      listCalendarHolidays({
        id: selectedCalendarId,
        params: { from: fromDate, to: toDate },
      })
    );
  }, [dispatch, selectedCalendarId, fromDate, toDate]);

  useEffect(() => {
    loadHolidays();
  }, [loadHolidays]);

  const calendarOptions = useMemo(
    () =>
      holidayCalendars.map((c) => ({
        label: c.code ? `${c.name} (${c.code})` : c.name,
        value: c.id,
      })),
    [holidayCalendars]
  );

  const categoryOptions = useMemo(
    () =>
      holidayCategories.map((c) => ({
        label: c.code ? `${c.name} (${c.code})` : c.name,
        value: c.id,
      })),
    [holidayCategories]
  );

  // Create Category
  const catFormik = useFormik({
    initialValues: { code: "", name: "" },
    validationSchema: Yup.object({
      code: Yup.string().trim().required("Code is required"),
      name: Yup.string().trim().required("Name is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await dispatch(
          createHolidayCategory({
            code: values.code.trim().toUpperCase(),
            name: values.name.trim(),
          })
        ).unwrap();
        resetForm();
        setIsCatOpen(false);
        dispatch(listHolidayCategories());
      } catch {
        // handled
      }
    },
  });

  // Create Calendar
  const calFormik = useFormik({
    initialValues: { code: `CAL-${currentYear}`, name: `Company Calendar ${currentYear}` },
    validationSchema: Yup.object({
      code: Yup.string().trim().required("Code is required"),
      name: Yup.string().trim().required("Name is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await dispatch(
          createHolidayCalendar({
            code: values.code.trim().toUpperCase(),
            name: values.name.trim(),
          })
        ).unwrap();
        const created = res?.data || res;
        resetForm();
        setIsCalOpen(false);
        dispatch(listHolidayCalendars());
        if (created?.id) setSelectedCalendarId(created.id);
      } catch {
        // handled
      }
    },
  });

  // Bulk Add Holidays
  const bulkFormik = useFormik({
    initialValues: {
      rows: [{ date: `${currentYear}-01-26`, name: "", categoryId: categoryOptions[0]?.value || "" }],
    },
    validationSchema: Yup.object({
      rows: Yup.array()
        .of(
          Yup.object({
            date: Yup.string().required("Date required"),
            name: Yup.string().trim().required("Name required"),
            categoryId: Yup.string().nullable(),
          })
        )
        .min(1),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!selectedCalendarId) return;
      try {
        await dispatch(
          bulkAddHolidays({
            id: selectedCalendarId,
            values: {
              holidays: values.rows.map((r) => ({
                date: r.date,
                name: r.name.trim(),
                ...(r.categoryId ? { categoryId: r.categoryId } : {}),
              })),
            },
          })
        ).unwrap();
        resetForm();
        setIsBulkOpen(false);
        loadHolidays();
      } catch {
        // handled
      }
    },
  });

  const columns = useMemo(
    () => [
      {
        key: "date",
        header: "Date",
        render: (h) => <span className="text-xs font-medium tabular-nums">{formatDate(h.date)}</span>,
      },
      {
        key: "name",
        header: "Holiday",
        render: (h) => <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">{h.name}</span>,
      },
      {
        key: "category",
        header: "Category",
        render: (h) => (
          <StatusBadge label={h.category?.name || h.category?.code || "Holiday"} tone="indigo" size="xs" />
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (h) => (
          <StatusBadge
            label={h.status || "ACTIVE"}
            tone={getStatusTone(h.status || "ACTIVE")}
            size="xs"
          />
        ),
      },
    ],
    []
  );

  const actions = useMemo(
    () =>
      canManage
        ? [
          {
            label: "Cancel Holiday",
            icon: IconTrash,
            hidden: (h) => h.status === "ARCHIVED" || h.status === "CANCELLED",
            onClick: async (h) => {
              try {
                await dispatch(
                  cancelHoliday({ calendarId: selectedCalendarId, holidayId: h.id })
                ).unwrap();
                loadHolidays();
              } catch {
                // handled
              }
            },
          },
        ]
        : [],
    [canManage, dispatch, selectedCalendarId, loadHolidays]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-white dark:bg-[#1C2536]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-56">
            <SelectField
              id="holidayCalSelect"
              name="selectedCalendarId"
              placeholder="Select calendar"
              options={calendarOptions}
              value={selectedCalendarId}
              onChange={(e) => setSelectedCalendarId(e.target.value)}
            />
          </div>
          <div className="w-40">
            <InputField
              id="calFrom"
              name="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="w-40">
            <InputField
              id="calTo"
              name="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => setIsCatOpen(true)}
                className="btn btn-outline btn-sm h-10 inline-flex items-center gap-1.5"
              >
                <IconTag size={15} />
                <span>Add Category</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCalOpen(true)}
                className="btn btn-outline btn-sm h-10 inline-flex items-center gap-1.5"
              >
                <IconPlus size={15} />
                <span>New Calendar</span>
              </button>
              <button
                type="button"
                disabled={!selectedCalendarId}
                onClick={() => setIsBulkOpen(true)}
                className="btn btn-primary btn-sm h-10 inline-flex items-center gap-1.5"
              >
                <IconPlus size={15} />
                <span>Add Holidays</span>
              </button>
            </>
          )}
          <RefreshButton
            onClick={loadHolidays}
            loading={isLoadingHolidays}
            className="h-10 w-10 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/60"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={calendarHolidays}
        actions={actions}
        loading={isLoadingHolidays}
        empty={{
          icon: IconCalendarEvent,
          title: "No Holidays Found",
          description: selectedCalendarId
            ? "No holidays in this calendar for the selected date range."
            : "Create or select a holiday calendar to manage holidays.",
        }}
      />

      {/* Create Category Modal */}
      <ModalBasic isOpen={isCatOpen} onClose={() => setIsCatOpen(false)} title="New Holiday Category" size="sm">
        <form onSubmit={catFormik.handleSubmit} className="space-y-4 p-6">
          <InputField
            id="catCode"
            name="code"
            label="Category Code"
            required
            placeholder="e.g. NH"
            value={catFormik.values.code}
            onChange={catFormik.handleChange}
            error={catFormik.touched.code && catFormik.errors.code}
          />
          <InputField
            id="catName"
            name="name"
            label="Category Name"
            required
            placeholder="e.g. National Holiday"
            value={catFormik.values.name}
            onChange={catFormik.handleChange}
            error={catFormik.touched.name && catFormik.errors.name}
          />
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => setIsCatOpen(false)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isMutatingSchedule}>
              Create
            </button>
          </div>
        </form>
      </ModalBasic>

      {/* Create Calendar Modal */}
      <ModalBasic isOpen={isCalOpen} onClose={() => setIsCalOpen(false)} title="New Holiday Calendar" size="sm">
        <form onSubmit={calFormik.handleSubmit} className="space-y-4 p-6">
          <InputField
            id="calCode"
            name="code"
            label="Calendar Code"
            required
            value={calFormik.values.code}
            onChange={calFormik.handleChange}
            error={calFormik.touched.code && calFormik.errors.code}
          />
          <InputField
            id="calName"
            name="name"
            label="Calendar Name"
            required
            value={calFormik.values.name}
            onChange={calFormik.handleChange}
            error={calFormik.touched.name && calFormik.errors.name}
          />
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => setIsCalOpen(false)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isMutatingSchedule}>
              Create
            </button>
          </div>
        </form>
      </ModalBasic>

      {/* Bulk Add Holidays Modal */}
      <ModalBasic isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} title="Add Holidays" size="lg">
        <form onSubmit={bulkFormik.handleSubmit} className="space-y-4 p-6">
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {bulkFormik.values.rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className="sm:col-span-4">
                  <InputField
                    id={`hDate_${idx}`}
                    name={`rows[${idx}].date`}
                    type="date"
                    value={row.date}
                    onChange={bulkFormik.handleChange}
                    required
                  />
                </div>
                <div className="sm:col-span-4">
                  <InputField
                    id={`hName_${idx}`}
                    name={`rows[${idx}].name`}
                    placeholder="e.g. Republic Day"
                    value={row.name}
                    onChange={bulkFormik.handleChange}
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <SelectField
                    id={`hCat_${idx}`}
                    name={`rows[${idx}].categoryId`}
                    placeholder="Category"
                    options={categoryOptions}
                    value={row.categoryId}
                    onChange={bulkFormik.handleChange}
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  {bulkFormik.values.rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        bulkFormik.setFieldValue(
                          "rows",
                          bulkFormik.values.rows.filter((_, i) => i !== idx)
                        )
                      }
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg"
                    >
                      <IconTrash size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              bulkFormik.setFieldValue("rows", [
                ...bulkFormik.values.rows,
                { date: `${currentYear}-08-15`, name: "", categoryId: categoryOptions[0]?.value || "" },
              ])
            }
            className="btn btn-outline btn-xs inline-flex items-center gap-1"
          >
            <IconPlus size={14} />
            <span>Add Row</span>
          </button>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => setIsBulkOpen(false)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isMutatingSchedule}>
              {isMutatingSchedule ? "Saving..." : "Save Holidays"}
            </button>
          </div>
        </form>
      </ModalBasic>
    </div>
  );
}
