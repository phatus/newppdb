import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const getSchoolSettings = unstable_cache(
    async () => {
        return await db.schoolSettings.findFirst();
    },
    ["school-settings"],
    {
        revalidate: 3600, // Revalidate every hour
        tags: ["school-settings"],
    }
);
