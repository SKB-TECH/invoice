export interface CardData {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    bg: string;
}

export interface PaymentRow {
    client: string;
    reference: string;
    amount: string;
    status: string;
    date?: string;
}
