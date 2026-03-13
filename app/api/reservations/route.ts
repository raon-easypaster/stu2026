import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const body = await request.json();
    const { slot_id, name, email, phone, student_id, department, topic, note } = body;

    // Use a new unique RPC function name for atomic booking to avoid naming conflicts
    const { error } = await supabase.rpc('reserve_slot_final', {
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

    // Send Telegram Notification
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
        try {
            const message = `
⏳ *새로운 상담 예약이 신청되었습니다 (승인 대기)*

👤 *이름:* ${name}
🎓 *학과:* ${department}
🆔 *학번:* ${student_id}
📞 *연락처:* ${phone}
📧 *이메일:* ${email || '없음'}
📝 *상담 주제:* ${topic}
💭 *문의사항:* ${note || '없음'}
📅 *신청일시:* ${new Date().toLocaleString('ko-KR')}
            `.trim();

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown',
                }),
            });
        } catch (err) {
            console.error('Telegram notification failed:', err);
        }
    }

    // Send email notifications (if email provided)
    if (email) {
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
    }

    return NextResponse.json({ success: true });
}
