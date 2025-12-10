import React from "react";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  variant?: "primary" | "orange" | "yellow" | "green";
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  variant = "primary",
  className = "",
}: StatCardProps) {
  const badgeClasses = {
    primary: "bg-primary/10",
    orange: "bg-orange-100 dark:bg-orange-900/30",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30",
    green: "bg-green-100 dark:bg-green-900/30",
  } as const;

  return (
    <div className={`bg-secondary/50 dark:bg-foreground/10 rounded-xl p-4 text-center ${className}`}>
      <div className={`w-10 h-10 rounded-full ${badgeClasses[variant]} flex items-center justify-center mx-auto mb-2`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
}
