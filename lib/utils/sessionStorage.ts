import { toGMT8 } from "./toGMT8";

export function saveToSession<T>(key: string, data: T, id: string, expiration?: number) {
  const dataToSave = {
    data,
    expiration: toGMT8().add(expiration||10, "minute").toISOString(),
    id,
  };
  sessionStorage.setItem(key, JSON.stringify(dataToSave));
}

export function loadFromSession<T>(
  key: string,
  currentId: string
): T | undefined {
  const stored = sessionStorage.getItem(key);
  if (!stored) return undefined; // Change to undefined

  const parsed = JSON.parse(stored);
  if (parsed.id !== currentId || toGMT8().isAfter(toGMT8(parsed.expiration))) {
    sessionStorage.removeItem(key);
    return undefined; // Change to undefined
  }
  return parsed.data as T;
}

export function removeFromSession(key: string){
    sessionStorage.removeItem(key);
}
