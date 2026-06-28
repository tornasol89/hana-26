import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/auth/utils";
import { workersApi } from "./api";
import type { WorkerFilters, WorkerProfileInput } from "./types";

export const workerKeys = {
  all: ["workers"] as const,
  lists: () => [...workerKeys.all, "list"] as const,
  list: (filters: WorkerFilters) => [...workerKeys.lists(), filters] as const,
  details: () => [...workerKeys.all, "detail"] as const,
  detail: (id: string) => [...workerKeys.details(), id] as const,
  myProfile: () => [...workerKeys.all, "mine"] as const,
};

export function useWorkers(filters: WorkerFilters = {}) {
  return useQuery({
    queryKey: workerKeys.list(filters),
    queryFn: () => workersApi.list(filters),
    staleTime: 1000 * 60,
  });
}

export function useWorker(id: string | undefined) {
  return useQuery({
    queryKey: workerKeys.detail(id ?? ""),
    queryFn: () => workersApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useMyWorkerProfile() {
  return useQuery({
    queryKey: workerKeys.myProfile(),
    queryFn: () => workersApi.getMyProfile(),
    retry: false,
    staleTime: 1000 * 60,
  });
}

export function useCreateWorkerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WorkerProfileInput) => workersApi.createMyProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workerKeys.myProfile() });
      queryClient.invalidateQueries({ queryKey: workerKeys.lists() });
      toast.success("Perfil profesional creado");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateWorkerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<WorkerProfileInput>) => workersApi.updateMyProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workerKeys.myProfile() });
      queryClient.invalidateQueries({ queryKey: workerKeys.lists() });
      toast.success("Perfil profesional actualizado");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAgregarCertificado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => workersApi.agregarCertificado(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workerKeys.myProfile() });
      toast.success("Certificado agregado correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useEliminarCertificado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (certId: string) => workersApi.eliminarCertificado(certId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workerKeys.myProfile() });
      toast.success("Certificado eliminado");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}