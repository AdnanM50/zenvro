"use client";

import React from "react";

const ACTIVITIES = [
  {
    id: 1,
    time: "12 Hrs",
    user: "John Doe",
    action: "Updated the product description for Widget X.",
    dotColor: "bg-[#6366F1]",
    ringColor: "ring-[#6366F1]/20",
  },
  {
    id: 2,
    time: "4:32pm",
    user: "Jane Smith",
    action: "added a new user with username janesmith89.",
    dotColor: "bg-[#EC4899]",
    ringColor: "ring-[#EC4899]/20",
  },
  {
    id: 3,
    time: "11:45am",
    user: "Michael Brown",
    action: "Changed the status of order #12345 to Shipped.",
    dotColor: "bg-[#F59E0B]",
    ringColor: "ring-[#F59E0B]/20",
  },
  {
    id: 4,
    time: "9:27am",
    user: "Sarah Connor",
    action: "Processed a refund for Order #9821.",
    dotColor: "bg-[#10B981]",
    ringColor: "ring-[#10B981]/20",
  },
];

export default function RecentActivityTimeline() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
      </div>

      <div className="relative pl-6 space-y-5 my-auto">
        {/* Continuous vertical connecting line */}
        <div className="absolute left-2 top-2 bottom-3 w-0.5 bg-gray-100 dark:bg-gray-800" />

        {ACTIVITIES.map((act) => (
          <div key={act.id} className="relative">
            {/* Colored circular dot */}
            <div
              className={`absolute -left-[1.85rem] top-1 w-3 h-3 rounded-full ${act.dotColor} ring-4 ${act.ringColor} bg-clip-padding`}
            />

            <div>
              <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mb-0.5">
                {act.time}
              </div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                {act.user}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                {act.action}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
