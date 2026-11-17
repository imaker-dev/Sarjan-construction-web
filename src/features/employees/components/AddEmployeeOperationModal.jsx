import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Check } from "lucide-react";

import ModalBasic from "@components/ui/ModalBasic";
import SearchBar from "@components/ui/SearchBar";
import { getOperationsCatalogue } from "@store/slices/operation.slice";
import { SelectField } from "@components/fields/SelectField";

const AddEmployeeOperationModal = ({
  isOpen,
  onClose,
  assignedOperationKeys = [],
  loading = false,
  onSubmit,
}) => {
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [activeDomain, setActiveDomain] = useState("ALL");
  const [selectedOperation, setSelectedOperation] = useState(null);

  const { isListingOperationsCatalogue, operationsCatalogueData } = useSelector(
    (state) => state.operation,
  );

  useEffect(() => {
    if (!isOpen) return;

    setSearch("");
    setActiveDomain("ALL");
    setSelectedOperation(null);

    dispatch(getOperationsCatalogue());
  }, [isOpen, dispatch]);

  const catalogue = Array.isArray(operationsCatalogueData)
    ? operationsCatalogueData
    : [];

  const assignedKeys = useMemo(
    () => new Set(assignedOperationKeys),
    [assignedOperationKeys],
  );

  const domainOptions = useMemo(() => {
    const uniqueDomains = [
      ...new Set(
        catalogue.map((operation) => operation.domain).filter(Boolean),
      ),
    ];

    return [
      {
        value: "ALL",
        label: `All Domains (${catalogue.length})`,
      },
      ...uniqueDomains.map((domain) => ({
        value: domain,
        label: domain.replaceAll("_", " "),
      })),
    ];
  }, [catalogue]);

  const filteredOperations = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return catalogue.filter((operation) => {
      const matchesDomain =
        activeDomain === "ALL" || operation.domain === activeDomain;

      const matchesSearch =
        !searchValue ||
        operation.name?.toLowerCase().includes(searchValue) ||
        operation.description?.toLowerCase().includes(searchValue) ||
        operation.key?.toLowerCase().includes(searchValue);

      return matchesDomain && matchesSearch;
    });
  }, [catalogue, activeDomain, search]);

  const availableCount = filteredOperations.filter(
    (operation) => !assignedKeys.has(operation.key),
  ).length;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedOperation || loading) return;

    onSubmit?.(selectedOperation);
  };

  return (
    <ModalBasic
      isOpen={isOpen}
      onClose={onClose}
      title="Add Employee Operation"
      description="Select an operation to assign to this employee."
      size="xl"
      className="flex max-h-[85vh] flex-col"
    >
      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-col overflow-hidden"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-5">
          {/* Search and Domain Filter */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="min-w-0 flex-1">
              <SearchBar
                placeholder="Search operations..."
                value={search}
                onSearch={setSearch}
              />
            </div>

            <div className="w-[145px] shrink-0 sm:w-[190px]">
              <SelectField
                name="domain"
                value={activeDomain}
                onChange={(e) => setActiveDomain(e.target.value)}
                options={domainOptions}
                placeholder="All Domains"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex shrink-0 items-center justify-between">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {availableCount}
              </span>{" "}
              available operations
            </p>

            {selectedOperation && (
              <button
                type="button"
                onClick={() => setSelectedOperation(null)}
                disabled={loading}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-red-500"
              >
                Clear selection
              </button>
            )}
          </div>

          {/* Operations List */}
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {isListingOperationsCatalogue ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center">
                <Loader2 size={22} className="animate-spin text-primary-500" />
                <span className="mt-3 text-sm text-muted-foreground">
                  Loading operations...
                </span>
              </div>
            ) : filteredOperations.length === 0 ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
                <p className="text-sm font-semibold text-foreground">
                  No operations found
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try another search or select a different domain.
                </p>
              </div>
            ) : (
              filteredOperations.map((operation) => {
                const isAssigned = assignedKeys.has(operation.key);
                const isSelected = selectedOperation?.key === operation.key;

                return (
                  <button
                    key={operation.key}
                    type="button"
                    disabled={isAssigned || loading}
                    onClick={() =>
                      setSelectedOperation(isSelected ? null : operation)
                    }
                    aria-pressed={isSelected}
                    className={`group flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-150 ${
                      isAssigned
                        ? "cursor-not-allowed border-border bg-muted/40 opacity-65"
                        : isSelected
                          ? "border-primary-500 bg-primary-500/[0.06] ring-1 ring-primary-500/15 dark:bg-primary-500/10"
                          : "border-border bg-card hover:border-primary-400/60 hover:bg-muted/40"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          className={`flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-md border transition-all ${
                            isSelected
                              ? "border-primary-500 bg-primary-500 text-white"
                              : isAssigned
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-border bg-background group-hover:border-primary-400"
                          }`}
                        >
                          {(isSelected || isAssigned) && (
                            <Check size={12} strokeWidth={3} />
                          )}
                        </span>

                        <span
                          className={`min-w-0 truncate text-[13px] font-semibold ${
                            isSelected
                              ? "text-primary-600 dark:text-primary-300"
                              : "text-foreground"
                          }`}
                        >
                          {operation.name}
                        </span>

                        {operation.sensitive && (
                          <span className="shrink-0 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                            Sensitive
                          </span>
                        )}

                        {isAssigned && (
                          <span className="shrink-0 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            Assigned
                          </span>
                        )}
                      </span>

                      {operation.description && (
                        <span className="mt-1 block pl-[27px] text-xs leading-5 text-muted-foreground line-clamp-2">
                          {operation.description}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-dialog p-4 sm:px-5">
          <div className="min-w-0 flex-1">
            {selectedOperation ? (
              <p className="truncate text-xs text-muted-foreground">
                Selected:{" "}
                <span className="font-semibold text-foreground">
                  {selectedOperation.name}
                </span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Select an operation to continue
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-outline whitespace-nowrap"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading || isListingOperationsCatalogue || !selectedOperation
              }
              className="btn btn-primary inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Adding..." : "Add Operation"}
            </button>
          </div>
        </div>
      </form>
    </ModalBasic>
  );
};

export default AddEmployeeOperationModal;
