import { ModifierBillableServiceClient } from "@/components/configuration/modifier-billable-service-client";

type PageProps = {
    params: Promise<{ serviceId: string }>;
};

export default async function ModifierServicePage({ params }: PageProps) {
    const { serviceId } = await params;
    return <ModifierBillableServiceClient serviceId={serviceId} />;
}
