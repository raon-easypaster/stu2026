'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface EditReservationModalProps {
    reservation: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const EditReservationModal = ({ reservation, isOpen, onClose, onSuccess }: EditReservationModalProps) => {
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

    useEffect(() => {
        if (reservation) {
            setFormData({
                name: reservation.name || '',
                email: reservation.email || '',
                phone: reservation.phone || '',
                student_id: reservation.student_id || '',
                department: reservation.department || '',
                topic: reservation.topic || '신앙상담1',
                note: reservation.note || '',
            });
        }
    }, [reservation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error: updateError } = await supabase
                .from('reservations')
                .update({
                    name: formData.name,
                    email: formData.email || null,
                    phone: formData.phone,
                    student_id: formData.student_id,
                    department: formData.department,
                    topic: formData.topic,
                    note: formData.note,
                })
                .eq('id', reservation.id);

            if (updateError) throw updateError;

            onSuccess();
        } catch (err: any) {
            console.error('Update failed:', err);
            setError(err.message || '수정 중 오류가 발생했습니다.');
            alert('저장 실패: ' + (err.message || '알 수 없는 오류'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Save size={20} /> 예약 정보 수정
                            </h2>
                            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">학과</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">학번</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                        value={formData.student_id}
                                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">연락처</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">상담 주제</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none bg-white"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                >
                                    <option value="신앙상담1">신앙상담1</option>
                                    <option value="신앙상담2">신앙상담2</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">추가 문의사항</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                ></textarea>
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="flex-2 px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors disabled:opacity-50"
                                >
                                    {loading ? '저장 중...' : '변경사항 저장'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditReservationModal;
