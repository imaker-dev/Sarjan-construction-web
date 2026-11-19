import { useEffect } from "react";
import FormElementsDemo from "../components/FormElementsDemo";
import DateRangePicker from "@components/fields/DateRangePicker";
import useDateRange from "@hooks/useDateRange";
import StatCard from "@components/ui/StatCard";
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Clock,
  DollarSign,
  FileText,
  FolderDown,
  FolderKanban,
  MessageCircle,
  Share2,
  Timer,
  Truck,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

const DashboardPage = () => {
  const { startDate, endDate, pickerProps } = useDateRange();

  // useEffect(() => {
  //   console.log({ startDate, endDate });
  // }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back. Here's what's happening today.
        </p>
      </div>

      {/* <DateRangePicker {...pickerProps} placeholder="Select Date Range" /> */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Income" value="$95.3k" icon={DollarSign} color="sky" />
        <StatCard label="Pending" value={485} icon={Clock} color="teal" />
        <StatCard
          label="Completed"
          value={1400}
          icon={BadgeCheck}
          color="amber"
        />
        <StatCard label="Shipping" value={996} icon={Truck} color="blue" />
        <StatCard label="Cancelled" value={1100} icon={XCircle} color="rose" />
      </div>

      {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          variant="card"
          label="Overdue amount"
          value="$2,050"
          icon={Wallet}
          color="amber"
          progress={40}
        />
        <StatCard
          variant="card"
          label="Drafted totals"
          value="$4,600"
          icon={FileText}
          color="sky"
          progress={20}
        />
        <StatCard
          variant="card"
          label="Unpaid totals"
          value="$2,050"
          icon={FolderDown}
          color="rose"
          progress={80}
        />
        <StatCard
          variant="card"
          label="Average paid time"
          value="7 days"
          icon={Timer}
          color="teal"
          progress={10}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          variant="tile"
          label="Employees"
          value={96}
          icon={Users}
          color="blue"
        />
        <StatCard
          variant="tile"
          label="Clients"
          value={3650}
          icon={Briefcase}
          color="amber"
        />
        <StatCard
          variant="tile"
          label="Projects"
          value={356}
          icon={FolderKanban}
          color="sky"
        />
        <StatCard
          variant="tile"
          label="Events"
          value={696}
          icon={CalendarDays}
          color="rose"
        />
        <StatCard
          variant="tile"
          label="Payroll"
          value="$96k"
          icon={MessageCircle}
          color="teal"
        />
        <StatCard
          variant="tile"
          label="Reports"
          value={59}
          icon={Share2}
          color="blue"
        />
      </div> */}

      {/* <FormElementsDemo /> */}
    </div>
  );
};

export default DashboardPage;
