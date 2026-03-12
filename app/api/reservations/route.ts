import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const body = await request.json();
    const { slot_id, name, email, phone, student_id, department, topic, note } = body;

    // Use the RPC function defined in schema.sql for atomic booking
    const { error } = await supabase.rpc('book_slot', {
        p_slot_id: slot_id,
        p_name: name,
        p_email: email,
        p_phone: phone,
        p_student_id: student_id,
        p_department: department,
        p_topic: topic,
        p_note: note
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Send email notifications
    try {
        await resend.emails.send({
            from: 'STU Counseling <onboarding@resend.dev>',
            to: [email],
            subject: 'Counseling Reservation Confirmed',
            html: `
        <h1>Reservation Confirmed</h1>
        <p>Dear ${name},</p>
        <p>Your counseling session has been successfully booked.</p>
        <hr />
        <p><strong>Topic:</strong> ${topic}</p>
        <p><strong>Date & Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Note:</strong> ${note || 'N/A'}</p>
      `,
        });
    } catch (err) {
        console.error('Email sending failed:', err);
    }

    return NextResponse.json({ success: true });
}
