/**
 * Référence réglementaire RDC — groupes de taxation (A à P).
 * Période : ordonnance-loi n°10/001 du 20 août 2010 sur la TVA, loi de finances gestion 2026, etc.
 */
import type { TaxGroup } from "./types";

export const REFERENCE_TAX_GROUPS: readonly TaxGroup[] = [
  {
    id: "groupe-a",
    code: "A",
    name: "Groupe A",
    description: "Exonéré et hors champ",
    comments:
      "Opérations normalement dans le champ de la TVA mais expressément exonérées par la loi (réf. art. 15-18 et 20 de l’ordonnance-loi n°10/001 du 20 août 2010). Hors champ : opérations non soumises à la TVA (activités non économiques ou exclusions légales). Pour ces dernières, la valeur « HORS CHAMP » doit être saisie dans le champ code article du DEF.",
    ratePercent: 0,
    active: true,
  },
  {
    id: "groupe-b",
    code: "B",
    name: "Groupe B",
    description: "Taxable — taux normal 16 %",
    comments:
      "Opération soumise expressément au taux normal de TVA de 16 % réalisée par une entreprise assujettie à la TVA. NB : la TVA est facturée à 16 %.",
    ratePercent: 16,
    active: true,
  },
  {
    id: "groupe-c",
    code: "C",
    name: "Groupe C",
    description: "Taxable — taux réduit 5 %",
    comments:
      "Opération soumise expressément au taux réduit de TVA de 5 % réalisée par une entreprise assujettie à la TVA (réf. art. 35 de l’ordonnance-loi n°10/001 du 20 août 2010 modifiée par la loi de finances gestion 2026). NB : la TVA est facturée à 5 %.",
    ratePercent: 5,
    active: true,
  },
  {
    id: "groupe-d",
    code: "D",
    name: "Groupe D",
    description: "Régimes dérogatoires TVA",
    comments:
      "Opérations taxables où l’État prend en charge la TVA au profit du bénéficiaire (missions diplomatiques, consulats, organisations internationales, etc.). Usage justifié par un document officiel de la DGI attestant l’exonération. La réf. de ce document de dérogation doit être enregistrée dans le champ « Commentaire – Ligne A ». NB : la TVA n’est pas facturée (0 %).",
    ratePercent: 0,
    active: true,
  },
  {
    id: "groupe-e",
    code: "E",
    name: "Groupe E",
    description: "Exportation et opérations assimilées",
    comments:
      "Ventes à l’exportation de biens et services taxables ou non taxables, y compris les ventes sous contrôle douanier. NB : TVA facturée à 0 %.",
    ratePercent: 0,
    active: true,
  },
  {
    id: "groupe-f",
    code: "F",
    name: "Groupe F",
    description: "TVA marché public à financement extérieur (16 %)",
    comments:
      "Opération taxée au taux normal de 16 % pour laquelle l’État prend en charge en partie ou en totalité la TVA sous forme de crédit d’impôt (réf. art. 14 à 16 de l’arrêté ministériel n°076 du 13 janvier 2012). NB : TVA facturée à 16 %, payée par crédit d’impôt.",
    ratePercent: 16,
    active: true,
  },
  {
    id: "groupe-g",
    code: "G",
    name: "Groupe G",
    description: "TVA marché public à financement extérieur (5 %)",
    comments:
      "Opération taxée au taux réduit de 5 % pour laquelle l’État prend en charge en partie ou en totalité la TVA sous forme de crédit d’impôt (réf. art. 14 à 16 de l’arrêté ministériel n°076 du 13 janvier 2012). NB : TVA facturée à 5 %, payée par crédit d’impôt.",
    ratePercent: 5,
    active: true,
  },
  {
    id: "groupe-h",
    code: "H",
    name: "Groupe H",
    description: "Consignation / déconsignation d’emballage",
    comments:
      "Opérations relatives aux montants perçus à titre de consigne lors de la livraison d’emballages identifiables, récupérables et réutilisables (réf. art. 29 de l’ordonnance-loi n°10/001 du 20 août 2010). NB : la TVA n’est pas facturée.",
    ratePercent: 0,
    active: true,
  },
  {
    id: "groupe-i",
    code: "I",
    name: "Groupe I",
    description: "Garantie et caution",
    comments:
      "Opérations relatives aux montants déposés en garantie d’une transaction ; ils ne constituent pas le chiffre d’affaires (réf. art. 29 de l’ordonnance-loi n°10/001 du 20 août 2010). NB : la TVA n’est pas facturée.",
    ratePercent: 0,
    active: true,
  },
  {
    id: "groupe-j",
    code: "J",
    name: "Groupe J",
    description: "Débours",
    comments:
      "Opération relative au remboursement de frais facturés à hauteur stricte au client (réf. art. 29 de l’ordonnance-loi n°10/001 du 20 août 2010). NB : la TVA n’est pas facturée.",
    ratePercent: 0,
    active: true,
  },
  {
    id: "groupe-k",
    code: "K",
    name: "Groupe K",
    description: "Opérations réalisées par les non-assujettis",
    comments:
      "Opérations réalisées par des catégories d’entreprises n’ayant pas atteint le seuil d’assujettissement à la TVA. NB : la TVA n’est pas facturée.",
    ratePercent: 0,
    active: true,
  },
  {
    id: "groupe-l",
    code: "L",
    name: "Groupe L",
    description: "Prélèvements sur ventes",
    comments:
      "Taxes et prélèvements sur les ventes (taxes parafiscales, provinciales, accises, FPI, etc.) non inclus dans la base taxable TVA et reversés pour le compte des structures bénéficiaires. NB : la TVA n’est pas facturée.",
    ratePercent: 0,
    active: true,
  },
  {
    id: "groupe-m",
    code: "M",
    name: "Groupe M",
    description: "Ventes réglementées avec TVA spécifique",
    comments:
      "Opérations réalisées par une personne assujettie à une TVA spécifique, conformément aux réglementations sectorielles (ex. hydrocarbures). NB : seul le montant HT est facturé.",
    ratePercent: 0,
    active: true,
  },
  {
    id: "groupe-n",
    code: "N",
    name: "Groupe N",
    description: "TVA spécifique",
    comments:
      "Ce groupe retrace la TVA spécifique liée aux ventes réglementées facturées sous le groupe M. NB : seul le montant de la TVA spécifique est facturé.",
    ratePercent: 0,
    active: true,
  },
  {
    id: "groupe-o",
    code: "O",
    name: "Groupe O",
    description: "Taxable — taux réduit 1 %",
    comments:
      "Opération soumise expressément au taux réduit de TVA de 1 % réalisée par une entreprise assujettie à la TVA (réf. art. 35 de l’ordonnance-loi n°10/001 du 20 août 2010 modifiée par la loi de finances gestion 2026). NB : la TVA est facturée à 1 %.",
    ratePercent: 1,
    active: true,
  },
  {
    id: "groupe-p",
    code: "P",
    name: "Groupe P",
    description: "TVA marché public à financement extérieur (1 %)",
    comments:
      "Opération taxée au taux réduit de 1 % pour laquelle l’État prend en charge en partie ou en totalité la TVA sous forme de crédit d’impôt (réf. art. 14 à 16 de l’arrêté ministériel n°076 du 13 janvier 2012). NB : TVA facturée à 1 %, payée par crédit d’impôt.",
    ratePercent: 1,
    active: true,
  },
];
