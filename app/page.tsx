"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import * as yup from "yup";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { FiUser, FiLock } from "react-icons/fi";
import { motion } from "framer-motion";

type LoginFormInputs = {
  identifier: string; // email or username
  password: string;
};

const schema = yup.object().shape({
  identifier: yup.string().required("Email or username is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    login(data.identifier,data.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-6">Welcome Back</h2>

        {serverError && <p className="text-red-500 text-center mb-4">{serverError}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Identifier Input */}
          <div className="relative">
            <FiUser className="absolute left-3 top-3 text-blue-500" />
            <input
              type="text"
              placeholder="Email or Username"
              {...register("identifier")}
              className={`pl-10 w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                errors.identifier ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
              }`}
            />
            {errors.identifier && <p className="text-red-500 text-sm mt-1">{errors.identifier.message}</p>}
          </div>

          {/* Password Input */}
          <div className="relative">
            <FiLock className="absolute left-3 top-3 text-blue-500" />
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className={`pl-10 w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                errors.password ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
              }`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-md transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
