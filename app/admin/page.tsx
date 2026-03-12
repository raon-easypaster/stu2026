'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminCalendar from '@/components/AdminCalendar';
import ReservationList from '@/components/ReservationList';
import { LogOut, Settings, LayoutDashboard, Calendar as CalendarIcon, Users, Menu, X } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'calendar' | 'reservations'>('calendar');
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/admin/login');
        } else {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-medium text-slate-500">
            대시보드 로딩 중...
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-xl font-bold tracking-tight">STU <span className="text-blue-400 italic">Admin</span></h1>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 hover:bg-slate-800 rounded-lg"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar / Mobile Menu */}
            <aside className={`
                fixed inset-0 z-40 md:relative md:flex w-64 bg-slate-900 text-white flex-col transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-8 hidden md:block">
                    <h1 className="text-2xl font-bold tracking-tight">STU <span className="text-blue-400 italic">관리자</span></h1>
                </div>

                <nav className="flex-1 px-4 py-8 md:py-0 space-y-2 mt-16 md:mt-0">
                    <button
                        onClick={() => {
                            setActiveTab('calendar');
                            setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <CalendarIcon size={20} />
                        <span className="font-medium">상담 일정 관리</span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('reservations');
                            setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reservations' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <Users size={20} />
                        <span className="font-medium">예약 현황</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">로그아웃</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8">
                <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-10">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                            {activeTab === 'calendar' ? '상담 시간대 관리' : '학생 예약 목록'}
                        </h2>
                        <p className="text-sm md:text-base text-slate-500 mt-1 italic">
                            관리자 계정으로 접속 중 (v1.0.3 - sorting_fix)
                        </p>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold">
                            AD
                        </div>
                    </div>
                </header>

                <div className="max-w-full overflow-hidden">
                    {activeTab === 'calendar' ? <AdminCalendar /> : <ReservationList />}
                </div>
            </main>
        </div>
    );
}
