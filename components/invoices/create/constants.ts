import type {
    CatalogItem,
    Client,
    InvoiceForm,
    InvoiceItem,
} from "./types";

export const clients: Client[] = [
    {
        id: 1,
        name: "Rawbank",
        nif: "A1234567",
        rccm: "CD/KIN/RCCM/14-B-1456",
        idNat: "01-83-N12345P",
        address: "101, Avenue du Lac C/Gombe",
        phone: "+243 81 00 00 000",
        email: "support.rawbank.cd",
    },
    {
        id: 2,
        name: "EquityBCDC",
        nif: "B9876543",
        rccm: "CD/KIN/RCCM/18-B-9090",
        idNat: "01-83-EBCDC",
        address: "12, Boulevard du 30 Juin C/Gombe",
        phone: "+243 82 220 40 12",
        email: "contact@equitybcdc.cd",
    },
    {
        id: 3,
        name: "Solidaire Banque",
        nif: "C4567890",
        rccm: "CD/KIN/RCCM/20-B-5555",
        idNat: "01-83-SOLID",
        address: "6, Av. Justice C/Gombe",
        phone: "+243 99 000 00 00",
        email: "contact@solidaire.cd",
    },
    {
        id: 4,
        name: "Standardbank",
        nif: "D3333333",
        rccm: "CD/KIN/RCCM/11-B-7890",
        idNat: "01-83-STB",
        address: "Avenue Colonel Ebeya C/Gombe",
        phone: "+243 85 000 00 00",
        email: "info@standardbank.cd",
    },
];

export const catalogItems: CatalogItem[] = [
    {
        id: 1,
        name: "Ordinateur portable",
        type: "Article",
        tax: 16,
        priceHT: 850000,
    },
    {
        id: 2,
        name: "Imprimante thermique",
        type: "Article",
        tax: 5,
        priceHT: 320000,
    },
    {
        id: 3,
        name: "Routeur réseau",
        type: "Article",
        tax: 16,
        priceHT: 150000,
    },
    {
        id: 4,
        name: "Licence logiciel",
        type: "Article",
        tax: 0,
        priceHT: 500000,
    },
    {
        id: 5,
        name: "Maintenance",
        type: "Service",
        tax: 16,
        priceHT: 0,
    },
    {
        id: 6,
        name: "Installation",
        type: "Service",
        tax: 5,
        priceHT: 0,
    },
    {
        id: 7,
        name: "Support technique",
        type: "Service",
        tax: 16,
        priceHT: 0,
    },
    {
        id: 8,
        name: "Formation utilisateur",
        type: "Service",
        tax: 0,
        priceHT: 0,
    },
];

export const initialForm: InvoiceForm = {
    clientId: null,
    clientName: "",
    nif: "",
    rccm: "",
    idNat: "",
    address: "",
    phone: "",
    email: "",

    contractId: null,
    contractReference: "",

    invoiceType: "",
    itemKind: "Service",

    currency: "CDF",
    dueDate: "",
    templateId: null,
    comments: {
        A: "",
        B: "",
        C: "",
        D: "",
        E: "",
        F: "",
        G: "",
        H: "",
    },
};

export const initialItems: InvoiceItem[] = [];
