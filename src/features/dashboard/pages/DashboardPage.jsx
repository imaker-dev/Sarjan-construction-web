import { useEffect } from "react";
import FormElementsDemo from "../components/FormElementsDemo";
import DateRangePicker from "@components/fields/DateRangePicker";
import useDateRange from "@hooks/useDateRange";

const DashboardPage = () => {
  const { startDate, endDate, pickerProps } = useDateRange();

  useEffect(() => {
    console.log({ startDate, endDate });
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back. Here's what's happening today.
        </p>
      </div>

      <DateRangePicker {...pickerProps} placeholder="Select Date Range" />

      {/* <FormElementsDemo /> */}
    </div>
  );
};

export default DashboardPage;
