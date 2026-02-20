import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useDemoEventCandidates } from "@/hooks/useDemoEventCandidates";
import { useToast } from "@/hooks/use-toast";
import type {
  DemoEventCandidate,
  DemoEventCandidateFilter,
  DemoEventCandidateStatus,
} from "@/types/demo-event-candidate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  ExternalLink,
  Loader2,
  Pencil,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

const STATUS_FILTER_OPTIONS: { value: DemoEventCandidateFilter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const CATEGORY_LABELS: Record<DemoEventCandidate["gear_category"], string> = {
  skis: "Skis",
  snowboards: "Snowboards",
  surfboards: "Surfboards",
  "mountain-bikes": "Mountain Bikes",
};

type EditDraft = {
  title: string;
  company: string;
  gear_category: DemoEventCandidate["gear_category"];
  event_date: string;
  event_time: string;
  location: string;
  location_lat: string;
  location_lng: string;
  equipment_available: string;
  source_primary_url: string;
  thumbnail_url: string;
};

const getStatusBadgeVariant = (status: DemoEventCandidateStatus): "default" | "secondary" | "destructive" => {
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
};

const formatEventDate = (value: string) => {
  try {
    return format(new Date(`${value}T00:00:00`), "MMM d, yyyy");
  } catch {
    return value;
  }
};

const formatEventTime = (value: string | null) => {
  if (!value) return "TBD";

  try {
    const normalized = value.length >= 5 ? value.slice(0, 5) : value;
    return format(new Date(`1970-01-01T${normalized}`), "h:mm a");
  } catch {
    return value;
  }
};

const formatLastSeen = (value: string) => {
  try {
    return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
};

const normalizeOptionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const parseNumberOrNull = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const DemoEventsSection = () => {
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<DemoEventCandidateFilter>("pending");
  const [thumbnailDrafts, setThumbnailDrafts] = useState<Record<string, string>>({});
  const [savingThumbnailIds, setSavingThumbnailIds] = useState<Set<string>>(new Set());
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());
  const [rejectingIds, setRejectingIds] = useState<Set<string>>(new Set());

  const [editingCandidate, setEditingCandidate] = useState<DemoEventCandidate | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [rejectTarget, setRejectTarget] = useState<DemoEventCandidate | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const {
    candidates,
    isLoading,
    error,
    refetch,
    runDiscovery,
    isRunningDiscovery,
    lastRunResult,
    updateCandidate,
    approveCandidate,
    rejectCandidate,
  } = useDemoEventCandidates(statusFilter);

  useEffect(() => {
    setThumbnailDrafts((prev) => {
      const next = { ...prev };
      const currentIds = new Set(candidates.map((candidate) => candidate.id));

      for (const candidate of candidates) {
        if (!(candidate.id in next)) {
          next[candidate.id] = candidate.thumbnail_url ?? "";
        }
      }

      for (const id of Object.keys(next)) {
        if (!currentIds.has(id)) {
          delete next[id];
        }
      }

      return next;
    });
  }, [candidates]);

  const updatePendingSet = (
    setter: Dispatch<SetStateAction<Set<string>>>,
    candidateId: string,
    pending: boolean,
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      if (pending) {
        next.add(candidateId);
      } else {
        next.delete(candidateId);
      }
      return next;
    });
  };

  const getThumbnailDraft = (candidate: DemoEventCandidate) =>
    thumbnailDrafts[candidate.id] ?? candidate.thumbnail_url ?? "";

  const setThumbnailDraft = (candidateId: string, value: string) => {
    setThumbnailDrafts((prev) => ({
      ...prev,
      [candidateId]: value,
    }));
  };

  const handleSaveThumbnail = async (candidate: DemoEventCandidate) => {
    const nextThumbnail = normalizeOptionalText(getThumbnailDraft(candidate) || "");
    const currentThumbnail = normalizeOptionalText(candidate.thumbnail_url || "");

    if (nextThumbnail === currentThumbnail) {
      return;
    }

    updatePendingSet(setSavingThumbnailIds, candidate.id, true);
    try {
      await updateCandidate({
        id: candidate.id,
        updates: {
          thumbnail_url: nextThumbnail,
        },
      });

      setThumbnailDraft(candidate.id, nextThumbnail ?? "");
      toast({
        title: "Thumbnail saved",
        description: "Candidate thumbnail URL was updated.",
      });
    } catch (error) {
      console.error("Failed to save candidate thumbnail:", error);
    } finally {
      updatePendingSet(setSavingThumbnailIds, candidate.id, false);
    }
  };

  const handleApproveCandidate = async (candidate: DemoEventCandidate) => {
    const thumbnail = (getThumbnailDraft(candidate) || "").trim();
    if (!thumbnail) {
      return;
    }

    updatePendingSet(setApprovingIds, candidate.id, true);
    try {
      const storedThumbnail = (candidate.thumbnail_url || "").trim();
      if (thumbnail !== storedThumbnail) {
        await updateCandidate({
          id: candidate.id,
          updates: {
            thumbnail_url: thumbnail,
          },
        });
      }

      await approveCandidate(candidate.id);
    } catch (error) {
      console.error("Failed to approve candidate:", error);
    } finally {
      updatePendingSet(setApprovingIds, candidate.id, false);
    }
  };

  const openEditDialog = (candidate: DemoEventCandidate) => {
    setEditingCandidate(candidate);
    setEditDraft({
      title: candidate.title,
      company: candidate.company,
      gear_category: candidate.gear_category,
      event_date: candidate.event_date,
      event_time: candidate.event_time ? candidate.event_time.slice(0, 5) : "",
      location: candidate.location,
      location_lat: candidate.location_lat?.toString() ?? "",
      location_lng: candidate.location_lng?.toString() ?? "",
      equipment_available: candidate.equipment_available ?? "",
      source_primary_url: candidate.source_primary_url,
      thumbnail_url: candidate.thumbnail_url ?? "",
    });
  };

  const closeEditDialog = () => {
    setEditingCandidate(null);
    setEditDraft(null);
    setIsSavingEdit(false);
  };

  const handleSaveEdit = async () => {
    if (!editingCandidate || !editDraft) return;

    const title = editDraft.title.trim();
    const company = editDraft.company.trim();
    const eventDate = editDraft.event_date.trim();
    const location = editDraft.location.trim();
    const sourcePrimaryUrl = editDraft.source_primary_url.trim();

    if (!title || !company || !eventDate || !location || !sourcePrimaryUrl) {
      toast({
        title: "Missing required fields",
        description: "Title, company, date, location, and source URL are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingEdit(true);

    try {
      const nextThumbnail = normalizeOptionalText(editDraft.thumbnail_url);
      const nextEventTime = normalizeOptionalText(editDraft.event_time);

      await updateCandidate({
        id: editingCandidate.id,
        updates: {
          title,
          company,
          gear_category: editDraft.gear_category,
          event_date: eventDate,
          event_time: nextEventTime,
          location,
          location_lat: parseNumberOrNull(editDraft.location_lat),
          location_lng: parseNumberOrNull(editDraft.location_lng),
          equipment_available: normalizeOptionalText(editDraft.equipment_available),
          source_primary_url: sourcePrimaryUrl,
          thumbnail_url: nextThumbnail,
        },
      });

      setThumbnailDraft(editingCandidate.id, nextThumbnail ?? "");
      toast({
        title: "Candidate updated",
        description: "Admin edits were saved.",
      });
      closeEditDialog();
    } catch (error) {
      console.error("Failed to save candidate edits:", error);
      setIsSavingEdit(false);
    }
  };

  const openRejectDialog = (candidate: DemoEventCandidate) => {
    setRejectTarget(candidate);
    setRejectReason("");
  };

  const closeRejectDialog = () => {
    setRejectTarget(null);
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;

    const candidateId = rejectTarget.id;
    updatePendingSet(setRejectingIds, candidateId, true);

    try {
      await rejectCandidate({
        candidateId,
        reason: normalizeOptionalText(rejectReason),
      });
      closeRejectDialog();
    } catch (error) {
      console.error("Failed to reject candidate:", error);
    } finally {
      updatePendingSet(setRejectingIds, candidateId, false);
    }
  };

  const handleRunNow = async () => {
    try {
      await runDiscovery();
    } catch (error) {
      console.error("Failed to run demo event discovery:", error);
    }
  };

  if (isAdminLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You must be an admin to manage demo event discovery candidates.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Demo Events</CardTitle>
              <CardDescription>
                Discover and review upcoming demo events before publishing them to the live calendar.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => void refetch()}
                disabled={isLoading || isRunningDiscovery}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={() => void handleRunNow()} disabled={isRunningDiscovery} className="gap-2">
                {isRunningDiscovery ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Run Agent Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-[180px]">
              <Label htmlFor="demo-events-status-filter" className="text-xs text-muted-foreground">
                Status Filter
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as DemoEventCandidateFilter)}
              >
                <SelectTrigger id="demo-events-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-muted-foreground">Showing {candidates.length} candidates</p>

            {lastRunResult && (
              <p className="text-xs text-muted-foreground">
                Last run processed {lastRunResult.stats.total_processed} events. New: {lastRunResult.stats.new_candidates},
                updated pending: {lastRunResult.stats.updated_pending}.
              </p>
            )}
          </div>

          {error ? (
            <p className="text-sm text-destructive">Failed to load demo event candidates.</p>
          ) : isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading candidates...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Date / Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Thumbnail URL</TableHead>
                    <TableHead>Seen</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="py-10 text-center text-sm text-muted-foreground">
                        No candidates found for this status filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    candidates.map((candidate) => {
                      const thumbnailValue = getThumbnailDraft(candidate);
                      const normalizedDraft = normalizeOptionalText(thumbnailValue) ?? "";
                      const normalizedStored = normalizeOptionalText(candidate.thumbnail_url || "") ?? "";
                      const canSaveThumbnail =
                        normalizedDraft !== normalizedStored && !savingThumbnailIds.has(candidate.id);
                      const canApprove = candidate.status === "pending" && normalizedDraft.length > 0;
                      const isApproving = approvingIds.has(candidate.id);
                      const isRejecting = rejectingIds.has(candidate.id);

                      return (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(candidate.status)}>{candidate.status}</Badge>
                          </TableCell>
                          <TableCell>{CATEGORY_LABELS[candidate.gear_category]}</TableCell>
                          <TableCell className="max-w-[240px] align-top">
                            <div className="font-medium">{candidate.title}</div>
                            <p className="mt-1 text-xs text-muted-foreground">{candidate.id}</p>
                          </TableCell>
                          <TableCell className="align-top">{candidate.company}</TableCell>
                          <TableCell className="align-top">
                            <div>{formatEventDate(candidate.event_date)}</div>
                            <div className="text-xs text-muted-foreground">{formatEventTime(candidate.event_time)}</div>
                          </TableCell>
                          <TableCell className="max-w-[220px] align-top">
                            <span className="line-clamp-2">{candidate.location}</span>
                          </TableCell>
                          <TableCell className="max-w-[220px] align-top">
                            <a
                              href={candidate.source_primary_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex max-w-[210px] items-center gap-1 truncate text-primary hover:underline"
                            >
                              <span className="truncate">{candidate.source_domain || candidate.source_primary_url}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </TableCell>
                          <TableCell className="min-w-[260px] align-top">
                            <div className="flex items-start gap-2">
                              <Input
                                value={thumbnailValue}
                                placeholder="https://..."
                                onChange={(event) => setThumbnailDraft(candidate.id, event.target.value)}
                                disabled={savingThumbnailIds.has(candidate.id) || isApproving}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void handleSaveThumbnail(candidate)}
                                disabled={!canSaveThumbnail || isApproving}
                              >
                                {savingThumbnailIds.has(candidate.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Save"
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{candidate.seen_count}</TableCell>
                          <TableCell>{formatLastSeen(candidate.last_seen_at)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(candidate)}
                                disabled={isApproving || isRejecting}
                                className="gap-1"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => void handleApproveCandidate(candidate)}
                                disabled={!canApprove || isApproving || isRejecting}
                                className="gap-1"
                              >
                                {isApproving ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openRejectDialog(candidate)}
                                disabled={candidate.status !== "pending" || isApproving || isRejecting}
                                className="gap-1"
                              >
                                {isRejecting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <X className="h-3.5 w-3.5" />
                                )}
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(editingCandidate)} onOpenChange={(open) => (!open ? closeEditDialog() : undefined)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Demo Event Candidate</DialogTitle>
            <DialogDescription>
              Update candidate fields before approval. Saving marks this row as admin edited.
            </DialogDescription>
          </DialogHeader>

          {editDraft && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="edit-demo-event-title">Title *</Label>
                  <Input
                    id="edit-demo-event-title"
                    value={editDraft.title}
                    onChange={(event) =>
                      setEditDraft((prev) => (prev ? { ...prev, title: event.target.value } : prev))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-demo-event-company">Company *</Label>
                  <Input
                    id="edit-demo-event-company"
                    value={editDraft.company}
                    onChange={(event) =>
                      setEditDraft((prev) => (prev ? { ...prev, company: event.target.value } : prev))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="edit-demo-event-category">Category *</Label>
                  <Select
                    value={editDraft.gear_category}
                    onValueChange={(value) =>
                      setEditDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              gear_category: value as DemoEventCandidate["gear_category"],
                            }
                          : prev,
                      )
                    }
                  >
                    <SelectTrigger id="edit-demo-event-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-demo-event-date">Date *</Label>
                  <Input
                    id="edit-demo-event-date"
                    type="date"
                    value={editDraft.event_date}
                    onChange={(event) =>
                      setEditDraft((prev) => (prev ? { ...prev, event_date: event.target.value } : prev))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-demo-event-time">Time</Label>
                  <Input
                    id="edit-demo-event-time"
                    type="time"
                    value={editDraft.event_time}
                    onChange={(event) =>
                      setEditDraft((prev) => (prev ? { ...prev, event_time: event.target.value } : prev))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-demo-event-location">Location *</Label>
                <Input
                  id="edit-demo-event-location"
                  value={editDraft.location}
                  onChange={(event) =>
                    setEditDraft((prev) => (prev ? { ...prev, location: event.target.value } : prev))
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="edit-demo-event-lat">Latitude</Label>
                  <Input
                    id="edit-demo-event-lat"
                    type="number"
                    step="any"
                    value={editDraft.location_lat}
                    onChange={(event) =>
                      setEditDraft((prev) => (prev ? { ...prev, location_lat: event.target.value } : prev))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-demo-event-lng">Longitude</Label>
                  <Input
                    id="edit-demo-event-lng"
                    type="number"
                    step="any"
                    value={editDraft.location_lng}
                    onChange={(event) =>
                      setEditDraft((prev) => (prev ? { ...prev, location_lng: event.target.value } : prev))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-demo-event-source">Source URL *</Label>
                <Input
                  id="edit-demo-event-source"
                  value={editDraft.source_primary_url}
                  onChange={(event) =>
                    setEditDraft((prev) =>
                      prev ? { ...prev, source_primary_url: event.target.value } : prev,
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-demo-event-thumbnail">Thumbnail URL</Label>
                <Input
                  id="edit-demo-event-thumbnail"
                  value={editDraft.thumbnail_url}
                  onChange={(event) =>
                    setEditDraft((prev) => (prev ? { ...prev, thumbnail_url: event.target.value } : prev))
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="edit-demo-event-equipment">Equipment / Notes</Label>
                <Textarea
                  id="edit-demo-event-equipment"
                  value={editDraft.equipment_available}
                  onChange={(event) =>
                    setEditDraft((prev) =>
                      prev ? { ...prev, equipment_available: event.target.value } : prev,
                    )
                  }
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog} disabled={isSavingEdit}>
              Cancel
            </Button>
            <Button onClick={() => void handleSaveEdit()} disabled={isSavingEdit || !editDraft}>
              {isSavingEdit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(rejectTarget)} onOpenChange={(open) => (!open ? closeRejectDialog() : undefined)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Candidate</DialogTitle>
            <DialogDescription>
              This keeps the row for history and prevents rediscovered duplicates from reopening it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="demo-event-reject-reason">Reason (optional)</Label>
            <Textarea
              id="demo-event-reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Optional rejection reason"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeRejectDialog}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleConfirmReject()}>
              Reject Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DemoEventsSection;
