import { useQuery } from "@tanstack/react-query";
import { workersService } from "@/lib/workers";
import type { WorkerFilters } from "@/types/worker";

export function useWorkers(filters: WorkerFilters = {}) {
  return useQuery({
    queryKey: ["workers", filters],
    queryFn: () => workersService.list(filters),
    staleTime: 1000 * 60, // 1 minuto
  });
}

export function useWorker(id: string | undefined) {
  return useQuery({
    queryKey: ["workers", id],
    queryFn: () => workersService.getById(id!),
    enabled: !!id,
  });
}