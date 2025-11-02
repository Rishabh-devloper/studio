import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type SummaryCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  change: number;
};

export default function SummaryCard({
  title,
  value,
  icon,
  change,
}: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(value)}</div>
        <p
          className={cn(
            "text-xs text-muted-foreground",
            change > 0 ? "text-green-600" : "text-red-600"
          )}
        >
          {change > 0 ? "+" : ""}
          {change.toFixed(1)}% from last month
        </p>
      </CardContent>
    </Card>
  );
}
