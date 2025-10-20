import { useMemo } from "react";
import { useAuthStore } from "@/context/StoreAuth";

export function useUserDisplay() {
  const user = useAuthStore((s) => s.user);
  const avatarLabel = useMemo(
    () => (user?.name?.[0] ?? user?.globalId?.[0] ?? "U").toUpperCase(),
    [user?.name, user?.globalId]
  );
  const displayName = useMemo(
    () => user?.name ?? user?.globalId ?? "Usuario",
    [user?.name, user?.globalId]
  );
  const displayNameUpper = useMemo(() => displayName.toUpperCase(), [displayName]);

  return { user, avatarLabel, displayName, displayNameUpper };
}
