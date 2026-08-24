"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, MapPin, Home, IndianRupee, Phone, User, Pencil, Trash2,
  Maximize2, BedDouble, Sparkles, MessageCircle, Mail, ChevronRight,
  CheckCircle2, XCircle, AlertCircle, SlidersHorizontal,
  ImagePlus, X, ChevronLeft, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const PROPERTY_TYPES = ["plot", "villa", "apartment", "house", "commercial", "land"];

function fmtINR(n) {
  if (!n) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const TYPE_COLORS = {
  plot: "from-emerald-500/20 to-emerald-500/5",
  villa: "from-violet-500/20 to-violet-500/5",
  apartment: "from-blue-500/20 to-blue-500/5",
  house: "from-amber-500/20 to-amber-500/5",
  commercial: "from-slate-500/20 to-slate-500/5",
  land: "from-lime-500/20 to-lime-500/5",
};

const EMPTY_PROP = {
  title: "", property_type: "plot", location: "", price: "",
  land_size_cents: "", bhk: "", owner_name: "", owner_phone: "", description: "",
};

/* ─────────────── Image upload helper ─────────────── */
async function uploadImagesToStorage(files, userId) {
  const urls = [];
  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("property-images")
      .upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("property-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

/* ─────────────── Matching engine ─────────────── */
function matchScore(property, requirement) {
  let score = 0;
  const reasons = [];
  const misses = [];

  // Type match (required)
  if (property.property_type === requirement.property_type) {
    score += 40;
    reasons.push("Type matches");
  } else {
    misses.push(`Type mismatch (${requirement.property_type})`);
  }

  // Budget match
  const price = property.price;
  if (price) {
    const withinMin = !requirement.budget_min || price >= requirement.budget_min * 0.9;
    const withinMax = !requirement.budget_max || price <= requirement.budget_max * 1.1;
    if (withinMin && withinMax) {
      score += 30;
      reasons.push("Within budget");
    } else if (!withinMax) {
      misses.push("Over budget");
    } else {
      misses.push("Under minimum budget");
    }
  } else if (!requirement.budget_min && !requirement.budget_max) {
    score += 15;
  }

  // Location match (partial string match)
  if (requirement.location && property.location) {
    const propLoc = property.location.toLowerCase();
    const reqLoc = requirement.location.toLowerCase();
    if (propLoc.includes(reqLoc) || reqLoc.includes(propLoc)) {
      score += 20;
      reasons.push("Location matches");
    } else {
      misses.push(`Different location (wants ${requirement.location})`);
    }
  } else if (!requirement.location) {
    score += 10;
    reasons.push("No location preference");
  }

  // Land size match
  if (requirement.land_size_cents && property.land_size_cents) {
    const diff = Math.abs(property.land_size_cents - requirement.land_size_cents) / requirement.land_size_cents;
    if (diff <= 0.3) {
      score += 5;
      reasons.push("Size matches");
    } else {
      misses.push(`Size mismatch (wants ${requirement.land_size_cents} cents)`);
    }
  }

  // BHK match
  if (requirement.bhk && property.bhk) {
    if (property.bhk >= requirement.bhk) {
      score += 5;
      reasons.push(`${property.bhk} BHK fits`);
    } else {
      misses.push(`Needs ${requirement.bhk} BHK`);
    }
  }

  return { score, reasons, misses };
}

/* ─────────────── Main Page ─────────────── */
export default function PropertiesPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [editProp, setEditProp] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(EMPTY_PROP);
  const [selectedPropId, setSelectedPropId] = useState(null);
  const [activeTab, setActiveTab] = useState("listings");

  // Image states
  const [addImages, setAddImages] = useState([]);
  const [addImagePreviews, setAddImagePreviews] = useState([]);
  const [editImages, setEditImages] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [editExistingImages, setEditExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: requirements = [] } = useQuery({
    queryKey: ["requirements-full"],
    queryFn: async () => {
      const { data } = await supabase
        .from("requirements")
        .select("*, clients(id, name, phone, whatsapp, email, category)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  /* ── Add ── */
  async function handleAdd(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const fd = new FormData(e.target);
      let imageUrls = [];
      if (addImages.length > 0) {
        imageUrls = await uploadImagesToStorage(addImages, user.id);
      }
      const payload = {
        agent_id: user.id,
        title: String(fd.get("title") || ""),
        property_type: fd.get("property_type"),
        location: String(fd.get("location") || ""),
        price: fd.get("price") ? Number(fd.get("price")) : null,
        land_size_cents: fd.get("land_size_cents") ? Number(fd.get("land_size_cents")) : null,
        bhk: fd.get("bhk") ? Number(fd.get("bhk")) : null,
        owner_name: String(fd.get("owner_name") || ""),
        owner_phone: String(fd.get("owner_phone") || ""),
        description: String(fd.get("description") || ""),
        images: imageUrls,
      };
      const { error } = await supabase.from("properties").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Property added");
      setAddOpen(false);
      setAddImages([]);
      setAddImagePreviews([]);
      e.target.reset();
      qc.invalidateQueries({ queryKey: ["properties"] });
    } catch (err) {
      toast.error(err.message || "Failed to upload images");
    } finally {
      setSaving(false);
    }
  }

  /* ── Edit ── */
  function openEdit(p) {
    setEditProp(p);
    setForm({
      title: p.title || "", property_type: p.property_type || "plot",
      location: p.location || "", price: p.price ?? "",
      land_size_cents: p.land_size_cents ?? "", bhk: p.bhk ?? "",
      owner_name: p.owner_name || "", owner_phone: p.owner_phone || "",
      description: p.description || "",
    });
    setEditImages([]);
    setEditImagePreviews([]);
    setEditExistingImages(p.images || []);
  }

  async function handleEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let newUrls = [];
      if (editImages.length > 0) {
        newUrls = await uploadImagesToStorage(editImages, user.id);
      }
      const allImages = [...editExistingImages, ...newUrls];
      const { error } = await supabase
        .from("properties")
        .update({
          title: form.title, property_type: form.property_type,
          location: form.location, price: form.price ? Number(form.price) : null,
          land_size_cents: form.land_size_cents ? Number(form.land_size_cents) : null,
          bhk: form.bhk ? Number(form.bhk) : null, owner_name: form.owner_name,
          owner_phone: form.owner_phone, description: form.description,
          images: allImages,
        })
        .eq("id", editProp.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Property updated");
      setEditProp(null);
      qc.invalidateQueries({ queryKey: ["properties"] });
    } catch (err) {
      toast.error(err.message || "Failed to upload images");
    } finally {
      setSaving(false);
    }
  }

  /* ── Delete ── */
  async function handleDelete() {
    const { error } = await supabase.from("properties").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Property deleted");
    setDeleteId(null);
    qc.invalidateQueries({ queryKey: ["properties"] });
  }

  const selectedProperty = properties.find((p) => p.id === selectedPropId);

  // Compute matches for selected property
  const matches = selectedProperty
    ? requirements
        .map((req) => ({ req, ...matchScore(selectedProperty, req) }))
        .filter((m) => m.score >= 30)
        .sort((a, b) => b.score - a.score)
    : [];

  function handleSelectProperty(p) {
    setSelectedPropId(p.id);
    setActiveTab("match");
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">{properties.length} listings</p>
        </div>
        <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) { setAddImages([]); setAddImagePreviews([]); } }}>
          <DialogTrigger asChild>
            <Button className="shadow-[var(--shadow-glow)]">
              <Plus className="mr-1.5 h-4 w-4" /> Add property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New property listing</DialogTitle></DialogHeader>
            <PropertyForm
              onSubmit={handleAdd}
              submitLabel="Save listing"
              saving={saving}
              images={addImages}
              imagePreviews={addImagePreviews}
              onImagesChange={(files, previews) => { setAddImages(files); setAddImagePreviews(previews); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-5">
          <TabsTrigger value="listings" className="gap-2">
            <Home className="h-4 w-4" /> Listings
            <Badge variant="secondary" className="ml-1 text-[10px]">{properties.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="match" className="gap-2">
            <Sparkles className="h-4 w-4" /> Match Clients
            {selectedProperty && (
              <Badge variant="secondary" className="ml-1 text-[10px]">{matches.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── Listings tab ─── */}
        <TabsContent value="listings">
          {properties.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
              <Home className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h3 className="mt-3 font-display text-lg font-semibold">No listings yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add a property to match it to client requirements.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  selected={p.id === selectedPropId}
                  onEdit={() => openEdit(p)}
                  onDelete={() => setDeleteId(p.id)}
                  onMatch={() => handleSelectProperty(p)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Match Clients tab ─── */}
        <TabsContent value="match">
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            {/* Left: Property selector */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Select a property
              </div>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {properties.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Add properties first to start matching
                  </div>
                ) : (
                  properties.map((p) => (
                    <PropertyPickerCard
                      key={p.id}
                      property={p}
                      selected={p.id === selectedPropId}
                      onClick={() => setSelectedPropId(p.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right: Matched clients */}
            <div>
              {!selectedProperty ? (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
                  <Sparkles className="mb-3 h-10 w-10 text-muted-foreground/40" />
                  <h3 className="font-display text-lg font-semibold">Select a property</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose a property from the left to see matched clients based on their requirements.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Selected property summary */}
                  <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                        <Home className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{selectedProperty.title}</div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                          <span className="capitalize">{selectedProperty.property_type}</span>
                          {selectedProperty.location && <span>📍 {selectedProperty.location}</span>}
                          {selectedProperty.price && <span>{fmtINR(selectedProperty.price)}</span>}
                          {selectedProperty.bhk && <span>{selectedProperty.bhk} BHK</span>}
                          {selectedProperty.land_size_cents && <span>{selectedProperty.land_size_cents} cents</span>}
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {matches.length} match{matches.length !== 1 ? "es" : ""}
                      </Badge>
                    </div>
                  </div>

                  {/* Matches */}
                  {matches.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                      <XCircle className="mx-auto h-10 w-10 text-muted-foreground/40" />
                      <h3 className="mt-3 font-display text-base font-semibold">No matches found</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        No client requirements match this property's type, budget, or location.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {matches.map(({ req, score, reasons, misses }) => (
                        <MatchCard
                          key={req.id}
                          requirement={req}
                          score={score}
                          reasons={reasons}
                          misses={misses}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      <Dialog open={!!editProp} onOpenChange={(v) => !v && setEditProp(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit property</DialogTitle></DialogHeader>
          <PropertyForm
            form={form}
            onChange={setForm}
            onSubmit={handleEdit}
            submitLabel="Save changes"
            saving={saving}
            images={editImages}
            imagePreviews={editImagePreviews}
            existingImages={editExistingImages}
            onImagesChange={(files, previews) => { setEditImages(files); setEditImagePreviews(previews); }}
            onRemoveExistingImage={(url) => setEditExistingImages((prev) => prev.filter((u) => u !== url))}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete property?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the listing. This action cannot be undone.
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

/* ─────────────── Image Uploader Component ─────────────── */
function ImageUploader({ images, previews, existingImages = [], onImagesChange, onRemoveExisting }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(newFiles) {
    const valid = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) return;
    const combined = [...images, ...valid];
    const newPreviews = [];
    let loaded = 0;
    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        loaded++;
        if (loaded === valid.length) {
          onImagesChange(combined, [...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function removeNew(idx) {
    const newFiles = images.filter((_, i) => i !== idx);
    const newPreviews = previews.filter((_, i) => i !== idx);
    onImagesChange(newFiles, newPreviews);
  }

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, previews]);

  const totalImages = existingImages.length + previews.length;

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium">
        Place Images <span className="text-muted-foreground font-normal">(optional)</span>
      </label>

      {/* Existing images (edit mode) */}
      {existingImages.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {existingImages.map((url) => (
            <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Property" className="h-full w-full object-cover" />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 py-0.5 text-center text-[9px] text-white">Saved</div>
            </div>
          ))}
        </div>
      )}

      {/* New image previews */}
      {previews.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeNew(i)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
              >
                <X className="h-4 w-4 text-white" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-primary/60 py-0.5 text-center text-[9px] text-white">New</div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 transition
          ${dragging ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"}`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <ImagePlus className="h-5 w-5 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-xs font-medium">{dragging ? "Drop images here" : "Click or drag images"}</p>
          <p className="text-[11px] text-muted-foreground">
            JPG, PNG, WebP · up to 10 MB each{totalImages > 0 ? ` · ${totalImages} added` : ""}
          </p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only"
          onChange={(e) => handleFiles(e.target.files)} />
      </div>
    </div>
  );
}

/* ─────────────── Property Card (Listings tab) ─────────────── */
function PropertyCard({ property: p, selected, onEdit, onDelete, onMatch }) {
  const gradient = TYPE_COLORS[p.property_type] || "from-muted to-muted/30";
  const hasImages = p.images && p.images.length > 0;
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <div className={`group overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]
      ${selected ? "border-primary ring-1 ring-primary/30" : "border-border"}`}>
      {/* Banner / Images */}
      {hasImages ? (
        <div className="relative h-36 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.images[imgIdx]}
            alt={p.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            {p.status || "available"}
          </span>
          {p.images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5">
              <button type="button"
                onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i - 1 + p.images.length) % p.images.length); }}
                className="rounded-full bg-black/50 p-0.5 text-white backdrop-blur hover:bg-black/70">
                <ChevronLeft className="h-3 w-3" />
              </button>
              <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur">{imgIdx + 1}/{p.images.length}</span>
              <button type="button"
                onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i + 1) % p.images.length); }}
                className="rounded-full bg-black/50 p-0.5 text-white backdrop-blur hover:bg-black/70">
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`relative flex items-end bg-gradient-to-br ${gradient} px-4 pb-3 pt-8`}>
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-card/90 backdrop-blur shadow-sm">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <span className="ml-auto rounded-full bg-card/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
            {p.status || "available"}
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.property_type}</div>
        <h3 className="mt-0.5 font-display text-base font-semibold leading-snug">{p.title}</h3>

        {p.location && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" /> {p.location}
          </div>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Chip label="Price" value={fmtINR(p.price)} icon={IndianRupee} highlight />
          {p.land_size_cents && <Chip label="Size" value={`${p.land_size_cents}¢`} icon={Maximize2} />}
          {p.bhk && <Chip label="BHK" value={p.bhk} icon={BedDouble} />}
        </div>

        {(p.owner_name || p.owner_phone) && (
          <a href={p.owner_phone ? `tel:${p.owner_phone}` : undefined}
            className="mt-3 flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-2 text-xs transition hover:bg-muted">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{p.owner_name || "Owner"}</span>
            {p.owner_phone && <><span className="text-muted-foreground">·</span><Phone className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">{p.owner_phone}</span></>}
          </a>
        )}

        {p.description && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs text-primary hover:text-primary" onClick={onMatch}>
            <Sparkles className="h-3 w-3" /> Match clients
          </Button>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Property Picker Card (Match tab left panel) ─────────────── */
function PropertyPickerCard({ property: p, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition hover:border-primary/40 hover:bg-accent
        ${selected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card"}`}
    >
      <div className="flex items-center gap-3">
        {p.images && p.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.images[0]} alt={p.title} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-bold
            ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            <Home className="h-4 w-4" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm font-medium">{p.title}</div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            <span className="capitalize">{p.property_type}</span>
            {p.price && <><span>·</span><span>{fmtINR(p.price)}</span></>}
          </div>
        </div>
        <ChevronRight className={`h-4 w-4 shrink-0 transition ${selected ? "text-primary" : "text-muted-foreground/40"}`} />
      </div>
      {p.location && (
        <div className="mt-1.5 flex items-center gap-1 pl-12 text-[11px] text-muted-foreground">
          <MapPin className="h-2.5 w-2.5" /> {p.location}
        </div>
      )}
    </button>
  );
}

/* ─────────────── Match Card (client requirement match) ─────────────── */
function MatchCard({ requirement: r, score, reasons, misses }) {
  const client = r.clients;
  const pct = Math.min(100, score);
  const grade = pct >= 80 ? "excellent" : pct >= 60 ? "good" : "partial";
  const gradeStyles = {
    excellent: { bar: "bg-emerald-500", badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", label: "Excellent match" },
    good: { bar: "bg-primary", badge: "bg-primary/15 text-primary", label: "Good match" },
    partial: { bar: "bg-amber-500", badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400", label: "Partial match" },
  };
  const g = gradeStyles[grade];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-[var(--shadow-soft)]">
      {/* Match score bar */}
      <div className="h-1 bg-muted">
        <div className={`h-full transition-all ${g.bar}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Client avatar */}
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {client?.name?.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase() || "?"}
          </div>

          {/* Client info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{client?.name || "Unknown"}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${g.badge}`}>
                {g.label}
              </span>
              <span className="ml-auto text-xs font-bold text-muted-foreground">{pct}%</span>
            </div>
            <div className="mt-0.5 text-xs capitalize text-muted-foreground">{client?.category}</div>

            {/* Requirement summary */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <ReqChip label={r.property_type} />
              {r.location && <ReqChip icon={MapPin} label={r.location} />}
              {(r.budget_min || r.budget_max) && (
                <ReqChip icon={IndianRupee}
                  label={`${r.budget_min ? fmtINR(r.budget_min) : "—"} – ${r.budget_max ? fmtINR(r.budget_max) : "—"}`}
                />
              )}
              {r.land_size_cents && <ReqChip icon={Maximize2} label={`${r.land_size_cents} cents`} />}
              {r.bhk && <ReqChip icon={BedDouble} label={`${r.bhk} BHK`} />}
            </div>

            {/* Match reasons / misses */}
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
              {reasons.map((r, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3 shrink-0" /> {r}
                </div>
              ))}
              {misses.map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <AlertCircle className="h-3 w-3 shrink-0 text-amber-500" /> {m}
                </div>
              ))}
            </div>

            {r.notes && (
              <p className="mt-2 text-xs text-muted-foreground italic">"{r.notes}"</p>
            )}
          </div>
        </div>

        {/* Contact buttons */}
        {client && (client.phone || client.whatsapp || client.email) && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
            {client.phone && (
              <a href={`tel:${client.phone}`}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-accent">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {client.phone}
              </a>
            )}
            {client.whatsapp && (
              <a href={`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/20">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-accent">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {client.email}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReqChip({ icon: Icon, label }) {
  return (
    <span className="flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] capitalize text-muted-foreground">
      {Icon && <Icon className="h-2.5 w-2.5" />} {label}
    </span>
  );
}

/* ─────────────── Chip (stat display) ─────────────── */
function Chip({ label, value, icon: Icon, highlight }) {
  if (!value || value === "—") return null;
  return (
    <div className={`flex flex-col gap-0.5 rounded-lg px-2.5 py-2 ${highlight ? "bg-primary/10" : "bg-muted/60"}`}>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div className={`flex items-center gap-1 text-xs font-semibold ${highlight ? "text-primary" : ""}`}>
        {Icon && <Icon className="h-3 w-3" />} <span>{value}</span>
      </div>
    </div>
  );
}

/* ─────────────── Property Form ─────────────── */
function PropertyForm({
  form, onChange, onSubmit, submitLabel, saving = false,
  images = [], imagePreviews = [], existingImages = [],
  onImagesChange, onRemoveExistingImage,
}) {
  const controlled = !!onChange;

  function fi(name, label, props = {}) {
    const cp = controlled
      ? { value: form?.[name] ?? "", onChange: (e) => onChange((p) => ({ ...p, [name]: e.target.value })) }
      : {};
    return (
      <div>
        <Label className="mb-1 block text-xs font-medium">{label}</Label>
        <Input name={name} {...cp} {...props} />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {fi("title", "Title *", { required: true, placeholder: "10 cent plot in Kakkanad" })}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1 block text-xs font-medium">Type</Label>
          {controlled ? (
            <Select value={form?.property_type} onValueChange={(v) => onChange((p) => ({ ...p, property_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
            </Select>
          ) : (
            <Select name="property_type" defaultValue="plot">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        {fi("location", "Location", { placeholder: "Kakkanad, Kochi" })}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {fi("price", "Price (₹)", { type: "number", placeholder: "4500000" })}
        {fi("land_size_cents", "Land (cents)", { type: "number", step: "0.01" })}
        {fi("bhk", "BHK", { type: "number" })}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {fi("owner_name", "Owner name")}
        {fi("owner_phone", "Owner phone")}
      </div>
      <div>
        <Label className="mb-1 block text-xs font-medium">Description</Label>
        {controlled ? (
          <Textarea rows={2} value={form?.description ?? ""}
            onChange={(e) => onChange((p) => ({ ...p, description: e.target.value }))} />
        ) : (
          <Textarea name="description" rows={2} />
        )}
      </div>

      {/* Image uploader — optional */}
      {onImagesChange && (
        <ImageUploader
          images={images}
          previews={imagePreviews}
          existingImages={existingImages}
          onImagesChange={onImagesChange}
          onRemoveExisting={onRemoveExistingImage}
        />
      )}

      <DialogFooter>
        <Button type="submit" disabled={saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Uploading…" : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
