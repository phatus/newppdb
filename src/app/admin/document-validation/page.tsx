import ValidationForm from "./ValidationForm";

export default function DocumentValidationPage() {
    return (
        <div className="flex flex-col min-h-[80vh] items-center justify-center p-6">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                    <span className="material-symbols-outlined text-4xl">qr_code_scanner</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Validasi Dokumen</h1>
                <p className="text-slate-500 max-w-md mx-auto">
                    Verifikasi keaslian dokumen bukti pendaftaran menggunakan Nomor Registrasi yang tertera pada dokumen.
                </p>
            </div>

            <ValidationForm />
        </div>
    );
}
