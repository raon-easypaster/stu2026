'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, ShieldCheck, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Detect if the user landed here from a password reset email
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                router.push('/admin/reset-password');
            }
        });

        // Fallback: Check hash immediately if the event hasn't fired yet
        if (window.location.hash.includes('type=recovery') ||
            (window.location.hash.includes('access_token') && window.location.hash.includes('type=recovery'))) {
            router.push('/admin/reset-password');
        }

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
            <div className="max-w-4xl w-full text-center space-y-8">
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        STU 외래신앙상담 <br />
                        <span className="text-primary italic text-4xl md:text-5xl">예약 시스템</span>
                    </h1>
                    <div className="text-left bg-white/50 p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-3">
                        <ul className="text-slate-600 space-y-2 text-base md:text-lg break-keep">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>상담목사와 1:1 상담 세션을 손쉽게 예약하세요.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>실시간 예약 가능 시간을 확인하고 일정을 관리할 수 있습니다.</span>
                            </li>
                            <li className="flex items-start gap-2 font-semibold text-danger">
                                <span className="mt-1">•</span>
                                <span>3월 26일(목)~4월 3일(금)까지는 해외 일정으로 상담이 없습니다.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>상담은 카페 라온트리(부천시 소사로 203 2층)에서 진행됩니다.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>저녁 6시 이후 상담은 따로 문의 주시기 바랍니다.</span>
                            </li>
                            <li className="flex items-start gap-2 font-semibold text-primary">
                                <span className="mt-1">•</span>
                                <span>당일 상담을 원할 경우 전화로 문의 하세요.</span>
                            </li>
                            <li className="flex items-start gap-2 font-medium text-slate-900 border-t border-slate-100 pt-2 mt-2">
                                <span className="text-primary mt-1">•</span>
                                <span>문의) 010-5606-0845 목사 이광복</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-12">
                    <Link href="/reserve"
                        className="glass-card group p-8 flex flex-col items-center text-center space-y-4 hover:border-primary/50 transition-all">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <CalendarIcon size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">학생 포털</h2>
                        <p className="text-slate-500">예약 가능한 시간대를 확인하고 즉시 상담을 예약하세요.</p>
                        <div className="pt-4 flex items-center text-primary font-semibold">
                            예약하기 <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </div>
                    </Link>

                    <Link href="/admin"
                        className="glass-card group p-8 flex flex-col items-center text-center space-y-4 hover:border-blue-900/30 transition-all">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">관리자 대시보드</h2>
                        <p className="text-slate-500">상담 시간대를 설정하고 예약 현황을 관리하세요.</p>
                        <div className="pt-4 flex items-center text-slate-600 font-semibold italic">
                            관리자 로그인 <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </div>
                    </Link>
                </div>

                <footer className="pt-16 text-slate-400 text-sm">
                    &copy; {new Date().getFullYear()} STU 대학교 학생상담센터. All rights reserved.
                </footer>
            </div>
        </main>
    );
}
