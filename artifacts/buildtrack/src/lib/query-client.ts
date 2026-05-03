import { QueryClient } from "@tanstack/react-query";
import { get, set, del } from "idb-keyval";
import { PersistedClient, Persister } from "@tanstack/react-query-persist-client";

// Create a custom IndexedDB persister
export function createIDBPersister(idbValidKey: IDBValidKey = "reactQuery") {
  return {
    persistClient: async (client: PersistedClient) => {
      try {
        await set(idbValidKey, client);
      } catch (err) {
        console.warn("Failed to persist React Query cache:", err);
      }
    },
    restoreClient: async () => {
      try {
        return await get<PersistedClient>(idbValidKey);
      } catch (err) {
        console.warn("Failed to restore React Query cache:", err);
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        await del(idbValidKey);
      } catch (err) {
        console.warn("Failed to clear React Query cache:", err);
      }
    },
  } as Persister;
}

export const persister = createIDBPersister();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days (cache kept in IDB)
      staleTime: 1000 * 60 * 5, // 5 minutes before refetching
      retry: 3, // retry 3 times when offline
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
