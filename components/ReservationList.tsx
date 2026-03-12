'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Mail, GraduationCap, MessageSquare, Clock, Calendar as CalendarIcon } from 'lucide-react';

const ReservationList = () => {
    const [reservations, setReservations] = useState<any[]>([]);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        const { data, error } = await supabase
            .from('reservations')
            .select(`
        *,
        counseling_slots (
          start_time,
          end_time
        )
      `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setReservations(data);
        }
    };

    const handleCancel = async (reservation: any) => {
        const confirmed = window.confirm(`${reservation.name} 학생의 예약을 취소하시겠습니까?\n취소 시 해당 시간은 다시 "예약 가능" 상태로 변경됩니다.`);
        if (confirmed) {
            // Delete reservation
            const { error: delError } = await supabase
                .from('reservations')
                .delete()
                .eq('id', reservation.id);

            if (!delError) {
                // Set slot back to available
                await supabase
                    .from('counseling_slots')
                    .update({ status: 'available' })
                    .eq('id', reservation.slot_id);

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
                {reservations.length === 0 ? (
                    <div className="glass-card p-12 text-center text-slate-500 italic">
                        접수된 예약이 없습니다.
                    </div>
                ) : (
                    reservations.map((res) => (
                        <div key={res.id} className="glass-card p-6 hover:border-primary/30 transition-all border-l-4 border-l-primary relative group">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleCancel(res)}
                                    className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-semibold flex items-center gap-1 border border-red-100 transition-colors"
                                >
                                    예약 취소
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
                                        <div className="flex items-center gap-2 font-medium text-primary">
                                            <Clock size={16} />
                                            {new Date(res.counseling_slots.start_time).toLocaleString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
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
        </div>
    );
};

export default ReservationList;
