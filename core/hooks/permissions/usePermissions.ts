"use client";

import { useQuery } from "@tanstack/react-query";
import {
    rbacConfigurationService,
    type ListPermissionsParams,
} from "@/core/services/rbac-configuration.service";

export const permissionsQueryKeys = {
    all: ["permissions"] as const,
    list: (params: ListPermissionsParams) =>
        [...permissionsQueryKeys.all, "list", params] as const,
};

export function usePermissions(params: ListPermissionsParams = {}) {
    return useQuery({
        queryKey: permissionsQueryKeys.list(params),
        queryFn: () => rbacConfigurationService.fetchPermissions(params),
    });
}
