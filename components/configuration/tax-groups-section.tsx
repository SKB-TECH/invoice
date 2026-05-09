"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BUILTIN_TAX_GROUP_IDS,
  generateNewTaxGroupId,
  readTaxGroups,
  type TaxGroup,
  writeTaxGroups,
  TAX_GROUPS_CHANGED_EVENT,
} from "@/lib/tax-groups/tax-groups-storage";

const CODE_ORDER = "ABCDEFGHIJKLMNOP";

/** Nombre de groupes affichés par page dans le tableau. */
const TAX_GROUPS_PAGE_SIZE = 4;

function parseRatePercent(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  return n;
}

function sortTaxGroups(list: TaxGroup[]): TaxGroup[] {
  const weight = (g: TaxGroup) => {
    const c = g.code.trim().toUpperCase();
    const idx = c.length === 1 ? CODE_ORDER.indexOf(c) : -1;
    return idx === -1 ? 1000 : idx;
  };
  return [...list].sort((a, b) => {
    const wa = weight(a);
    const wb = weight(b);
    if (wa !== wb) return wa - wb;
    return a.name.localeCompare(b.name, "fr");
  });
}

type RowPatch = Partial<
  Pick<TaxGroup, "name" | "ratePercent" | "code" | "description">
>;

export function TaxGroupsSection() {
  const [groups, setGroups] = useState<TaxGroup[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newActive, setNewActive] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);

  const refresh = useCallback(() => {
    setGroups(readTaxGroups());
  }, []);

  useEffect(() => {
    refresh();
    const onRemote = () => refresh();
    window.addEventListener(TAX_GROUPS_CHANGED_EVENT, onRemote);
    window.addEventListener("storage", onRemote);
    return () => {
      window.removeEventListener(TAX_GROUPS_CHANGED_EVENT, onRemote);
      window.removeEventListener("storage", onRemote);
    };
  }, [refresh]);

  const persist = useCallback((next: TaxGroup[]) => {
    writeTaxGroups(next);
    setGroups(next);
  }, []);

  const deleteGroup = (id: string) => {
    if (BUILTIN_TAX_GROUP_IDS.has(id)) {
      toast.error("Ce groupe du référentiel officiel ne peut pas être supprimé.");
      return;
    }
    const current = readTaxGroups();
    persist(current.filter((g) => g.id !== id));
    toast.success("Groupe supprimé.");
  };

  const toggleActive = (id: string) => {
    const current = readTaxGroups();
    persist(
      current.map((g) =>
        g.id === id ? { ...g, active: !g.active } : g
      )
    );
  };

  const updateRow = (id: string, patch: RowPatch) => {
    const current = readTaxGroups();
    persist(
      current.map((g) => (g.id === id ? { ...g, ...patch } : g))
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    const code = newCode.trim().toUpperCase();
    const description = newDescription.trim();
    const rate = parseRatePercent(newRate);
    if (!name) {
      toast.error("Indiquez un nom de groupe.");
      return;
    }
    if (!code) {
      toast.error("Indiquez un code de groupe.");
      return;
    }
    if (rate === null) {
      toast.error("Indiquez un taux valide entre 0 et 100 %.");
      return;
    }
    const id = generateNewTaxGroupId(name);
    const current = readTaxGroups();
    if (current.some((g) => g.id === id)) {
      toast.error("Identifiant déjà utilisé ; réessayez.");
      return;
    }
    if (current.some((g) => g.code.toUpperCase() === code)) {
      toast.error("Ce code est déjà utilisé.");
      return;
    }
    const next: TaxGroup[] = [
      ...current,
      {
        id,
        code,
        name,
        description,
        comments: "",
        ratePercent: rate,
        active: newActive,
      },
    ];
    persist(next);
    setNewCode("");
    setNewName("");
    setNewDescription("");
    setNewRate("");
    setNewActive(true);
    toast.success("Groupe de taxation créé.");
  };

  const sorted = useMemo(() => sortTaxGroups(groups), [groups]);

  const totalPages = Math.ceil(sorted.length / TAX_GROUPS_PAGE_SIZE) || 1;
  const maxPageIndex = Math.max(0, totalPages - 1);
  const effectivePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageSlice = useMemo(() => {
    const start = effectivePageIndex * TAX_GROUPS_PAGE_SIZE;
    return sorted.slice(start, start + TAX_GROUPS_PAGE_SIZE);
  }, [sorted, effectivePageIndex]);

  const goPrevPage = () =>
    setPageIndex((p) =>
      Math.max(0, Math.min(p, maxPageIndex) - 1)
    );
  const goNextPage = () =>
    setPageIndex((p) =>
      Math.min(maxPageIndex, Math.min(p, maxPageIndex) + 1)
    );

  return (
    <>
      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-[16px] font-semibold">Groupes de taxation</h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Catalogue des groupes que vous pouvez affecter à vos articles. Vous pouvez en ajouter ou adapter libellés et taux. Seuls les groupes{" "}
            <span className="font-medium text-slate-700">actifs</span> sont
            proposés sur les fiches articles.
          </p>
        </div>

        <form
          onSubmit={handleAdd}
          className="border-b border-slate-100 px-5 py-5"
        >
          <p className="mb-4 text-[13px] font-medium text-slate-800">
            Nouveau groupe
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-x-4 gap-y-4">
              <div className="w-[4.25rem] shrink-0">
                <label className="mb-1 block text-[13px] font-medium">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="X"
                  maxLength={4}
                  className="h-11 w-full border border-slate-200 px-2 text-center text-[13px] uppercase outline-none focus:border-[#1f6a9a]"
                  aria-label="Code du groupe de taxation"
                />
              </div>
              <div className="min-w-[10rem] flex-1 basis-48">
                <label className="mb-1 block text-[13px] font-medium">
                  Nom du groupe <span className="text-red-500">*</span>
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex. Groupe X"
                  className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                />
              </div>
              <div className="w-full shrink-0 sm:w-28">
                <label className="mb-1 block text-[13px] font-medium">
                  Taux de taxe (%) <span className="text-red-500">*</span>
                </label>
                <input
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  inputMode="decimal"
                  placeholder="16"
                  className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                />
              </div>
              <div className="w-full shrink-0 sm:w-36">
                <label className="mb-1 block text-[13px] font-medium">
                  Statut <span className="text-red-500">*</span>
                </label>
                <select
                  value={newActive ? "actif" : "inactif"}
                  onChange={(e) => setNewActive(e.target.value === "actif")}
                  className="h-11 w-full border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                  aria-label="Statut actif ou inactif"
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
              <div className="w-full shrink-0 sm:w-auto">
                <button
                  type="submit"
                  className="h-11 w-full bg-[#1f6a9a] px-6 text-[13px] font-semibold text-white hover:bg-[#18587f] sm:w-auto"
                >
                  Ajouter
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-medium">
                Description
              </label>
              <input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Ex. Taxable au taux normal de 16 %"
                className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
              />
            </div>
          </div>
        </form>

        <div className="overflow-x-auto px-5 py-5">
          <table className="w-full min-w-[44rem] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2 pr-2 font-medium">Code</th>
                <th className="pb-2 pr-3 font-medium">Nom du groupe</th>
                <th className="pb-2 pr-3 font-medium">Description</th>
                <th className="pb-2 pr-3 font-medium">Taux (%)</th>
                <th className="pb-2 pr-3 font-medium">Statut</th>
                <th className="pb-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((g) => (
                <tr key={g.id} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-2">
                    <input
                      value={g.code}
                      onChange={(e) =>
                        updateRow(g.id, {
                          code: e.target.value.toUpperCase().slice(0, 4),
                        })
                      }
                      className="h-9 w-10 border border-slate-200 px-1 text-center text-[12px] outline-none focus:border-[#1f6a9a]"
                      disabled={BUILTIN_TAX_GROUP_IDS.has(g.id)}
                      title={
                        BUILTIN_TAX_GROUP_IDS.has(g.id)
                          ? "Code figé pour le référentiel A–P"
                          : undefined
                      }
                      aria-label={`Code ${g.name}`}
                    />
                  </td>
                  <td className="max-w-[10rem] py-3 pr-3">
                    <input
                      value={g.name}
                      onChange={(e) =>
                        updateRow(g.id, { name: e.target.value })
                      }
                      className="h-9 w-full border border-slate-200 px-2 text-[13px] outline-none focus:border-[#1f6a9a]"
                    />
                  </td>
                  <td className="max-w-[12rem] py-3 pr-3">
                    <textarea
                      value={g.description}
                      onChange={(e) =>
                        updateRow(g.id, { description: e.target.value })
                      }
                      rows={2}
                      className="w-full resize-y border border-slate-200 px-2 py-1 text-[12px] leading-snug outline-none focus:border-[#1f6a9a]"
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <input
                      value={String(g.ratePercent)}
                      onChange={(e) => {
                        const r = parseRatePercent(e.target.value);
                        if (r !== null) updateRow(g.id, { ratePercent: r });
                      }}
                      inputMode="decimal"
                      className="h-9 w-16 border border-slate-200 px-2 text-[13px] outline-none focus:border-[#1f6a9a]"
                      aria-label={`Taux pour ${g.name}`}
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={
                        g.active
                          ? "inline-block rounded bg-emerald-50 px-2 py-0.5 text-emerald-800"
                          : "inline-block rounded bg-slate-100 px-2 py-0.5 text-slate-600"
                      }
                    >
                      {g.active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => toggleActive(g.id)}
                      className="mr-2 border border-slate-200 px-2 py-1 text-[12px] hover:bg-slate-50"
                    >
                      {g.active ? "Désactiver" : "Activer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteGroup(g.id)}
                      disabled={BUILTIN_TAX_GROUP_IDS.has(g.id)}
                      className="border border-slate-200 px-2 py-1 text-[12px] text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length > TAX_GROUPS_PAGE_SIZE ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-slate-500">
                <span className="font-medium text-slate-700">
                  {effectivePageIndex * TAX_GROUPS_PAGE_SIZE + 1}
                  {" — "}
                  {Math.min(
                    (effectivePageIndex + 1) * TAX_GROUPS_PAGE_SIZE,
                    sorted.length
                  )}
                </span>{" "}
                sur {sorted.length} groupes
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={effectivePageIndex <= 0}
                  onClick={goPrevPage}
                  className="h-9 border border-slate-200 px-3 text-[13px] text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Précédent
                </button>
                <span className="px-1 text-[13px] text-slate-500">
                  Page {effectivePageIndex + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={effectivePageIndex >= maxPageIndex}
                  onClick={goNextPage}
                  className="h-9 border border-slate-200 px-3 text-[13px] text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end">
        <p className="text-[12px] text-slate-500">
          Les modifications sont enregistrées automatiquement.
        </p>
      </div>
    </>
  );
}
