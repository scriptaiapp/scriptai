import React from 'react';

interface InfoItemProps {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
    children: React.ReactNode;
}

export const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, children }) => {
    return (
        <li className="flex items-start gap-3">
            <Icon className="h-4 w-4 mt-0.5 text-slate-400 flex-shrink-0" />
            <div className="text-sm">
                <strong className="font-medium text-slate-800 dark:text-slate-200">{label}:</strong>
                {' '}
                <span className="text-slate-700 dark:text-slate-300">{children}</span>
            </div>
        </li>
    );
};