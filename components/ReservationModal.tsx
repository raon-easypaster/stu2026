'use client';

import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReservationModalProps {
    slot: {
        id: string;
        start_time: string;
        end_time: string;
    };
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ReservationModal = ({ slot, isOpen, onClose, onSuccess }: ReservationModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        student_id: '',
        department: '',
        topic: '',
        note: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slot_id: slot.id,
                    ...formData,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            } else {
                setError(result.error || 'Failed to book reservation');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const startTimeStr = new Date(slot.start_time).toLocaleString();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="bg-primary p-6 flex justify-between items-center text-white">
                            <h2 className="text-xl font-bold">상담 예약 신청</h2>
                            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {success ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <CheckCircle2 size={64} className="text-success mb-4" />
                                    <h3 className="text-2xl font-bold text-slate-800">예약이 완료되었습니다!</h3>
                                    <p className="text-slate-600 mt-2">{formData.email}로 확인 메일을 발송했습니다.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-primary text-sm font-medium">
                                        상담 시간: {startTimeStr}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">학과</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="예: 신학과"
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">학번</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                                value={formData.student_id}
                                                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">연락처</label>
                                            <input
                                                required
                                                type="tel"
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">상담 주제</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">추가 문의사항</label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            value={formData.note}
                                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        ></textarea>
                                    </div>

                                    {error && <p className="text-danger text-sm font-medium">{error}</p>}

                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? '처리 중...' : '예약 확정'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReservationModal;
