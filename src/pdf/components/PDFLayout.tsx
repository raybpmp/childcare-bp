
import React from 'react';

interface PDFLayoutProps {
    children: React.ReactNode;
    title: string;
}

export const PDFLayout: React.FC<PDFLayoutProps> = ({ children, title }) => {
    return (
        <div className="w-full h-full bg-white p-8">
            <div className="mb-8 border-b-2 border-slate-800 pb-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
                        Childcare Business Plan
                    </h1>
                    <span className="text-sm text-slate-500 font-medium">Confidential Audit</span>
                </div>
            </div>

            <main>
                {children}
            </main>

            <div className="fixed bottom-0 left-0 w-full p-8 text-center text-xs text-slate-400 border-t border-slate-100 mt-8">
                <p>&copy; {new Date().getFullYear()} New Day Partners, Inc. All Rights Reserved.</p>
                <p className="mt-1">
                    For the full business plan toolkit, visit <span className="text-slate-600 font-bold">ChildcareBusinessPlan.com</span>
                </p>
            </div>
        </div>
    );
};
