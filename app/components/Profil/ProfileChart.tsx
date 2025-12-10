"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

/// ===========================================================================
/// TYPES
/// ===========================================================================

interface DailyStats {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

interface ProfileChartProps {
  weeklyStats: DailyStats[];
}

/// ===========================================================================
/// COMPONENT ProfileChart - Affiche un graphique des statistiques hebdomadaires
/// ===========================================================================

export default function ProfileChart({ weeklyStats }: ProfileChartProps) {
  if (!weeklyStats || weeklyStats.length === 0) {
    return (
      <div className="bg-secondary/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Activité des 7 derniers jours
        </h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Activité des 7 derniers jours
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#717182", fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#717182", fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as DailyStats;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium text-foreground">
                        {data.completed}/{data.total} habitudes
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {data.percentage}% complétées
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="percentage" 
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            >
              {weeklyStats.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.percentage === 100 ? "#10b981" : entry.percentage >= 50 ? "#f97316" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-muted-foreground">100%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-muted-foreground">50-99%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-muted-foreground">&lt;50%</span>
        </div>
      </div>
    </div>
  );
}
