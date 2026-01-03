import { db } from "./db";

export async function sendWhatsApp(target: string, message: string) {
    try {
        const settings = await db.schoolSettings.findFirst();

        if (!settings?.isWaEnabled || !settings?.waGatewayToken) {
            console.log("WA Gateway is disabled or token not set.");
            return { success: false, error: "WA Gateway disabled" };
        }

        // Standardize phone number format (08... -> 628...)
        let phone = target.replace(/[^0-9]/g, "");
        if (phone.startsWith("0")) {
            phone = "62" + phone.slice(1);
        }

        const url = settings.waGatewayUrl || "https://api.fonnte.com/send";

        // Fonnte Format
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: settings.waGatewayToken,
            },
            body: new URLSearchParams({
                target: phone,
                message: message,
            }),
        });

        const data = await response.json();
        console.log("WA Gateway Response:", data);

        return { success: data.status === true, data };
    } catch (error) {
        console.error("Error sending WhatsApp:", error);
        return { success: false, error };
    }
}
