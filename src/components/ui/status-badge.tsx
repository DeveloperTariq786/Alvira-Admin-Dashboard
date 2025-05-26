import React from "react";
import { cn } from "@/lib/utils";

// Define a more comprehensive status type if needed, or use string for flexibility
// export type BadgeStatus = 
//   | "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
//   | "paid" | "unpaid" | "failed" | "payment_pending" // Add more as needed
//   | "active" | "inactive" | "on_hold";

interface StatusBadgeProps {
  status: string; // Allow any string, or a more specific union type
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const normalizedStatus = status.toLowerCase().replace(/_/g, " ");

  const getStatusClasses = () => {
    switch (normalizedStatus) {
      // Order Statuses
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "payment pending": // For orders awaiting payment
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "refunded":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      
      // Payment Statuses (derived)
      case "paid": // This was 'completed' before, aligning with derived status in Orders.tsx
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "unpaid": // Example if you derive this
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";

      // General Statuses (examples)
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "on hold":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300";

      default:
        return "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusLabel = () => {
    // Capitalize first letter of each word
    return normalizedStatus
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold leading-none", // Adjusted for better visibility and common practice
        getStatusClasses(), 
        className
      )}
    >
      {getStatusLabel()}
    </span>
  );
};
