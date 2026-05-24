import { DemandDetailPage } from "@/components/demandas/demand-detail-page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DemandByIdPage({ params }: PageProps) {
  const { id } = await params;
  return <DemandDetailPage id={id} />;
}
