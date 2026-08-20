"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Bell, Check, Phone, MessageCircle, CalendarClock, UserRound, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const REMINDER_TYPES = [
  { value: "follow_up", label: "Follow-up", icon: UserRound },
  { value: "call", label: "Call", icon: Phone },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "meeting", label: "Meeting", icon: CalendarClock },
];

function toLocalInput(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function RemindersPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [editReminder, setEditReminder] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data: reminders = [] } = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*, clients(id, name)")
        .order("due_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-min"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("id, name").order("name");
      return data ?? [];
    },
  });

  /* ── Add ── */
  async function handleAdd(e) {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.target);
    const payload = {
      agent_id: user.id,
      client_id: fd.get("client_id") ? String(fd.get("client_id")) : null,
      title: String(fd.get("title") || ""),
      type: fd.get("type"),
      due_at: new Date(String(fd.get("due_at"))).toISOString(),
    };
    const { error } = await supabase.from("reminders").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Reminder scheduled");
    setAddOpen(false);
    e.target.reset();
    qc.invalidateQueries({ queryKey: ["reminders"] });
  }

  /* ── Mark done ── */
  async function markDone(id) {
    await supabase.from("reminders").update({ status: "done" }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["reminders"] });
    toast.success("Marked as done");
  }

  /* ── Edit ── */
  function openEdit(r) {
    setEditReminder(r);
    setEditForm({
      title: r.title || "",
      type: r.type || "follow_up",
      due_at: toLocalInput(r.due_at),
      client_id: r.client_id || "",
    });
  }

  async function handleEdit(e) {
    e.preventDefault();
    const { error } = await supabase
      .from("reminders")
      .update({
        title: editForm.title,
        type: editForm.type,
        due_at: new Date(editForm.due_at).toISOString(),
        client_id: editForm.client_id || null,
      })
      .eq("id", editReminder.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Reminder updated");
    setEditReminder(null);
    qc.invalidateQueries({ queryKey: ["reminders"] });
  }

  /* ── Delete ── */
  async function handleDelete() {
    const { error } = await supabase.from("reminders").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Reminder deleted");
    setDeleteId(null);
    qc.invalidateQueries({ queryKey: ["reminders"] });
  }

  const pending = reminders.filter((r) => r.status === "pending");
  const done = reminders.filter((r) => r.status === "done");

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="mt-1 text-sm text-muted-foreground">{pending.length} pending</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-[var(--shadow-glow)]">
              <Plus className="mr-1.5 h-4 w-4" /> New reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule a reminder</DialogTitle></DialogHeader>
            <ReminderForm clients={clients} onSubmit={handleAdd} submitLabel="Schedule" />
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      {pending.length === 0 && done.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <Bell className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-3 font-display text-lg font-semibold">No reminders</h3>
          <p className="mt-1 text-sm text-muted-foreground">Schedule a follow-up so you never forget a lead.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending</div>
              <ReminderList
                items={pending}
                onDone={markDone}
                onEdit={openEdit}
                onDelete={(id) => setDeleteId(id)}
              />
            </div>
          )}
          {done.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed</div>
              <ReminderList
                items={done}
                onDone={markDone}
                onEdit={openEdit}
                onDelete={(id) => setDeleteId(id)}
                muted
              />
            </div>
          )}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editReminder} onOpenChange={(v) => !v && setEditReminder(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit reminder</DialogTitle></DialogHeader>
          <ReminderForm
            clients={clients}
            form={editForm}
            onChange={setEditForm}
            onSubmit={handleEdit}
            submitLabel="Save changes"
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              This reminder will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─────────────── Reminder List ─────────────── */
function ReminderList({ items, onDone, onEdit, onDelete, muted }) {
  return (
    <div className="space-y-2">
      {items.map((r) => {
        const typeInfo = REMINDER_TYPES.find((t) => t.value === r.type) || REMINDER_TYPES[0];
        const Icon = typeInfo.icon;
        const overdue = r.status === "pending" && new Date(r.due_at) < new Date();
        return (
          <div
            key={r.id}
            className={`flex items-center gap-4 rounded-xl border bg-card p-4 transition
              ${overdue ? "border-destructive/40 bg-destructive/5" : "border-border"}
              ${muted ? "opacity-60" : "hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"}`}
          >
            {/* Icon */}
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg
              ${overdue ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"}`}>
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{r.title}</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                <span className="capitalize">{typeInfo.label}</span>
                {r.clients?.name && (
                  <>
                    <span className="text-border">·</span>
                    <span>{r.clients.name}</span>
                  </>
                )}
                <span className="text-border">·</span>
                <span>{new Date(r.due_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                {overdue && <span className="font-semibold text-destructive">overdue</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              {r.status === "pending" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 text-xs"
                  onClick={() => onDone(r.id)}
                >
                  <Check className="h-3.5 w-3.5" /> Done
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(r)}
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(r.id)}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────── Reminder Form ─────────────── */
function ReminderForm({ clients, form, onChange, onSubmit, submitLabel }) {
  const controlled = !!onChange;

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label className="mb-1 block text-xs font-medium">Title *</Label>
        {controlled ? (
          <Input
            value={form?.title ?? ""}
            onChange={(e) => onChange((p) => ({ ...p, title: e.target.value }))}
            placeholder="Follow up about Kakkanad plot"
            required
          />
        ) : (
          <Input name="title" placeholder="Follow up about Kakkanad plot" required />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1 block text-xs font-medium">Type</Label>
          {controlled ? (
            <Select value={form?.type} onValueChange={(v) => onChange((p) => ({ ...p, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REMINDER_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <Select name="type" defaultValue="follow_up">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REMINDER_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label className="mb-1 block text-xs font-medium">Client</Label>
          {controlled ? (
            <Select value={form?.client_id || ""} onValueChange={(v) => onChange((p) => ({ ...p, client_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <Select name="client_id">
              <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div>
        <Label className="mb-1 block text-xs font-medium">Due *</Label>
        {controlled ? (
          <Input
            type="datetime-local"
            value={form?.due_at ?? ""}
            onChange={(e) => onChange((p) => ({ ...p, due_at: e.target.value }))}
            required
          />
        ) : (
          <Input name="due_at" type="datetime-local" required />
        )}
      </div>
      <DialogFooter><Button type="submit">{submitLabel}</Button></DialogFooter>
    </form>
  );
}
