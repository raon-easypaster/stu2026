'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '@/lib/supabase';
import ReservationModal from './ReservationModal';

interface Slot {
    id: string;
    start_time: string;
    end_time: string;
    status: 'available' | 'booked' | 'blocked';
}

const Calendar = () => {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        const { data, error } = await supabase
            .from('counseling_slots')
            .select('*, reservations(status)')
            .neq('status', 'blocked');

        if (!error && data) {
            setSlots(data);
        }
    };

    const handleEventClick = (info: any) => {
        const slotId = info.event.id;
        const slot = slots.find(s => s.id === slotId);

        console.log('Event clicked:', slotId, slot); // Debug log

        if (slot && slot.status === 'available') {
            const slotDate = new Date(slot.start_time);
            const today = new Date();

            // Set both to start of day for accurate comparison
            const slotStartOfDay = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
            const todayStartOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            if (slotStartOfDay <= todayStartOfDay || slotDate.getDay() === 6) {
                alert('당일 or 토요일 상담을 원할 경우 따로 문의 주시기 바랍니다.');
                return;
            }

            setSelectedSlot(slot);
            setIsModalOpen(true);
        }
    };

    const events = slots.map((slot: any) => {
        const reservationStatus = slot.reservations?.[0]?.status || 'available';
        let backgroundColor = '#10B981'; // Available (Green)
        let title = '예약 가능';
        let textColor = '#ffffff';

        if (slot.status === 'booked') {
            if (reservationStatus === 'pending') {
                backgroundColor = '#FBBF24'; // Pending (Yellow)
                title = '승인 대기';
                textColor = '#000000';
            } else {
                backgroundColor = '#DC2626'; // Confirmed (Red)
                title = '예약 완료';
                textColor = '#ffffff';
            }
        }

        return {
            id: slot.id,
            start: slot.start_time,
            end: slot.end_time,
            title,
            backgroundColor,
            textColor,
            borderColor: 'transparent',
            extendedProps: slot,
        };
    });

    return (
        <div className="glass-card p-6 min-h-[600px]">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                locale="ko"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                buttonText={{
                    today: '오늘',
                    month: '월',
                    week: '주',
                    day: '일',
                }}
                events={events}
                eventClick={handleEventClick}
                eventClassNames={(arg) => {
                    return arg.event.extendedProps.status === 'available' ? 'cursor-pointer' : '';
                }}
                height="auto"
                slotMinTime="09:00:00"
                slotMaxTime="18:00:00"
                slotDuration="01:00:00"
                snapDuration="01:00:00"
                allDaySlot={false}
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

            {isModalOpen && selectedSlot && (
                <ReservationModal
                    slot={selectedSlot}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchSlots();
                    }}
                />
            )}
        </div>
    );
};

export default Calendar;
