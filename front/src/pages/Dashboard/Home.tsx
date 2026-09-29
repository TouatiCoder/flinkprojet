import ChartHome from "../../components/dashboard/Home/ChartHome";
import DiffHome from "../../components/dashboard/Home/DiffHome";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import PageMeta from "../../components/common/PageMeta";
import {
  GroupIcon,
  CheckCircleIcon,
  AlertHexaIcon,
  AlertIcon,
} from "../../icons";
import StatCardUser, { StatItem } from "../../components/dashboard/StatCardUser";
import ChartTwoHome from "../../components/dashboard/Home/ChartTwoHome";
import ChartColor from "../../components/dashboard/Home/ChartColor";
import ResentHome from "../../components/dashboard/Home/ResentHome";

function HomeState(): StatItem[] {
  return [
    {
      title: "Total utilisateurs",
      value: 450,
      icon: <GroupIcon className="w-5 h-5 fill-current" />,
      percentage: "12.5% ce mois",
      isPositive: true,
      iconBgClass: "bg-blue-600",
    },
    {
      title: "Avec comptes Pro",
      value: 45,
      icon: <CheckCircleIcon className="w-5 h-5 fill-current" />,
      percentage: "8.3% ce mois",
      isPositive: true,
      iconBgClass: "bg-emerald-500",
    },
    {
      title: "Abonnements expirés",
      value: 99,
      icon: <AlertHexaIcon className="w-5 h-5 fill-current" />,
      percentage: "4.6% ce mois",
      isPositive: false,
      iconBgClass: "bg-amber-500",
    },
    {
      title: "Signalés",
      value: 69,
      icon: <AlertIcon className="w-5 h-5 fill-current" />,
      percentage: "2.1% ce mois",
      isPositive: false,
      iconBgClass: "bg-red-500",
    },
  ];
}

export default function Home() {
  return (
    <>
      <StatCardUser items={HomeState()} />
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          {/* <EcommerceMetrics /> */}
          <ChartHome />
        </div>

        <div className="col-span-12 xl:col-span-5">
          {/* <MonthlyTarget />  */}
          {/* <MonthlySalesChart /> */}
          <DiffHome />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <ChartTwoHome />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <ChartColor />
        </div>

        <div className="col-span-12">
          <ResentHome />
        </div>
      </div>
    </>
  );
}
