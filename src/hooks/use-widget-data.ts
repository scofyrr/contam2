import { useQuery, type QueryKey } from "@tanstack/react-query";

export function useWidgetData<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  refreshInterval: number,
  enabled = true,
) {
  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime: 5 * 60_000,
    refetchInterval: refreshInterval > 0 ? refreshInterval * 1000 : false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
    refetch: query.refetch,
  };
}
