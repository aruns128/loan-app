"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FaBars, FaUser, FaHome, FaRegMoneyBillAlt } from "react-icons/fa";
import { useAuth } from "@/app/context/AuthContext";
import { FiLogOut } from "react-icons/fi";

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
            <div className="hidden lg:flex flex-col bg-blue-900 text-white w-64 fixed h-full z-20">
                <div className="text-2xl font-bold text-center py-6 border-b border-blue-800">
                    {pageTitle}
                </div>
                <div className="flex-1 flex flex-col justify-center px-6 space-y-4">
                    {navLinks.map(({ href, label, icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center space-x-3 text-lg px-2 py-2 rounded-md ${isActive(href)
                                ? "bg-blue-800 text-white"
                                : "hover:bg-blue-700 text-blue-100"
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
                    className="fixed inset-0 z-40 bg-slate-100 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <div
                        className="w-64 bg-blue-900 text-white h-full flex flex-col justify-between p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top - Page Title */}
                        <div className="text-2xl font-bold text-center mb-4">{pageTitle}</div>

                        {/* Middle - Navigation */}
                        <nav className="flex flex-col items-start space-y-4">
                            {navLinks.map(({ href, label, icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center space-x-3 text-lg px-2 py-2 rounded-md w-full ${isActive(href)
                                        ? "bg-blue-800 text-white"
                                        : "hover:bg-blue-700 text-blue-100"
                                        }`}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    {icon}
                                    <span>{label}</span>
                                </Link>
                            ))}
                        </nav>


                        <div className="flex items-center justify-center text-red-600 mt-6">
                            <button className="flex items-center space-x-2" onClick={handleLogout}>
                                <FiLogOut />
                                <span className="text-red-600 font-bold">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content wrapper */}
            <div className="flex-1 flex flex-col w-full lg:ml-64">
                {/* Mobile Topbar */}
                <div className="lg:hidden bg-white shadow border-b p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-blue-700">
                        <FaBars size={24} />
                    </button>
                    <div className="text-xl font-bold text-blue-600">{pageTitle}</div>
                </div>

                {/* Desktop Topbar */}
                <div className="hidden lg:flex bg-white shadow border-b p-4 justify-between items-center fixed top-0 left-64 right-0 z-10">
                    <div className="text-xl font-bold text-blue-600">{pageTitle}</div>
                    <div className="flex items-center space-x-4 text-gray-700 hover:text-red-600">
                        <button className="flex items-center space-x-2" onClick={handleLogout}>
                            <FiLogOut />
                            <span className="text-gray-700 hover:text-red-600 font-bold">Logout</span>
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
