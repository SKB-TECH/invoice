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

function parseRatePercent(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  return n;
}

export function TaxGroupsSection() {
  const [groups, setGroups] = useState<TaxGroup[]>([]);
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newActive, setNewActive] = useState(true);

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
      toast.error("Ce groupe intégré ne peut pas être supprimé.");
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

  const updateRow = (id: string, patch: Partial<Pick<TaxGroup, "name" | "ratePercent">>) => {
    const current = readTaxGroups();
    persist(
      current.map((g) => (g.id === id ? { ...g, ...patch } : g))
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    const rate = parseRatePercent(newRate);
    if (!name) {
      toast.error("Indiquez un nom de groupe.");
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
    const next: TaxGroup[] = [
      ...current,
      { id, name, ratePercent: rate, active: newActive },
    ];
    persist(next);
    setNewName("");
    setNewRate("");
    setNewActive(true);
    toast.success("Groupe de taxation créé.");
  };

  const sorted = useMemo(
    () => [...groups].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [groups]
  );

  return (
    <>
      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-[16px] font-semibold">Groupes de taxation</h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Définissez les groupes (nom, taux, statut). Les groupes{" "}
            <span className="font-medium text-slate-700">actifs</span> sont
            proposés lors de la création ou modification d’un article.
          </p>
        </div>

        <form
          onSubmit={handleAdd}
          className="border-b border-slate-100 px-5 py-5"
        >
          <p className="mb-4 text-[13px] font-medium text-slate-800">
            Nouveau groupe
          </p>
          <div className="grid gap-4 md:grid-cols-12 md:items-end">
            <div className="md:col-span-5">
              <label className="mb-1 block text-[13px] font-medium">
                Nom du groupe <span className="text-red-500">*</span>
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex. TVA import"
                className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
              />
            </div>
            <div className="md:col-span-2">
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
            <div className="md:col-span-3">
              <label className="mb-1 block text-[13px] font-medium">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                value={newActive ? "actif" : "inactif"}
                onChange={(e) => setNewActive(e.target.value === "actif")}
                className="h-11 w-full border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-start">
              <button
                type="submit"
                className="h-11 w-full bg-[#1f6a9a] px-4 text-[13px] font-semibold text-white hover:bg-[#18587f] md:w-auto"
              >
                Ajouter
              </button>
            </div>
          </div>
        </form>

        <div className="overflow-x-auto px-5 py-5">
          <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2 pr-4 font-medium">Nom</th>
                <th className="pb-2 pr-4 font-medium">Taux (%)</th>
                <th className="pb-2 pr-4 font-medium">Statut</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((g) => (
                <tr key={g.id} className="border-b border-slate-100 align-middle">
                  <td className="py-3 pr-4">
                    <input
                      value={g.name}
                      onChange={(e) => updateRow(g.id, { name: e.target.value })}
                      className="h-9 w-full min-w-[8rem] border border-slate-200 px-2 text-[13px] outline-none focus:border-[#1f6a9a]"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      value={String(g.ratePercent)}
                      onChange={(e) => {
                        const r = parseRatePercent(e.target.value);
                        if (r !== null) updateRow(g.id, { ratePercent: r });
                      }}
                      inputMode="decimal"
                      className="h-9 w-20 border border-slate-200 px-2 text-[13px] outline-none focus:border-[#1f6a9a]"
                    />
                  </td>
                  <td className="py-3 pr-4">
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
                  <td className="py-3 text-right">
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
        </div>
      </div>

      <div className="flex justify-end">
        <p className="text-[12px] text-slate-500">
          Les modifications sont enregistrées automatiquement sur cet
          appareil (démo).
        </p>
      </div>
    </>
  );
}
