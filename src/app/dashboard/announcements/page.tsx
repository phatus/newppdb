import { getAnnouncements } from "@/app/actions/announcements";
import UserAnnouncements from "./UserAnnouncements";

export default async function Page() {
    const announcements = await getAnnouncements(false);
    return <UserAnnouncements announcements={announcements} />;
}
