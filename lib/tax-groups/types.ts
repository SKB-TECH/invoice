/** Groupe de taxation (réf. document DGI / ordonnance-loi TVA RDC). */
export type TaxGroup = {
  id: string;
  /** Intitulé affiché (ex. « Groupe B »). */
  name: string;
  /** Étiquette courte (ex. A, B, … P). */
  code: string;
  /** Résumé métier. */
  description: string;
  /** Commentaires / références légales (texte long). */
  comments: string;
  /** Taux en pourcentage (ex. 16 pour 16 %). Les cas « TVA non facturée » utilisent 0. */
  ratePercent: number;
  active: boolean;
};
