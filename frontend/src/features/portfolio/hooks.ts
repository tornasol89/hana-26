import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/auth/utils";
import { portfolioApi } from "./api";
import type { CreatePortfolioPayload } from "./types";

export const portfolioKeys = {
  all: ["portfolio"] as const,
  mine: () => [...portfolioKeys.all, "mine"] as const,
  worker: (id: string) => [...portfolioKeys.all, "worker", id] as const,
  paraRespaldar: () => [...portfolioKeys.all, "para-respaldar"] as const,
};

export function useMisItemsPortafolio() {
  return useQuery({
    queryKey: portfolioKeys.mine(),
    queryFn: portfolioApi.getMisItems,
    staleTime: 1000 * 60,
  });
}

export function useWorkerPortfolio(workerProfileId: string | undefined) {
  return useQuery({
    queryKey: portfolioKeys.worker(workerProfileId ?? ""),
    queryFn: () => portfolioApi.getByWorker(workerProfileId!),
    enabled: Boolean(workerProfileId),
    staleTime: 1000 * 60,
  });
}

export function useParaRespaldar() {
  return useQuery({
    queryKey: portfolioKeys.paraRespaldar(),
    queryFn: portfolioApi.getParaRespaldar,
    staleTime: 1000 * 30,
  });
}

export function useCreatePortfolioItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePortfolioPayload) => portfolioApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.mine() });
      toast.success("Foto de portafolio subida correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeletePortfolioItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => portfolioApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.mine() });
      toast.success("Foto eliminada");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRespaldarPortfolio(workerProfileId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => portfolioApi.respaldar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.paraRespaldar() });
      if (workerProfileId) {
        queryClient.invalidateQueries({ queryKey: portfolioKeys.worker(workerProfileId) });
      }
      toast.success("¡Gracias por respaldar este trabajo!");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
