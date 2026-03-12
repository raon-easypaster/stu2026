'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if the user is authenticated (clicked the reset link)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // If no session, they shouldn't be here
                // Note: Supabase usually signs them in automatically via the recovery link
                // but if they just type the URL, we redirect to login
                // router.push('/admin/login');
            }
        };
        checkSession();
    }, [router]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/admin/login');
                }, 3000);
            }
        } catch (err) {
            setError('비밀번호 변경 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl text-white mb-4 shadow-lg shadow-primary/30">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900">비밀번호 재설정</h1>
                    <p className="text-slate-500 mt-2">새로운 비밀번호를 입력해 주세요</p>
                </div>

                <div className="glass-card p-8">
                    {success ? (
                        <div className="text-center py-4">
                            <div className="flex justify-center mb-4 text-success">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">변경 완료!</h2>
                            <p className="text-slate-600 mb-6">비밀번호가 성공적으로 변경되었습니다.<br />잠시 후 로그인 페이지로 이동합니다.</p>
                            <button
                                onClick={() => router.push('/admin/login')}
                                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all"
                            >
                                로그인 페이지로 이동
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">새 비밀번호</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        required
                                        type="password"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">비밀번호 확인</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        required
                                        type="password"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-danger text-sm bg-red-50 p-3 rounded-lg border border-red-100 italic">
                                    {error}
                                </p>
                            )}

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? '처리 중...' : '비밀번호 변경하기'}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
