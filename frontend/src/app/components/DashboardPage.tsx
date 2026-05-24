import { SummaryCards } from "./SummaryCards";
import { ResignationChart } from "./ResignationChart";
import { EmployeeTable } from "./EmployeeTable";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <SummaryCards />
      <ResignationChart />
      <EmployeeTable />
    </div>
  );
}
