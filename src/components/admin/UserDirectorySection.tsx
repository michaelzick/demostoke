
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Copy, Check, ArrowUpDown, ChevronDown, ChevronUp, Eye, EyeOff, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserVisibilityToggle } from "@/hooks/useUserVisibilityToggle";

interface ProfileRow {
  id: string;
  name: string | null;
  is_hidden: boolean;
}

const PAGE_SIZE = 25;

const UserDirectorySection = () => {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingVisibilityIds, setPendingVisibilityIds] = useState<Set<string>>(new Set());
  const { toggleUserVisibility } = useUserVisibilityToggle();

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, is_hidden")
        .order("name", { ascending: true });
      if (!error && data) {
        setProfiles(data);
      }
      setLoading(false);
    };
    fetchProfiles();
  }, []);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    let result = profiles.filter((p) =>
      (p.name ?? "").toLowerCase().includes(search.toLowerCase())
    );
    result.sort((a, b) => {
      const nameA = (a.name ?? "").toLowerCase();
      const nameB = (b.name ?? "").toLowerCase();
      return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    return result;
  }, [profiles, search, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleCopy = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const updatePendingVisibilityState = (profileId: string, pending: boolean) => {
    setPendingVisibilityIds((prev) => {
      const next = new Set(prev);
      if (pending) {
        next.add(profileId);
      } else {
        next.delete(profileId);
      }
      return next;
    });
  };

  const handleToggleVisibility = async (profile: ProfileRow) => {
    updatePendingVisibilityState(profile.id, true);

    try {
      const newHiddenValue = await toggleUserVisibility(profile.id, profile.is_hidden);
      setProfiles((prev) =>
        prev.map((entry) =>
          entry.id === profile.id ? { ...entry, is_hidden: newHiddenValue } : entry,
        ),
      );
    } catch (error) {
      console.error("Error updating user directory visibility:", error);
    } finally {
      updatePendingVisibilityState(profile.id, false);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Directory</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon">
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setSearch(""); setCurrentPage(1); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 -ml-3"
                          onClick={() => setSortAsc(!sortAsc)}
                        >
                          Name
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>UUID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paged.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name ?? "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                {p.is_hidden ? (
                                  <EyeOff className="h-3.5 w-3.5 text-destructive" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                                <span>{p.is_hidden ? "Hidden" : "Visible"}</span>
                              </div>
                              <Switch
                                checked={!p.is_hidden}
                                onCheckedChange={() => handleToggleVisibility(p)}
                                disabled={pendingVisibilityIds.has(p.id)}
                                aria-label={`Toggle visibility for ${p.name ?? p.id}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono">{p.id}</code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopy(p.id)}
                              >
                                {copiedId === p.id ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default UserDirectorySection;
