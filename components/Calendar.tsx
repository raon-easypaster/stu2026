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
            .select('*')
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

            if (slotStartOfDay <= todayStartOfDay) {
                alert('당일 상담 예약은 불가능합니다. 당일 상담을 원하실 경우 전화(010-5606-0845)로 문의해 주세요.');
                return;
            }

            setSelectedSlot(slot);
            setIsModalOpen(true);
        }
    };

    const events = slots.map((slot) => ({
        id: slot.id,
        start: slot.start_time,
        end: slot.end_time,
        title: slot.status === 'available' ? '예약 가능' : '예약 완료',
        backgroundColor: slot.status === 'available' ? '#FBBF24' : '#DC2626',
        textColor: slot.status === 'available' ? '#000000' : '#ffffff',
        borderColor: 'transparent',
        extendedProps: slot,
    }));

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
