// components/ui/label.tsx
import * as React from "react";

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  className,
  ...props
}) => {
  return (
    <label
      className={`block text-sm font-medium text-gray-700 ${className || ""}`}
      {...props}
    />
  );
};
