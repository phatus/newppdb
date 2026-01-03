import { getWaves } from "@/app/actions/waves";
import WaveManager from "@/components/admin/settings/WaveManager";

export const dynamic = "force-dynamic";

export default async function WaveSettingsPage() {
    const wavesResult = await getWaves();
    const waves = wavesResult.success ? wavesResult.data : [];

    return (
        <div className="p-6 lg:p-10 max-w-[1240px] mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pengaturan Gelombang</h1>
                <p className="text-slate-500 dark:text-slate-400">Kelola periode dan jalur pendaftaran yang dibuka.</p>
            </div>

            <WaveManager initialWaves={waves || []} />
        </div>
    );
}
