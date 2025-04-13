"use client";

import React from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = "" }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-100 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 ${className}`}
    >
      {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
      <div className="space-y-2">{children}</div>
    </div>
  );
};

export default Card;
