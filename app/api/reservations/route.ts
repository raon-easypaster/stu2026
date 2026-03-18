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

    // Fetch slot info for notification
    const { data: slotData } = await supabase
        .from('counseling_slots')
        .select('start_time')
        .eq('id', slot_id)
        .single();

    const consultationTime = slotData?.start_time 
        ? new Date(slotData.start_time).toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '시간 정보 없음';

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
📅 *상담 일시:* ${consultationTime}
💭 *문의사항:* ${note || '없음'}
⏱ *신청일시:* ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
            `.trim();

            await global.fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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
            const emailResult = await resend.emails.send({
                from: 'STU Counseling <onboarding@resend.dev>',
                to: [email],
                subject: '[STU 외래상담] 예약 신청이 접수되었습니다',
                html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #0F172A;">상담 예약 신청 접수 안내</h2>
                <p>안녕하세요, ${name} 학생. 상담 예약 신청이 정상적으로 접수되었습니다.</p>
                <div style="background-color: #F8FAFC; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>상담 일시:</strong> ${consultationTime}</p>
                    <p style="margin: 5px 0;"><strong>상담 주제:</strong> ${topic}</p>
                    <p style="margin: 5px 0;"><strong>상태:</strong> <span style="color: #F59E0B; font-weight: bold;">관리자 승인 대기 중</span></p>
                </div>
                <p style="color: #64748B; font-size: 14px;">관리자가 확인 후 예약을 최종 승인하면 예약이 확정됩니다. 궁금한 점이 있으시면 따로 문의해 주세요.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #94A3B8;">본 메일은 STU 외래신앙상담 예약 시스템에서 자동으로 발송되었습니다.</p>
            </div>
          `,
            });
            console.log('[Resend Email Result]', emailResult);
        } catch (err) {
            console.error('Email sending failed:', err);
        }
    }

    return NextResponse.json({ success: true });
}
