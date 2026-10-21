import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAdminOrders, updateAdminOrderStatus } from '@/api/admin';
import { OrderStatus } from '@/api/orders';

const ADMIN_ORDERS_KEY = 'admin-orders';

// All orders, optionally filtered by status. Disabled without a token.
export function useAdminOrdersQuery(
  token: string | null,
  status?: OrderStatus,
) {
  return useQuery({
    queryKey: [ADMIN_ORDERS_KEY, token, status ?? 'all'],
    queryFn: () => getAdminOrders(token as string, status),
    enabled: !!token,
  });
}

export function useUpdateOrderStatusMutation(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      updateAdminOrderStatus(token as string, id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [ADMIN_ORDERS_KEY] }),
  });
}
