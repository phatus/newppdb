"use client";

export default function ExportDocButton({ targetId, fileName }: { targetId: string, fileName?: string }) {
    const handleExport = () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        // Clone the element to manipulate it without affecting the UI
        const clone = element.cloneNode(true) as HTMLElement;

        // Optional: you can prepare the clone specifically for MS Word:
        // - Convert flex containers to tables if necessary
        // - Remove empty elements that cause layout issues in Word

        const htmlContent = clone.innerHTML;

        const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>Export HTML to Word Document</title>
            <style>
                body { font-family: 'Times New Roman', Times, serif; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
                table, th, td { border: 1px solid black; padding: 5px; }
                th { background-color: #f2f2f2; }
                
                /* Keep utility classes for Word layout */
                .text-center { text-align: center; }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .text-justify { text-align: justify; }
                .font-bold { font-weight: bold; }
                .font-black { font-weight: 900; }
                .font-serif { font-family: 'Times New Roman', Times, serif; }
                .italic { font-style: italic; }
                .uppercase { text-transform: uppercase; }
                .underline { text-decoration: underline; }
                
                .mb-4 { margin-bottom: 16px; }
                .mb-8 { margin-bottom: 32px; }
                .mb-20 { margin-bottom: 80px; }
                .mt-1 { margin-top: 4px; }
                .mt-16 { margin-top: 64px; }
                
                /* Layout utilities */
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .justify-center { justify-content: center; }
                .items-center { align-items: center; }
                .gap-6 { gap: 24px; }
                .align-middle { vertical-align: middle; }
                .align-top { vertical-align: top; }
                
                /* Table specific */
                .w-full { width: 100%; }
                .w-12 { width: 48px; }
                .w-20 { width: 80px; }
                .w-24 { width: 96px; }
                .w-1\\/2 { width: 50%; }
                
                /* TTD Table Borders */
                .border-0 { border: none !important; }
                .border-b-0 { border-bottom: none !important; }
                .border-b-4 { border-bottom-width: 4px; }
                .border-double { border-style: double; }
                .border-black { border-color: black; }
                
                /* Spacing */
                .pb-4 { padding-bottom: 16px; }
                
                /* Prevent page break inside elements */
                .break-inside-avoid { page-break-inside: avoid; }
            </style>
        </head><body>`;
        
        const footer = "</body></html>";
        const sourceHTML = header + htmlContent + footer;
        
        // Use Blob for larger files
        const blob = new Blob(['\ufeff', sourceHTML], {
            type: 'application/msword;charset=utf-8'
        });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName ? `${fileName}.doc` : 'document.doc';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    return (
        <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-print"
            onClick={handleExport}
            title="Export to Word (.doc)"
        >
            <span className="material-symbols-outlined">description</span>
            Export Word
        </button>
    );
}
