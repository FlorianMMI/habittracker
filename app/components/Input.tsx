import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ error, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-2">
      
      <input
        {...props}
        className={`
          w-full px-3 py-2.5 
          bg-background border border-border rounded-lg
          text-foreground placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
          transition-colors duration-200
          ${error ? "border-destructive focus:ring-destructive/20" : ""}
          ${className}
        `}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}