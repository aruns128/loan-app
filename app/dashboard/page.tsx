"use client";

import Card from "@/components/Card";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { BsCurrencyRupee } from "react-icons/bs";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/loans")
      .then((res) => res.json())
      .then((loans) => setData(loans));
  }, []);

  if (!data.length) return <div className="text-center p-6 text-gray-600">Loading...</div>;

  const totalPrincipal = data.reduce(
    (acc, loan: any) => acc + (loan.principal || 0),
    0
  );
  const totalEarned = data.reduce(
    (acc, loan: any) => acc + (loan.earned_amount || 0),
    0
  );

  const top5UpcomingLoans = data
    .filter((loan: any) => loan.status !== "Returned")
    .slice(0, 5);

  const returnedLoans = data.filter((loan: any) => loan.status === "Returned");

  const earningsOverTime = returnedLoans.map((loan: any) => ({
    name: loan.borrower_name,
    earned: loan.earned_amount,
  }));

  return (
    <Navbar>
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="shadow-lg rounded-2xl p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-4">
            <BsCurrencyRupee className="h-10 w-10 text-green-600" />
            <div>
              <h3 className="text-sm text-gray-600">Total Principal</h3>
              <p className="text-2xl font-bold text-green-700">
                ₹{totalPrincipal.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="shadow-lg rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-4">
            <HiArrowTrendingUp className="h-10 w-10 text-blue-600" />
            <div>
              <h3 className="text-sm text-gray-600">Total Earned</h3>
              <p className="text-2xl font-bold text-blue-700">
                ₹{totalEarned.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6 shadow-xl rounded-2xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Earnings Overview</h2>

          {/* Scrollable container */}
          <div className="overflow-x-auto">
            {/* Set a min-width so the chart scrolls on small screens */}
            <div className="min-w-[600px]">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={earningsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Line
                    type="monotone"
                    dataKey="earned"
                    stroke="#3b82f6"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>


        <Card className="p-6 shadow-xl rounded-2xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Next 5 Borrowers</h2>
          <ul className="divide-y divide-gray-200">
            {top5UpcomingLoans.map((loan: any, index) => (
              <li key={index} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="font-semibold text-gray-800">{loan.borrower_name}</p>
                  <p className="text-sm text-gray-500">Start: {new Date(loan.start_date).toLocaleDateString()}</p>
                </div>
                <div className="mt-2 sm:mt-0 text-right">
                  <p className="text-green-600 font-semibold">₹{loan.principal.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">ROI/M: {loan.roi_per_month}%</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6 shadow-xl rounded-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Returned Loans</h2>
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left bg-white">
            <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3">Borrower</th>
                <th className="px-4 py-3">Principal (₹)</th>
                <th className="px-4 py-3">Earned (₹)</th>
                <th className="px-4 py-3">ROI/M (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returnedLoans.map((loan: any, index) => (
                <tr key={loan._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{loan.borrower_name}</td>
                  <td className="px-4 py-3">₹{loan.principal.toLocaleString()}</td>
                  <td className="px-4 py-3">₹{loan.earned_amount.toLocaleString()}</td>
                  <td className="px-4 py-3">{loan.roi_per_month}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
    </Navbar>
  );
}
