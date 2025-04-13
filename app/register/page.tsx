"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { motion } from "framer-motion";

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[0-9]/, "Must contain at least one number"),
});

type FormData = Yup.InferType<typeof validationSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();
    if (result.success) {
      router.push("/");
    } else {
      setError(result.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Create Account</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <motion.div whileFocus={{ scale: 1.02 }}>
            <input
              {...register("name")}
              placeholder="Full Name"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </motion.div>

          {/* Username */}
          <motion.div whileFocus={{ scale: 1.02 }}>
            <input
              {...register("username")}
              placeholder="Username"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </motion.div>

          {/* Email */}
          <motion.div whileFocus={{ scale: 1.02 }}>
            <input
              {...register("email")}
              type="email"
              placeholder="Email"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </motion.div>

          {/* Password */}
          <motion.div whileFocus={{ scale: 1.02 }}>
            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </motion.div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-md transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
