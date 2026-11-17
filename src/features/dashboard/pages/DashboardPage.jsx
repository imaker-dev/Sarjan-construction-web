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

      {/* <FormElementsDemo /> */}
    </div>
  );
};

export default DashboardPage;
