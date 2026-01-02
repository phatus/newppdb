"use client";

export default function PrintButton() {
    return (
        <button
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            onClick={() => window.print()}
        >
            <span className="material-symbols-outlined">print</span>
            Print PDF
        </button>
    );
}
