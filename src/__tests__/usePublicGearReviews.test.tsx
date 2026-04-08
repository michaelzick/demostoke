import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePublicGearReviews } from '@/hooks/usePublicGearReviews';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn() },
}));

vi.mock('@/utils/gearUrl', () => ({
  toISODate: (d: string | undefined | null) => (d ? d.split('T')[0] : ''),
}));

import { supabase } from '@/integrations/supabase/client';

// ---------------------------------------------------------------------------
// Query builder factories
// The Supabase JS client uses a chainable builder pattern. The final method
// in each chain must return an awaitable { data, error } result.
// ---------------------------------------------------------------------------

const makeReviewsBuilder = (result: { data: unknown; error: unknown }) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue(result),
});

const makeProfilesBuilder = (result: { data: unknown; error: unknown }) => ({
  select: vi.fn().mockReturnThis(),
  in: vi.fn().mockResolvedValue(result),
});

// ---------------------------------------------------------------------------
// React Query wrapper — retry:0 so failed queries fail fast in tests
// ---------------------------------------------------------------------------

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('usePublicGearReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fire any query when equipmentId is empty', () => {
    const { result } = renderHook(() => usePublicGearReviews(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns an empty array when there are no reviews', async () => {
    vi.mocked(supabase.from).mockImplementationOnce(
      () => makeReviewsBuilder({ data: [], error: null }) as any,
    );

    const { result } = renderHook(() => usePublicGearReviews('equip-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
    // profiles table should never be queried when there are no reviews
    expect(vi.mocked(supabase.from)).toHaveBeenCalledTimes(1);
  });

  it('returns shaped reviews with resolved author names', async () => {
    const reviewRows = [
      {
        id: 'r1',
        rating: 5,
        review_text: 'Awesome board!',
        reviewer_id: 'u1',
        created_at: '2026-03-01T12:00:00Z',
      },
      {
        id: 'r2',
        rating: 4,
        review_text: null,
        reviewer_id: 'u2',
        created_at: '2026-02-15T08:00:00Z',
      },
    ];
    const profiles = [
      { id: 'u1', name: 'Alex Surfer' },
      { id: 'u2', name: 'Jordan Rider' },
    ];

    vi.mocked(supabase.from)
      .mockImplementationOnce(() => makeReviewsBuilder({ data: reviewRows, error: null }) as any)
      .mockImplementationOnce(() => makeProfilesBuilder({ data: profiles, error: null }) as any);

    const { result } = renderHook(() => usePublicGearReviews('equip-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      { authorName: 'Alex Surfer', createdAt: '2026-03-01', rating: 5, reviewText: 'Awesome board!' },
      { authorName: 'Jordan Rider', createdAt: '2026-02-15', rating: 4, reviewText: null },
    ]);
  });

  it('filters out reviews whose reviewer has no public profile', async () => {
    const reviewRows = [
      { id: 'r1', rating: 5, review_text: 'Loved it', reviewer_id: 'u1', created_at: '2026-03-01T00:00:00Z' },
      { id: 'r2', rating: 3, review_text: 'OK', reviewer_id: 'u2', created_at: '2026-02-01T00:00:00Z' },
    ];
    // Only u1 has a public profile
    const profiles = [{ id: 'u1', name: 'Alex Surfer' }];

    vi.mocked(supabase.from)
      .mockImplementationOnce(() => makeReviewsBuilder({ data: reviewRows, error: null }) as any)
      .mockImplementationOnce(() => makeProfilesBuilder({ data: profiles, error: null }) as any);

    const { result } = renderHook(() => usePublicGearReviews('equip-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].authorName).toBe('Alex Surfer');
  });

  it('returns an empty array when all reviewers lack a reviewer_id', async () => {
    const reviewRows = [
      { id: 'r1', rating: 5, review_text: 'Nice', reviewer_id: null, created_at: '2026-03-01T00:00:00Z' },
    ];

    vi.mocked(supabase.from).mockImplementationOnce(
      () => makeReviewsBuilder({ data: reviewRows, error: null }) as any,
    );

    const { result } = renderHook(() => usePublicGearReviews('equip-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
    // profiles table should not be queried when there are no valid reviewer IDs
    expect(vi.mocked(supabase.from)).toHaveBeenCalledTimes(1);
  });

  it('returns an empty array when the reviews fetch errors', async () => {
    vi.mocked(supabase.from).mockImplementationOnce(
      () => makeReviewsBuilder({ data: null, error: new Error('DB error') }) as any,
    );

    const { result } = renderHook(() => usePublicGearReviews('equip-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('returns an empty array when the profiles fetch errors', async () => {
    const reviewRows = [
      { id: 'r1', rating: 5, review_text: 'Great', reviewer_id: 'u1', created_at: '2026-03-01T00:00:00Z' },
    ];

    vi.mocked(supabase.from)
      .mockImplementationOnce(() => makeReviewsBuilder({ data: reviewRows, error: null }) as any)
      .mockImplementationOnce(() => makeProfilesBuilder({ data: null, error: new Error('Profile error') }) as any);

    const { result } = renderHook(() => usePublicGearReviews('equip-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('deduplicates reviewer IDs before querying public_profiles', async () => {
    // Two reviews from the same reviewer
    const reviewRows = [
      { id: 'r1', rating: 5, review_text: 'Great', reviewer_id: 'u1', created_at: '2026-03-01T00:00:00Z' },
      { id: 'r2', rating: 4, review_text: 'Good', reviewer_id: 'u1', created_at: '2026-02-01T00:00:00Z' },
    ];
    const profiles = [{ id: 'u1', name: 'Alex Surfer' }];
    const profilesBuilder = makeProfilesBuilder({ data: profiles, error: null });

    vi.mocked(supabase.from)
      .mockImplementationOnce(() => makeReviewsBuilder({ data: reviewRows, error: null }) as any)
      .mockImplementationOnce(() => profilesBuilder as any);

    const { result } = renderHook(() => usePublicGearReviews('equip-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(profilesBuilder.in).toHaveBeenCalledWith('id', ['u1']);
  });

  it('queries equipment_reviews with the correct equipment ID and limit', async () => {
    const reviewsBuilder = makeReviewsBuilder({ data: [], error: null });
    vi.mocked(supabase.from).mockImplementationOnce(() => reviewsBuilder as any);

    renderHook(() => usePublicGearReviews('equip-42'), { wrapper: createWrapper() });

    await waitFor(() => expect(reviewsBuilder.limit).toHaveBeenCalled());
    expect(vi.mocked(supabase.from)).toHaveBeenCalledWith('equipment_reviews');
    expect(reviewsBuilder.eq).toHaveBeenCalledWith('equipment_id', 'equip-42');
    expect(reviewsBuilder.limit).toHaveBeenCalledWith(3);
  });
});
