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
        topic: '신앙상담1',
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
                // If it's already booked, the UI is stale. Close and refresh.
                if (result.error === 'Slot is already booked or not found') {
                    setTimeout(() => {
                        onSuccess(); // This will refresh the slots in the parent
                    }, 3000);
                }
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
                                <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
                                    <Clock size={64} className="text-amber-500 mb-4 animate-pulse" />
                                    <h3 className="text-2xl font-bold text-slate-800">예약 신청이 접수되었습니다!</h3>
                                    <p className="text-slate-600 mt-2 font-medium">관리자의 승인이 완료된 후 최종 확정됩니다.</p>
                                    <p className="text-slate-500 text-sm mt-1">입력하신 연락처로 안내 메시지가 전송될 예정입니다.</p>
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
                                            <select
                                                required
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            >
                                                <option value="" disabled>학과를 선택하세요</option>
                                                <option value="관광경영">관광경영</option>
                                                <option value="컴퓨터공학">컴퓨터공학</option>
                                                <option value="Al 융합">Al 융합</option>
                                                <option value="데이터사이언스">데이터사이언스</option>
                                                <option value="실용음악">실용음악</option>
                                                <option value="교회음악">교회음악</option>
                                                <option value="유아교육">유아교육</option>
                                                <option value="아동보육">아동보육</option>
                                                <option value="사회복지">사회복지</option>
                                                <option value="글로벌경영">글로벌경영</option>
                                                <option value="일본어문화콘텐츠">일본어문화콘텐츠</option>
                                                <option value="중국언어문화콘텐츠">중국언어문화콘텐츠</option>
                                                <option value="자율전공학부">자율전공학부</option>
                                            </select>
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
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            이메일 <span className="text-slate-400 text-xs">(선택사항)</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="예: user@example.com"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">상담 주제</label>
                                        <select
                                            required
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        >
                                            <option value="신앙상담1">신앙상담1</option>
                                            <option value="신앙상담2">신앙상담2</option>
                                            <option value="기타">기타</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            추가 문의사항 <span className="text-slate-400 text-xs">(선택사항)</span>
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            value={formData.note}
                                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        ></textarea>
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-danger text-sm font-medium">
                                            {(error.includes('already booked') || error.includes('no longer available') || error.includes('이미 예약된'))
                                                ? '이미 다른 학생이 예약한 시간대입니다. 화면을 새로고침하여 최신 상태를 확인해 주세요.'
                                                : error}
                                        </div>
                                    )}

                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? '처리 중...' : '예약 신청'}
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
