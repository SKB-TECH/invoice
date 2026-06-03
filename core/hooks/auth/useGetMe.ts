import { useQuery } from "@tanstack/react-query";
import {authService} from "@/core/services/auth.service";


export const useGetMe = () => {
    return useQuery({
        queryKey: ["auth-me"],
        queryFn: () => authService.me(),
        retry: false,
        staleTime: 1000 * 60 * 5,
    });
};
