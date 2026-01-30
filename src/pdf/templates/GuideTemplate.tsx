
import React from 'react';
import { PDFLayout } from '../components/PDFLayout';

interface GuideTemplateProps {
    title: string;
    content: {
        heading: string;
        body: string[];
        listItems?: string[];
    }[];
}

export const GuideTemplate: React.FC<GuideTemplateProps> = ({ title, content }) => {
    return (
        <PDFLayout title={title}>
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-black text-slate-900 mb-8 leading-tight">
                    {title}
                </h2>

                <div className="space-y-8">
                    {content.map((section, index) => (
                        <div key={index} className="break-inside-avoid">
                            <h3 className="text-xl font-bold text-slate-800 mb-3 border-l-4 border-indigo-600 pl-3">
                                {section.heading}
                            </h3>

                            <div className="space-y-4 text-slate-600 leading-relaxed">
                                {section.body.map((paragraph, pIndex) => (
                                    <p key={pIndex} className="text-sm text-justify">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>

                            {section.listItems && (
                                <ul className="mt-4 space-y-2">
                                    {section.listItems.map((item, lIndex) => (
                                        <li key={lIndex} className="flex items-start text-sm text-slate-700">
                                            <span className="mr-2 text-indigo-500 font-bold">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </PDFLayout>
    );
};
