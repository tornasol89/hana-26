import { useQuery } from "@tanstack/react-query";
import { reviewsApi } from "./api";

export const reviewKeys = {
  all: ["reviews"] as const,
  byUser: (userId: string) => [...reviewKeys.all, "user", userId] as const,
  byBooking: (bookingId: string) => [...reviewKeys.all, "booking", bookingId] as const,
};

export function useUserReviews(userId: string | undefined) {
  return useQuery({
    queryKey: reviewKeys.byUser(userId ?? ""),
    queryFn: () => reviewsApi.getByUserId(userId!),
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
  });
}

export function useHasReviewedBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: reviewKeys.byBooking(bookingId ?? ""),
    queryFn: () => reviewsApi.hasReviewedBooking(bookingId!),
    enabled: Boolean(bookingId),
  });
}