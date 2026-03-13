'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2 } from 'lucide-react';
import EditReservationModal from './EditReservationModal';

const AdminCalendar = () => {
    const [slots, setSlots] = useState<any[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        fetchSlots();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchSlots = async () => {
        const { data, error } = await supabase
            .from('counseling_slots')
            .select('*, reservations(status)');

        if (!error && data) {
            setSlots(data);
        }
    };

    const handleSelect = async (info: any) => {
        // Force 1-hour duration from the start time
        const start = new Date(info.start);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

        // If it was an all-day selection (like in Month view), set a default time (e.g., 10 AM)
        if (info.allDay) {
            start.setHours(10, 0, 0, 0);
            end.setHours(11, 0, 0, 0);
        }

        const confirmed = window.confirm(`${start.toLocaleString()} 부터 ${end.toLocaleTimeString()} 까지 1시간 상담 시간을 생성하시겠습니까?`);
        if (confirmed) {
            const { error } = await supabase
                .from('counseling_slots')
                .insert([{
                    start_time: start.toISOString(),
                    end_time: end.toISOString(),
                    status: 'available'
                }]);

            if (!error) {
                fetchSlots();
            } else {
                alert(error.message);
            }
        }
    };

    const handleEventDrop = async (info: any) => {
        const { error } = await supabase
            .from('counseling_slots')
            .update({
                start_time: info.event.startStr,
                end_time: info.event.endStr
            })
            .eq('id', info.event.id);

        if (error) {
            alert('일정 변경 실패: ' + error.message);
            info.revert();
        } else {
            fetchSlots();
        }
    };

    const handleEventResize = async (info: any) => {
        const { error } = await supabase
            .from('counseling_slots')
            .update({
                start_time: info.event.startStr,
                end_time: info.event.endStr
            })
            .eq('id', info.event.id);

        if (error) {
            alert('시간 변경 실패: ' + error.message);
            info.revert();
        } else {
            fetchSlots();
        }
    };

    const handleEventClick = async (info: any) => {
        const eventId = info.event.id;
        const slot = slots.find(s => s.id === eventId);

        if (!slot) return;

        if (slot.status === 'booked') {
            // Fetch reservation details
            const { data: resData, error: resError } = await supabase
                .from('reservations')
                .select('*')
                .eq('slot_id', eventId)
                .single();

            if (resError) {
                alert('예약 정보를 가져올 수 없습니다.');
                return;
            }

            const statusKR = resData.status === 'pending' ? '승인 대기' : resData.status === 'confirmed' ? '확정됨' : '반려됨';
            const action = window.prompt(
                `[예약 정보 - ${statusKR}]\n이름: ${resData.name}\n학과: ${resData.department}\n학번: ${resData.student_id}\n연락처: ${resData.phone}\n주제: ${resData.topic}\n내용: ${resData.note || '없음'}\n\n어떤 작업을 하시겠습니까?\n${resData.status === 'pending' ? '0: 예약 승인\n' : ''}1: 예약 취소 (박스는 유지)\n2: 일정 완전 삭제 (박스까지 삭제)\n3: 정보 수정\n4: 예약 반려 (Available로 복구)\n취소: 아무것도 안 함`,
                ''
            );

            if (action === '0' && resData.status === 'pending') {
                const { error } = await supabase
                    .from('reservations')
                    .update({ status: 'confirmed' })
                    .eq('id', resData.id);
                if (!error) {
                    alert('예약이 승인되었습니다.');
                    fetchSlots();
                }
            } else if (action === '1') {
                const confirmCancel = window.confirm('예약을 취소하시겠습니까?');
                if (confirmCancel) {
                    // Delete reservation and set slot to available
                    const { error: delError } = await supabase
                        .from('reservations')
                        .delete()
                        .eq('id', resData.id);

                    if (!delError) {
                        await supabase
                            .from('counseling_slots')
                            .update({ status: 'available' })
                            .eq('id', eventId);
                        fetchSlots();
                    }
                }
            } else if (action === '2') {
                const confirmDelete = window.confirm('예약 정보와 상담 일정 박스를 모두 삭제하시겠습니까?');
                if (confirmDelete) {
                    const { error: delError } = await supabase
                        .from('counseling_slots')
                        .delete()
                        .eq('id', eventId);
                    if (!delError) fetchSlots();
                }
            } else if (action === '3') {
                setSelectedReservation(resData);
                setIsEditModalOpen(true);
            } else if (action === '4') {
                const confirmReject = window.confirm('예약을 반려하고 다시 "예약 가능" 상태로 바꾸시겠습니까?');
                if (confirmReject) {
                    const { error: resError } = await supabase
                        .from('reservations')
                        .update({ status: 'rejected' })
                        .eq('id', resData.id);

                    if (!resError) {
                        await supabase
                            .from('counseling_slots')
                            .update({ status: 'available' })
                            .eq('id', eventId);
                        fetchSlots();
                    }
                }
            }
        } else {
            const confirmed = window.confirm('이 상담 시간(예약 가능)을 삭제하시겠습니까?');
            if (confirmed) {
                const { error } = await supabase
                    .from('counseling_slots')
                    .delete()
                    .eq('id', eventId);

                if (!error) {
                    fetchSlots();
                } else {
                    alert(error.message);
                }
            }
        }
    };

    const events = slots.map((slot) => {
        const reservationStatus = slot.reservations?.[0]?.status || 'available';
        let backgroundColor = '#FBBF24'; // Available (Yellow)
        let title = '예약 가능';
        let textColor = '#000000';

        if (slot.status === 'booked') {
            if (reservationStatus === 'pending') {
                backgroundColor = '#F97316'; // Pending (Orange)
                title = '승인 대기';
                textColor = '#ffffff';
            } else {
                backgroundColor = '#DC2626'; // Confirmed (Red)
                title = '예약 완료';
                textColor = '#ffffff';
            }
        } else if (slot.status === 'blocked') {
            backgroundColor = '#2563EB'; // Blocked (Blue)
            title = '차단됨';
            textColor = '#ffffff';
        }

        return {
            id: slot.id,
            start: slot.start_time,
            end: slot.end_time,
            title,
            backgroundColor,
            textColor,
            borderColor: 'transparent',
            editable: true,
        };
    });

    return (
        <div className="glass-card p-3 md:p-6 overflow-hidden">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-6">
                <h2 className="text-lg md:text-xl font-bold text-slate-800">일정 관리</h2>
                <div className="text-left md:text-right">
                    <p className="text-xs md:text-sm text-slate-500 font-medium">드래그: 새로운 시간 생성</p>
                    <p className="text-xs md:text-sm text-slate-400">박스 클릭/드래그: 정보 확인 및 변경</p>
                </div>
            </div>
            <div className="calendar-container overflow-x-auto">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
                    locale="ko"
                    headerToolbar={{
                        left: isMobile ? 'prev,next' : 'prev,next today',
                        center: 'title',
                        right: isMobile ? 'timeGridDay,timeGridWeek' : 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    dayHeaderFormat={isMobile ? { weekday: 'short', day: 'numeric' } : { weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true }}
                    buttonText={{
                        today: '오늘',
                        month: '월',
                        week: '주',
                        day: '일',
                    }}
                    selectable={true}
                    select={handleSelect}
                    events={events}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    height="auto"
                    slotMinTime="08:00:00"
                    slotMaxTime="20:00:00"
                    slotDuration="01:00:00"
                    snapDuration="01:00:00"
                    allDaySlot={false}
                    editable={true}
                    eventStartEditable={true}
                    eventDurationEditable={true}
                    longPressDelay={100} // Improve touch interaction
                    dayCellClassNames={(arg) => {
                        const dateStr = arg.date.toISOString().split('T')[0];
                        const holidays = [
                            '2026-01-01', '2026-02-16', '2026-02-17', '2026-02-18',
                            '2026-03-01', '2026-05-05', '2026-05-24', '2026-06-06',
                            '2026-08-15', '2026-09-24', '2026-09-25', '2026-09-26',
                            '2026-10-03', '2026-10-09', '2026-12-25'
                        ];
                        return holidays.includes(dateStr) ? 'fc-day-holiday' : '';
                    }}
                />
            </div>

            <EditReservationModal
                reservation={selectedReservation}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    setIsEditModalOpen(false);
                    fetchSlots();
                }}
            />
        </div>
    );
};

export default AdminCalendar;
