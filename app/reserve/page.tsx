import Calendar from '@/components/Calendar';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReservePage() {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center text-slate-500 hover:text-primary transition-colors">
                        <ArrowLeft size={20} className="mr-2" /> 홈으로 돌아가기
                    </Link>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold text-slate-900">상담 예약 신청</h1>
                        <p className="text-slate-500">예약 가능한 노란색 시간대를 클릭하여 상담을 예약하세요.</p>
                        <p className="text-slate-400 text-sm mt-1">※ 상담일정은 추후 변경될 수 있습니다.</p>
                    </div>
                </div>

                <Calendar />

                <div className="flex gap-6 justify-center pt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                        <span className="text-sm text-slate-600">예약 가능</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-danger"></div>
                        <span className="text-sm text-slate-600">예약 완료</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
