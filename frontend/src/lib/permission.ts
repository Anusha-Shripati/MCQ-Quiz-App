import { useAuthStore } from "@/store/authStore";
import { Permissions } from "@/types/common.types";

export const actionAccess = (name: string = ""): boolean => {
    const { permissions } = useAuthStore.getState();

    if (!permissions || typeof name !== "string") return false;

    const arr = name.split(".");
    if (arr.length === 2) {
        return !!permissions[arr[0]]?.[arr[1] as keyof Permissions];
    }

    return false;
};
