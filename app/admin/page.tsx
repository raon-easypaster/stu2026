'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminCalendar from '@/components/AdminCalendar';
import ReservationList from '@/components/ReservationList';
import { LogOut, Settings, LayoutDashboard, Calendar as CalendarIcon, Users } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'calendar' | 'reservations'>('calendar');
    const [loading, setLoading] = useState(true);
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
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-8">
                    <h1 className="text-2xl font-bold tracking-tight">STU <span className="text-blue-400 italic">관리자</span></h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <CalendarIcon size={20} />
                        <span className="font-medium">상담 일정 관리</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('reservations')}
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

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900">
                            {activeTab === 'calendar' ? '상담 시간대 관리' : '학생 예약 목록'}
                        </h2>
                        <p className="text-slate-500 mt-1 italic">
                            관리자 계정으로 접속 중
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold">
                            AD
                        </div>
                    </div>
                </header>

                {activeTab === 'calendar' ? <AdminCalendar /> : <ReservationList />}
            </main>
        </div>
    );
}
