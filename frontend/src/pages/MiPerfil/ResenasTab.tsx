import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { useUserReviews } from "@/features/reviews/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { ReviewsList } from "@/features/reviews/components/ReviewsList";

export function ResenasTab() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useUserReviews(user?.id);

  if (isLoading) return <LoadingState message="Cargando tus reseñas..." />;

  if (isError) {
    return (
      <Card>
        <CardContent className="p-8">
          <ErrorState
            title="No pudimos cargar tus reseñas"
            description="Intentá de nuevo en unos segundos."
            onRetry={() => refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.total === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <EmptyState
            icon={Star}
            title="Aún no tienes reseñas"
            description="Las clientas podrán dejarte reseñas después de completar un servicio. Aparecerán acá cuando lo hagan."
          />
        </CardContent>
      </Card>
    );
  }

  return <ReviewsList data={data} />;
}