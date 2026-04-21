import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "./api";

/** Query keys centralizadas del dominio bookings */
export const bookingKeys = {
  all: ["bookings"] as const,
  mine: () => [...bookingKeys.all, "mine"] as const,
};

export function useMyBookings() {
  return useQuery({
    queryKey: bookingKeys.mine(),
    queryFn: bookingsApi.getMine,
    staleTime: 1000 * 30,
  });
}