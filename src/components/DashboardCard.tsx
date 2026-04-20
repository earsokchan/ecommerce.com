import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  change: string;
}

export default function DashboardCard({ title, value, icon, change }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {change.startsWith('+') ? (
            <span className="text-green-500">{change} from last period</span>
          ) : (
            <span className="text-red-500">{change} from last period</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}