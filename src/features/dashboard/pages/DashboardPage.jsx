import FormElementsDemo from "../components/FormElementsDemo";

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back. Here's what's happening today.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Card 1 */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Revenue</p>

          <h2 className="mt-2 text-3xl font-semibold">$24,500</h2>

          <p className="mt-2 text-sm text-success-500">
            +12.5% from last month
          </p>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Orders</p>

          <h2 className="mt-2 text-3xl font-semibold">1,248</h2>

          <p className="mt-2 text-sm text-success-500">+8.2% from last month</p>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Pending Orders</p>

          <h2 className="mt-2 text-3xl font-semibold">42</h2>

          <p className="mt-2 text-sm text-warning-500">Requires attention</p>
        </div>
      </div>

      {/* Large Card */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-base font-semibold">Recent Orders</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your latest customer orders.
          </p>
        </div>

        <div className="p-6">
          <p className="text-sm text-muted-foreground">No orders found.</p>
        </div>
      </div>

      <FormElementsDemo />
    </div>
  );
};

export default DashboardPage;
