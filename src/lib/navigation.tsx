'use client';

import NextLink from 'next/link';
import { useParams as useNextParams, usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ComponentProps } from 'react';

export function useParams<Params extends object = Record<string, string>>() {
  return useNextParams() as Params;
}

export function useMatch(path: string) {
  return usePathname() === path;
}

const InitialSearchContext = createContext('');
export const InitialSearchProvider = InitialSearchContext.Provider;

const ENTRY_STATE = 'demostokeNavigationState';
const listeners = new Set<() => void>();
let pending: { href: string; state: unknown } | null = null;

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  window.addEventListener('hashchange', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
    window.removeEventListener('hashchange', listener);
  };
}

function currentUrl() {
  return window.location.pathname + window.location.search + window.location.hash;
}

function stateForPath(pathname: string) {
  if (pending && new URL(pending.href, window.location.origin).pathname === pathname) {
    return pending.state;
  }
  if (window.location.pathname === pathname) return window.history.state?.[ENTRY_STATE] ?? null;
  return null;
}

const nullState = () => null;
const emptyValue = () => '';
const readSearch = () => window.location.search;
const readHash = () => window.location.hash;

export function NavigationObserver() {
  const pathname = usePathname();
  const search = useNextSearchParams().toString();

  useEffect(() => {
    if (pending) {
      if (pending.href === currentUrl()) {
        window.history.replaceState({
          ...window.history.state,
          [ENTRY_STATE]: pending.state,
        }, '');
      }
      pending = null;
    }
    notify();
  }, [pathname, search]);

  return null;
}

export function useLocation() {
  const pathname = usePathname();
  const initialSearch = useContext(InitialSearchContext);
  const search = useSyncExternalStore(subscribe, readSearch, () => initialSearch);
  const hash = useSyncExternalStore(subscribe, readHash, emptyValue);
  const state = useSyncExternalStore(subscribe, () => stateForPath(pathname), nullState);
  return { pathname, search, hash, state, key: pathname + search + hash };
}

type NavigationOptions = { replace?: boolean; state?: unknown };
type LinkProps = Omit<ComponentProps<typeof NextLink>, 'href' | 'state'> & { to: string; state?: unknown };

function setPending(to: string, state: unknown) {
  const url = new URL(to, window.location.href);
  pending = { href: url.pathname + url.search + url.hash, state: state ?? null };
}

export function Link({ to, state, onNavigate, prefetch = false, ...props }: LinkProps) {
  return (
    <NextLink
      {...props}
      href={to}
      prefetch={prefetch}
      scroll={false}
      onNavigate={(event) => {
        onNavigate?.(event);
        setPending(to, state);
      }}
    />
  );
}

export function useNavigate() {
  const router = useRouter();
  return useCallback((to: string | number, { replace, state }: NavigationOptions = {}) => {
    if (typeof to === 'number') {
      window.history.go(to);
      return;
    }
    setPending(to, state);
    if (replace) router.replace(to, { scroll: false });
    else router.push(to, { scroll: false });
  }, [router]);
}

export function Navigate({ to, replace, state }: NavigationOptions & { to: string }) {
  const navigate = useNavigate();
  // Redirect after hydration for flows driven by the browser Supabase session.
  const from = (state as { from?: string } | undefined)?.from;
  useEffect(() => {
    navigate(to, { replace, state: from ? { from } : undefined });
  }, [navigate, to, replace, from]);
  return null;
}

type SearchParamsInit = string | string[][] | Record<string, string> | URLSearchParams;

export function useSearchParams() {
  const { search } = useLocation();
  const setSearchParams = useCallback((
    params: SearchParamsInit | ((previous: URLSearchParams) => SearchParamsInit),
    options?: NavigationOptions,
  ) => {
    const next = typeof params === 'function' ? params(new URLSearchParams(readSearch())) : params;
    const query = new URLSearchParams(next).toString();
    const href = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
    if (href === currentUrl()) return;
    if (options?.replace) window.history.replaceState({ [ENTRY_STATE]: window.history.state?.[ENTRY_STATE] }, '', href);
    else window.history.pushState(null, '', href);
    notify();
  }, []);
  return [useMemo(() => new URLSearchParams(search), [search]), setSearchParams] as const;
}
