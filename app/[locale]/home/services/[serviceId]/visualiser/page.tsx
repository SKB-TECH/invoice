import { ServiceVisualiserClient } from "@/components/configuration/service-visualiser-client";

type PageProps = {
    params: Promise<{ serviceId: string }>;
};

export default async function VisualiserServicePage({ params }: PageProps) {
    const { serviceId } = await params;
    return <ServiceVisualiserClient serviceId={serviceId} />;
}
