"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

export type ReferentialTaux = {
  id: string;
  libelle: string;
  /** Taux en pourcentage (ex. 16 pour 16 %) */
  valeurPercent: number;
};

const INITIAL: ReferentialTaux[] = [
  { id: "t1", libelle: "TVA standard", valeurPercent: 16 },
];

function parsePercent(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  return n;
}

function numberLocaleTag(locale: string): string {
  if (locale === "en") return "en-US";
  return "fr-FR";
}

export function ReferentialTauxSection() {
  const t = useTranslations("configuration.referentialRates");
  const locale = useLocale();
  const sortLocale = locale === "en" ? "en" : "fr";
  const numberTag = numberLocaleTag(locale);

  const [rows, setRows] = useState<ReferentialTaux[]>(INITIAL);
  const [newLibelle, setNewLibelle] = useState("");
  const [newTaux, setNewTaux] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLibelle, setEditLibelle] = useState("");
  const [editTaux, setEditTaux] = useState("");

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) =>
        a.libelle.localeCompare(b.libelle, sortLocale),
      ),
    [rows, sortLocale],
  );

  const resetNew = useCallback(() => {
    setNewLibelle("");
    setNewTaux("");
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const libelle = newLibelle.trim();
    const rate = parsePercent(newTaux);
    if (!libelle) {
      toast.error(t("toasts.labelRequired"));
      return;
    }
    if (rate === null) {
      toast.error(t("toasts.rateInvalid"));
      return;
    }
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `t-${Date.now()}`;
    setRows((prev) => [...prev, { id, libelle, valeurPercent: rate }]);
    resetNew();
    toast.success(t("toasts.created"));
  };

  const openEdit = (row: ReferentialTaux) => {
    setEditingId(row.id);
    setEditLibelle(row.libelle);
    setEditTaux(String(row.valeurPercent));
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditLibelle("");
    setEditTaux("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const libelle = editLibelle.trim();
    const rate = parsePercent(editTaux);
    if (!libelle) {
      toast.error(t("toasts.labelRequired"));
      return;
    }
    if (rate === null) {
      toast.error(t("toasts.rateInvalid"));
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.id === editingId ? { ...r, libelle, valeurPercent: rate } : r,
      ),
    );
    closeEdit();
    toast.success(t("toasts.updated"));
  };

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) closeEdit();
    toast.success(t("toasts.deleted"));
  };

  return (
    <div className="border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[16px] font-semibold">{t("title")}</h2>
        <p className="mt-1 text-[12px] text-slate-500">
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div className="min-w-0 flex-1 sm:w-32">
          <label className="mb-1 block text-[13px] font-medium">{t("label")}</label>
          <input
            value={newLibelle}
            onChange={(e) => setNewLibelle(e.target.value)}
            placeholder={t("placeholderLabel")}
            className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
          />
        </div>
        <div className="min-w-0 flex-1 sm:w-32">
          <label className="mb-1 block text-[13px] font-medium">{t("ratePercent")}</label>
          <input
            value={newTaux}
            onChange={(e) => setNewTaux(e.target.value)}
            inputMode="decimal"
            placeholder={t("placeholderRate")}
            className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
          />
        </div>
        <button
          type="submit"
          className="h-11 shrink-0 bg-[#0073C5] px-6 text-[13px] font-semibold text-white hover:bg-[#005999]"
        >
          {t("save")}
        </button>
      </form>

      <div className="overflow-x-auto px-5 py-4">
        <table className="w-full min-w-[320px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2 pr-4 font-medium">{t("label")}</th>
              <th className="py-2 pr-4 font-medium">{t("rateColumn")}</th>
              <th className="w-32 py-2 text-right font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) =>
              editingId === row.id ? (
                <tr key={row.id} className="border-b border-slate-100 align-top">
                  <td colSpan={3} className="py-3">
                    <form
                      onSubmit={handleSaveEdit}
                      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
                    >
                      <div className="min-w-0 flex-1 sm:max-w-xs">
                        <label className="mb-1 block text-[12px] font-medium">
                          {t("label")}
                        </label>
                        <input
                          value={editLibelle}
                          onChange={(e) => setEditLibelle(e.target.value)}
                          className="h-10 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                        />
                      </div>
                      <div className="w-full sm:w-28">
                        <label className="mb-1 block text-[12px] font-medium">
                          {t("ratePercent")}
                        </label>
                        <input
                          value={editTaux}
                          onChange={(e) => setEditTaux(e.target.value)}
                          inputMode="decimal"
                          className="h-10 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="h-10 bg-[#1f6a9a] px-4 text-[12px] font-semibold text-white hover:bg-[#18587f]"
                        >
                          {t("save")}
                        </button>
                        <button
                          type="button"
                          onClick={closeEdit}
                          className="h-10 border border-slate-200 px-4 text-[12px] font-medium hover:bg-slate-50"
                        >
                          {t("cancel")}
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-medium text-slate-800">
                    {row.libelle}
                  </td>
                  <td className="py-3 pr-4 tabular-nums text-slate-700">
                    {row.valeurPercent.toLocaleString(numberTag, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                    &nbsp;%
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50"
                        aria-label={t("editAria")}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 text-red-600 hover:bg-red-50"
                        aria-label={t("deleteAria")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
