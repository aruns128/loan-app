"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const UnauthorizedPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the login page after showing the unauthorized message
    setTimeout(() => {
      router.push("/");
    }, 3000);
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-red-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-red-600">Unauthorized Access</h2>
        <p className="mt-4 text-gray-600">You don't have permission to access this page. You will be redirected to the login page.</p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
