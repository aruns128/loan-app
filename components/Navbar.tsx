"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FaBars, FaUser, FaHome, FaRegMoneyBillAlt } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (!isLoggedIn) return null;

    const navLinks = [
        { href: "/dashboard", label: "Dashboard", icon: <FaHome size={20} /> },
        { href: "/loans", label: "Loans", icon: <FaRegMoneyBillAlt size={20} /> },
    ];

    const isActive = (href: string) => pathname === href;

    const getPageTitle = (path: string) => {
        switch (path) {
            case "/dashboard":
                return "Dashboard";
            case "/loans":
                return "Loans";
            default:
                return "Loan Dashboard";
        }
    };

    const pageTitle = getPageTitle(pathname);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar - Desktop */}
            <div className="hidden lg:flex flex-col bg-gradient-to-b from-[#0127fa] to-[#c309ec] text-white w-64 fixed h-full z-20">
                <div className="py-6 border-b border-white text-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ffffff] via-[#d3a4f7] to-[#ffffff] text-transparent bg-clip-text">
                        {pageTitle}
                    </h1>
                </div>
                <div className="flex-1 flex flex-col justify-center px-6 space-y-4">
                    {navLinks.map(({ href, label, icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center space-x-3 text-lg px-3 py-2 rounded-md transition-colors ${isActive(href)
                                    ? "bg-blue-600 bg-opacity-10 text-white font-semibold"
                                    : "hover:bg-[#c309ec] hover:bg-opacity-20 text-white"
                                }`}
                        >
                            {icon}
                            <span>{label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-white bg-opacity-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <div
                        className="w-64 bg-gradient-to-b from-[#0127fa] to-[#c309ec] text-white h-full flex flex-col justify-between p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top - Page Title */}
                        <div className="mb-6 text-center">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#d3a4f7] to-white text-transparent bg-clip-text">
                                {pageTitle}
                            </h1>
                        </div>

                        {/* Middle - Navigation */}
                        <nav className="flex flex-col space-y-4">
                            {navLinks.map(({ href, label, icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center space-x-3 text-lg px-3 py-2 rounded-md transition-colors ${isActive(href)
                                            ? "bg-blue-600 bg-opacity-10 text-white font-semibold"
                                            : "hover:bg-[#c309ec] hover:bg-opacity-20 text-white"
                                        }`}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    {icon}
                                    <span>{label}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Bottom - Logout */}
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-white hover:text-red-400"
                            >
                                <FiLogOut />
                                <span className="font-bold">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content wrapper */}
            <div className="flex-1 flex flex-col w-full lg:ml-64">
                {/* Mobile Topbar */}
                <div className="lg:hidden bg-gradient-to-l from-[#0127fa] to-[#c309ec] shadow border-b p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10 text-white">
                    <button onClick={() => setIsSidebarOpen(true)}>
                        <FaBars size={24} />
                    </button>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white via-[#d3a4f7] to-white text-transparent bg-clip-text">
                        {pageTitle}
                    </h1>
                </div>

                {/* Desktop Topbar */}
                <div className="hidden lg:flex bg-gradient-to-l from-[#0127fa] to-[#c309ec] shadow border-b p-4 justify-between items-center fixed top-0 left-64 right-0 z-10 text-white">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white via-[#d3a4f7] to-white text-transparent bg-clip-text">
                        {pageTitle}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 hover:text-red-400"
                        >
                            <FiLogOut />
                            <span className="font-bold">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 pt-16 lg:pt-16 px-4 pb-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
