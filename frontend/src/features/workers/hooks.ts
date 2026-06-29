import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/auth/utils";
import { workersApi } from "./api";
import type { WorkerFilters, WorkerProfileInput, HorarioSemanal, Disponibilidad } from "./types";

export const workerKeys = {
  all: ["workers"] as const,
  lists: () => [...workerKeys.all, "list"] as const,
  list: (filters: WorkerFilters) => [...workerKeys.lists(), filters] as const,
  details: () => [...workerKeys.all, "detail"] as const,
  detail: (id: string) => [...workerKeys.details(), id] as const,
  myProfile: () => [...workerKeys.all, "mine"] as const,
  disponibilidad: () => [...workerKeys.all, "disponibilidad"] as const,
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
    onSuccess: (data) => {
      queryClient.setQueryData(workerKeys.myProfile(), data);
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

export function useDisponibilidad() {
  return useQuery({
    queryKey: workerKeys.disponibilidad(),
    queryFn: () => workersApi.getDisponibilidad(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateDisponibilidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Disponibilidad>) => workersApi.updateDisponibilidad(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(workerKeys.disponibilidad(), data);
      toast.success("Disponibilidad guardada");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// Alias para el tipo importado externamente
export type { HorarioSemanal, Disponibilidad };