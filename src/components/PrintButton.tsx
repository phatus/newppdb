"use client";

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="bg-primary hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-5 rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-2 print:hidden"
        >
            <span className="material-symbols-outlined text-[20px]">print</span>
            Cetak Kartu
        </button>
    );
}
