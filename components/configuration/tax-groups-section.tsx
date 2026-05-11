"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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

function sortTaxGroups(list: TaxGroup[], sortLocale: string): TaxGroup[] {
  const weight = (g: TaxGroup) => {
    const c = g.code.trim().toUpperCase();
    const idx = c.length === 1 ? CODE_ORDER.indexOf(c) : -1;
    return idx === -1 ? 1000 : idx;
  };
  return [...list].sort((a, b) => {
    const wa = weight(a);
    const wb = weight(b);
    if (wa !== wb) return wa - wb;
    return a.name.localeCompare(b.name, sortLocale);
  });
}

type RowPatch = Partial<
  Pick<TaxGroup, "name" | "ratePercent" | "code" | "description">
>;

export function TaxGroupsSection() {
  const t = useTranslations("configuration.taxGroups");
  const locale = useLocale();
  const sortLocale = locale === "en" ? "en" : "fr";
  const [groups, setGroups] = useState<TaxGroup[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newActive, setNewActive] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRate, setEditRate] = useState("");

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
      toast.error(t("toasts.builtinDelete"));
      return;
    }
    const current = readTaxGroups();
    persist(current.filter((g) => g.id !== id));
    setEditingId((e) => (e === id ? null : e));
    toast.success(t("toasts.deleted"));
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

  const openEditor = (g: TaxGroup) => {
    setEditingId(g.id);
    setEditCode(g.code);
    setEditName(g.name);
    setEditDescription(g.description);
    setEditRate(String(g.ratePercent));
  };

  const closeEditor = () => {
    setEditingId(null);
  };

  const saveEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const name = editName.trim();
    const code = editCode.trim().toUpperCase();
    const description = editDescription.trim();
    const rate = parseRatePercent(editRate);
    if (!name) {
      toast.error(t("toasts.nameRequired"));
      return;
    }
    if (!code) {
      toast.error(t("toasts.codeRequired"));
      return;
    }
    if (rate === null) {
      toast.error(t("toasts.rateInvalid"));
      return;
    }
    const current = readTaxGroups();
    if (
      current.some(
        (x) => x.id !== editingId && x.code.toUpperCase() === code
      )
    ) {
      toast.error(t("toasts.codeDuplicate"));
      return;
    }
    updateRow(editingId, {
      code,
      name,
      description,
      ratePercent: rate,
    });
    closeEditor();
    toast.success(t("toasts.updated"));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    const code = newCode.trim().toUpperCase();
    const description = newDescription.trim();
    const rate = parseRatePercent(newRate);
    if (!name) {
      toast.error(t("toasts.nameRequired"));
      return;
    }
    if (!code) {
      toast.error(t("toasts.codeRequired"));
      return;
    }
    if (rate === null) {
      toast.error(t("toasts.rateInvalid"));
      return;
    }
    const id = generateNewTaxGroupId(name);
    const current = readTaxGroups();
    if (current.some((g) => g.id === id)) {
      toast.error(t("toasts.idDuplicate"));
      return;
    }
    if (current.some((g) => g.code.toUpperCase() === code)) {
      toast.error(t("toasts.codeDuplicate"));
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
    toast.success(t("toasts.created"));
  };

  const sorted = useMemo(
    () => sortTaxGroups(groups, sortLocale),
    [groups, sortLocale],
  );

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
          <h2 className="text-[16px] font-semibold">{t("title")}</h2>
          <p className="mt-1 text-[13px] text-slate-500">
            {t("intro")}
          </p>
        </div>

        <form
          onSubmit={handleAdd}
          className="border-b border-slate-100 px-5 py-5"
        >
          <p className="mb-4 text-[13px] font-medium text-slate-800">
            {t("newGroup")}
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-x-4 gap-y-4">
              <div className="w-[4.25rem] shrink-0">
                <label className="mb-1 block text-[13px] font-medium">
                  {t("code")} <span className="text-red-500">*</span>
                </label>
                <input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder={t("placeholderCode")}
                  maxLength={4}
                  className="h-11 w-full border border-slate-200 px-2 text-center text-[13px] uppercase outline-none focus:border-[#1f6a9a]"
                  aria-label={t("codeAria")}
                />
              </div>
              <div className="min-w-[10rem] flex-1 basis-48">
                <label className="mb-1 block text-[13px] font-medium">
                  {t("groupName")} <span className="text-red-500">*</span>
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t("placeholderName")}
                  className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                />
              </div>
              <div className="w-full shrink-0 sm:w-28">
                <label className="mb-1 block text-[13px] font-medium">
                  {t("taxRate")} <span className="text-red-500">*</span>
                </label>
                <input
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  inputMode="decimal"
                  placeholder={t("placeholderRate")}
                  className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                />
              </div>
              <div className="w-full shrink-0 sm:w-36">
                <label className="mb-1 block text-[13px] font-medium">
                  {t("status")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={newActive ? "actif" : "inactif"}
                  onChange={(e) => setNewActive(e.target.value === "actif")}
                  className="h-11 w-full border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                  aria-label={t("statusAria")}
                >
                  <option value="actif">{t("active")}</option>
                  <option value="inactif">{t("inactive")}</option>
                </select>
              </div>
              <div className="w-full shrink-0 sm:w-auto">
                <button
                  type="submit"
                  className="h-11 w-full bg-[#1f6a9a] px-6 text-[13px] font-semibold text-white hover:bg-[#18587f] sm:w-auto"
                >
                  {t("add")}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-medium">
                {t("description")}
              </label>
              <input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder={t("placeholderDescription")}
                className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
              />
            </div>
          </div>
        </form>

        <div className="overflow-x-auto px-5 py-5">
          <table className="w-full min-w-[44rem] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 align-top text-slate-500">
                <th className="px-3 pb-2 text-left font-medium whitespace-nowrap">
                  {t("table.code")}
                </th>
                <th className="px-3 pb-2 text-left font-medium">{t("table.groupName")}</th>
                <th className="px-3 pb-2 text-left font-medium">{t("table.description")}</th>
                <th className="px-3 pb-2 text-left font-medium whitespace-nowrap">
                  {t("table.rate")}
                </th>
                <th className="px-3 pb-2 text-left font-medium">{t("table.status")}</th>
                <th className="px-3 pb-2 text-right font-medium">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((g) => (
                <Fragment key={g.id}>
                  <tr className="border-b border-slate-100 align-top">
                    <td className="px-3 py-3 align-top">
                      <span className="font-medium tabular-nums text-slate-800">
                        {g.code}
                      </span>
                    </td>
                    <td className="max-w-[10rem] px-3 py-3 align-top text-[13px] text-slate-800">
                      {g.name}
                    </td>
                    <td className="max-w-[12rem] px-3 py-3 align-top">
                      <p className="m-0 text-[12px] leading-snug text-slate-700">
                        {g.description || t("table.emptyCell")}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top text-[13px] tabular-nums text-slate-800">
                      {g.ratePercent}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span
                        className={
                          g.active
                            ? "inline-block rounded bg-emerald-50 px-2 py-0.5 text-emerald-800"
                            : "inline-block rounded bg-slate-100 px-2 py-0.5 text-slate-600"
                        }
                      >
                        {g.active ? t("active") : t("inactive")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right align-top">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditor(g)}
                          className="border border-slate-200 px-2 py-1 text-[12px] text-[#1f6a9a] hover:bg-slate-50"
                        >
                          {t("edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(g.id)}
                          className="border border-slate-200 px-2 py-1 text-[12px] hover:bg-slate-50"
                        >
                          {g.active ? t("deactivate") : t("activate")}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGroup(g.id)}
                          disabled={BUILTIN_TAX_GROUP_IDS.has(g.id)}
                          className="border border-slate-200 px-2 py-1 text-[12px] text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {t("delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === g.id ? (
                    <tr className="border-b border-slate-200 bg-slate-50/90">
                      <td colSpan={6} className="px-3 py-4">
                        <form
                          onSubmit={saveEditor}
                          className="space-y-4"
                        >
                          <p className="text-[13px] font-medium text-slate-800">
                            {t("editGroupTitle")}{" "}
                            <span className="text-slate-600">
                              ({g.code} — {g.name})
                            </span>
                          </p>
                          <div className="grid gap-4 sm:grid-cols-12 sm:items-end">
                            <div className="sm:col-span-1">
                              <label
                                htmlFor={`edit-code-${g.id}`}
                                className="mb-1 block text-[13px] font-medium"
                              >
                                {t("code")}
                              </label>
                              <input
                                id={`edit-code-${g.id}`}
                                value={editCode}
                                onChange={(e) =>
                                  setEditCode(
                                    e.target.value.toUpperCase().slice(0, 4)
                                  )
                                }
                                maxLength={4}
                                disabled={BUILTIN_TAX_GROUP_IDS.has(g.id)}
                                title={
                                  BUILTIN_TAX_GROUP_IDS.has(g.id)
                                    ? t("codeFrozenHint")
                                    : undefined
                                }
                                className="h-11 w-full border border-slate-200 px-2 text-center text-[13px] uppercase outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                              />
                            </div>
                            <div className="sm:col-span-4">
                              <label
                                htmlFor={`edit-name-${g.id}`}
                                className="mb-1 block text-[13px] font-medium"
                              >
                                {t("groupName")}
                              </label>
                              <input
                                id={`edit-name-${g.id}`}
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label
                                htmlFor={`edit-rate-${g.id}`}
                                className="mb-1 block text-[13px] font-medium"
                              >
                                {t("table.rate")}
                              </label>
                              <input
                                id={`edit-rate-${g.id}`}
                                value={editRate}
                                onChange={(e) => setEditRate(e.target.value)}
                                inputMode="decimal"
                                className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor={`edit-desc-${g.id}`}
                              className="mb-1 block text-[13px] font-medium"
                            >
                              {t("description")}
                            </label>
                            <textarea
                              id={`edit-desc-${g.id}`}
                              value={editDescription}
                              onChange={(e) =>
                                setEditDescription(e.target.value)
                              }
                              rows={3}
                              className="w-full resize-y border border-slate-200 px-3 py-2 text-[13px] leading-snug outline-none focus:border-[#1f6a9a]"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="submit"
                              className="h-10 bg-[#1f6a9a] px-4 text-[13px] font-semibold text-white hover:bg-[#18587f]"
                            >
                              {t("save")}
                            </button>
                            <button
                              type="button"
                              onClick={closeEditor}
                              className="h-10 border border-slate-200 bg-white px-4 text-[13px] text-slate-700 hover:bg-slate-50"
                            >
                              {t("cancel")}
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
          {sorted.length > TAX_GROUPS_PAGE_SIZE ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-slate-500">
                {t("pagination.range", {
                  from: effectivePageIndex * TAX_GROUPS_PAGE_SIZE + 1,
                  to: Math.min(
                    (effectivePageIndex + 1) * TAX_GROUPS_PAGE_SIZE,
                    sorted.length
                  ),
                  total: sorted.length,
                })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={effectivePageIndex <= 0}
                  onClick={goPrevPage}
                  className="h-9 border border-slate-200 px-3 text-[13px] text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("pagination.prev")}
                </button>
                <span className="px-1 text-[13px] text-slate-500">
                  {t("pagination.page", {
                    current: effectivePageIndex + 1,
                    total: totalPages,
                  })}
                </span>
                <button
                  type="button"
                  disabled={effectivePageIndex >= maxPageIndex}
                  onClick={goNextPage}
                  className="h-9 border border-slate-200 px-3 text-[13px] text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("pagination.next")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end">
        <p className="text-[12px] text-slate-500">
          {t("autoSaveHint")}
        </p>
      </div>
    </>
  );
}
