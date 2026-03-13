'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Mail, GraduationCap, MessageSquare, Clock, Calendar as CalendarIcon, Trash2, Edit2, CheckCircle2, Check, X } from 'lucide-react';
import EditReservationModal from './EditReservationModal';

const ReservationList = () => {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); // Not used in this version, but kept as per instruction
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<any>(null);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('reservations')
            .select(`
                *,
                counseling_slots!inner (
                    start_time,
                    end_time
                )
            `)
            .order('start_time', { foreignTable: 'counseling_slots', ascending: true });

        if (!error && data) {
            // Robust frontend sorting as fallback
            const sortedData = [...data].sort((a, b) => {
                const getStartTime = (res: any) => {
                    const slots = res.counseling_slots;
                    const startTimeStr = Array.isArray(slots) ? slots[0]?.start_time : slots?.start_time;
                    if (!startTimeStr) return 0;
                    return new Date(startTimeStr).getTime();
                };
                const timeA = getStartTime(a);
                const timeB = getStartTime(b);
                return timeA - timeB;
            });
            setReservations(sortedData);
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('reservations')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            fetchReservations();
        } else {
            alert('상태 변경 실패: ' + error.message);
        }
    };

    const handleReject = async (resId: string, slotId: string) => {
        if (!window.confirm('이 예약을 반려하시겠습니까? 해당 상담 시간은 다시 예약 가능 상태로 변경됩니다.')) return;

        const { error: resError } = await supabase
            .from('reservations')
            .update({ status: 'rejected' })
            .eq('id', resId);

        if (!resError) {
            await supabase
                .from('counseling_slots')
                .update({ status: 'available' })
                .eq('id', slotId);
            fetchReservations();
        } else {
            alert('반려 실패: ' + resError.message);
        }
    };

    const handleDelete = async (id: string, slot_id: string) => {
        const confirmed = window.confirm(`예약을 취소하시겠습니까?\n취소 시 해당 시간은 다시 "예약 가능" 상태로 변경됩니다.`);
        if (confirmed) {
            // Delete reservation
            const { error: delError } = await supabase
                .from('reservations')
                .delete()
                .eq('id', id);

            if (!delError) {
                // Set slot back to available
                await supabase
                    .from('counseling_slots')
                    .update({ status: 'available' })
                    .eq('id', slot_id);

                fetchReservations();
            } else {
                alert('취소 실패: ' + delError.message);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">예약 현황</h2>
                <button
                    onClick={fetchReservations}
                    className="text-sm text-primary hover:underline"
                >
                    새로고침
                </button>
            </div>
            <div className="grid gap-4">
                {loading ? (
                    <div className="glass-card p-12 text-center text-slate-500 italic">
                        예약을 불러오는 중입니다...
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="glass-card p-12 text-center text-slate-500 italic">
                        접수된 예약이 없습니다.
                    </div>
                ) : (
                    reservations.map((res) => (
                        <div key={res.id} className="glass-card p-6 hover:border-primary/30 transition-all border-l-4 border-l-primary relative group">
                            <div className="absolute top-4 right-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedReservation(res);
                                        setIsEditModalOpen(true);
                                    }}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white/50 backdrop-blur-sm md:bg-transparent"
                                    title="수정"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(res.id, res.slot_id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white/50 backdrop-blur-sm md:bg-transparent"
                                    title="취소"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <User size={18} className="text-primary" />
                                        <div className="flex flex-wrap items-baseline gap-2">
                                            <span className="font-bold text-slate-900 text-lg">{res.name}</span>
                                            <span className="text-slate-500 text-sm font-medium">({res.department})</span>
                                            <span className="text-slate-400 px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">
                                                {res.student_id}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} className="text-slate-400" />
                                            {res.email}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                            {res.phone}
                                        </div>
                                            <CalendarIcon size={16} />
                                            {new Date(res.counseling_slots[0]?.start_time || res.counseling_slots?.start_time).toLocaleString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {res.status === 'pending' && (
                                                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Clock size={12} /> 승인 대기
                                                </span>
                                            )}
                                            {res.status === 'confirmed' && (
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> 확정됨
                                                </span>
                                            )}
                                            {res.status === 'rejected' && (
                                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">반려됨</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare size={16} className="text-primary/70" />
                                            <span className="font-bold text-slate-800">상담 주제: {res.topic}</span>
                                        </div>
                                        {res.note && (
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 italic text-slate-600 text-sm">
                                                <span className="font-semibold block mb-1 not-italic text-slate-400">상담 내용/요청:</span>
                                                "{res.note}"
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end gap-2 text-xs text-slate-400 shrink-0">
                                    {res.status === 'pending' && (
                                        <div className="flex gap-2 mb-2">
                                            <button
                                                onClick={() => handleStatusUpdate(res.id, 'confirmed')}
                                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 text-xs font-bold shadow-sm"
                                            >
                                                <Check size={14} /> 승인
                                            </button>
                                            <button
                                                onClick={() => handleReject(res.id, res.slot_id)}
                                                className="px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 text-xs font-bold shadow-sm"
                                            >
                                                <X size={14} /> 반려
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon size={14} />
                                        예약일: {new Date(res.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <EditReservationModal
                reservation={selectedReservation}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    setIsEditModalOpen(false);
                    fetchReservations();
                }}
            />
        </div >
    );
};

export default ReservationList;
