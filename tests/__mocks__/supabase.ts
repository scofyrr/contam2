import { vi } from "vitest";

export const createMockSupabaseClient = () => {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockRpc = vi.fn();
  const mockOrder = vi.fn();
  const mockRange = vi.fn();
  const mockLimit = vi.fn();
  const mockIn = vi.fn();
  const mockIs = vi.fn();
  const mockContains = vi.fn();

  const chainable = {
    select: mockSelect.mockReturnThis(),
    insert: mockInsert.mockReturnThis(),
    update: mockUpdate.mockReturnThis(),
    delete: mockDelete.mockReturnThis(),
    eq: mockEq.mockReturnThis(),
    single: mockSingle,
    order: mockOrder.mockReturnThis(),
    range: mockRange.mockReturnThis(),
    limit: mockLimit.mockReturnThis(),
    in: mockIn.mockReturnThis(),
    is: mockIs.mockReturnThis(),
    contains: mockContains.mockReturnThis(),
  };

  mockFrom.mockReturnValue(chainable);
  mockSelect.mockReturnValue(chainable);
  mockInsert.mockReturnValue(chainable);
  mockUpdate.mockReturnValue(chainable);
  mockDelete.mockReturnValue(chainable);
  mockEq.mockReturnValue(chainable);

  return {
    from: mockFrom,
    rpc: mockRpc,
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    single: mockSingle,
    order: mockOrder,
    range: mockRange,
    limit: mockLimit,
    in: mockIn,
    is: mockIs,
    contains: mockContains,
    rpcFn: mockRpc,
    mockResolveValue: (data: unknown) => mockSingle.mockResolvedValue({ data, error: null }),
    mockResolveArray: (data: unknown[]) => mockSelect.mockResolvedValue({ data, error: null }),
    mockReject: (error: unknown) => mockSingle.mockResolvedValue({ data: null, error }),
    mockRpcResolve: (data: unknown) => mockRpc.mockResolvedValue({ data, error: null }),
  };
};

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;
