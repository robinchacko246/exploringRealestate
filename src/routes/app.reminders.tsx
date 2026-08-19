import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Bell, Check, Phone, MessageCircle, CalendarClock, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/app/reminders")({
  component: RemindersPage,
});

function RemindersPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

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

  async function add(form: FormData): Promise<void> {
    if (!user) return;
    const due = String(form.get("due_at") || "");
    const payload = {
      agent_id: user.id,
      client_id: form.get("client_id") ? String(form.get("client_id")) : null,
      title: String(form.get("title") || ""),
      type: form.get("type") as any,
      due_at: new Date(due).toISOString(),
    };
    const { error } = await supabase.from("reminders").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Reminder scheduled");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["reminders"] });
  }

  async function markDone(id: string) {
    await supabase.from("reminders").update({ status: "done" }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["reminders"] });
  }

  const pending = reminders.filter((r) => r.status === "pending");
  const done = reminders.filter((r) => r.status === "done");

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="mt-1 text-sm text-muted-foreground">{pending.length} pending</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-[var(--shadow-glow)]"><Plus className="mr-1.5 h-4 w-4" /> New reminder</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule a reminder</DialogTitle></DialogHeader>
            <form action={add} className="space-y-3">
              <div><Label>Title *</Label><Input name="title" placeholder="Follow up about Kakkanad plot" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select name="type" defaultValue="follow_up">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Client</Label>
                  <Select name="client_id">
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Due *</Label><Input name="due_at" type="datetime-local" required /></div>
              <DialogFooter><Button type="submit">Schedule</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {pending.length === 0 && done.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <Bell className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-3 font-display text-lg font-semibold">No reminders</h3>
          <p className="mt-1 text-sm text-muted-foreground">Schedule a follow-up so you never forget a lead.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <ReminderList items={pending} onDone={markDone} />
          {done.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed</div>
              <ReminderList items={done} onDone={markDone} muted />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const ICONS: Record<string, any> = { call: Phone, whatsapp: MessageCircle, follow_up: UserRound, meeting: CalendarClock };

function ReminderList({ items, onDone, muted }: any) {
  return (
    <div className="space-y-2">
      {items.map((r: any) => {
        const Icon = ICONS[r.type] ?? Bell;
        const overdue = r.status === "pending" && new Date(r.due_at) < new Date();
        return (
          <div key={r.id} className={`flex items-center gap-4 rounded-xl border bg-card p-4 ${overdue ? "border-destructive/50" : "border-border"} ${muted ? "opacity-60" : ""}`}>
            <div className={`grid h-10 w-10 place-items-center rounded-lg ${overdue ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{r.title}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                {r.clients?.name && <span>{r.clients.name} ·</span>}
                <span>{new Date(r.due_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                {overdue && <span className="font-semibold text-destructive">overdue</span>}
              </div>
            </div>
            {r.status === "pending" && (
              <Button size="sm" variant="outline" onClick={() => onDone(r.id)}>
                <Check className="mr-1 h-3.5 w-3.5" /> Done
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
