import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Star, Trash2, Check, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast({
        title: "Error",
        description: "Failed to fetch testimonials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSave = async () => {
    if (!editingTestimonial) return;
    setSaving(true);

    try {
      if (editingTestimonial.id) {
        const { error } = await supabase
          .from("testimonials")
          .update(editingTestimonial as Testimonial)
          .eq("id", editingTestimonial.id);
        if (error) throw error;
        toast({ title: "Testimonial updated" });
      } else {
        const { error } = await supabase
          .from("testimonials")
          .insert(editingTestimonial as Testimonial);
        if (error) throw error;
        toast({ title: "Testimonial added" });
      }

      setIsDialogOpen(false);
      setEditingTestimonial(null);
      fetchTestimonials();
    } catch (error: any) {
      console.error("Error saving testimonial:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save testimonial",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_approved: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setTestimonials(testimonials.map(t =>
        t.id === id ? { ...t, is_approved: !currentStatus } : t
      ));

      toast({
        title: !currentStatus ? "Testimonial approved" : "Testimonial hidden",
      });
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast({
        title: "Error",
        description: "Failed to update testimonial",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Testimonial deleted" });
      fetchTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Testimonials</h1>
            <p className="text-muted-foreground mt-1">Manage customer reviews</p>
          </div>
          <Button
            variant="gold"
            onClick={() => {
              setEditingTestimonial({
                name: "",
                content: "",
                rating: 5,
                is_approved: false,
              });
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="text-center py-8">Loading testimonials...</div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No testimonials yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                        <span className="font-semibold text-gold">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        {testimonial.location && (
                          <p className="text-sm text-muted-foreground">
                            {testimonial.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={testimonial.is_approved ? "default" : "secondary"}
                      className={testimonial.is_approved ? "bg-green-500/10 text-green-500" : ""}
                    >
                      {testimonial.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? "fill-gold text-gold"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                    "{testimonial.content}"
                  </p>

                  {testimonial.car_purchased && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Purchased: {testimonial.car_purchased}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleApproval(testimonial.id, testimonial.is_approved || false)}
                      className={testimonial.is_approved ? "text-yellow-500" : "text-green-500"}
                    >
                      {testimonial.is_approved ? (
                        <>
                          <X className="h-4 w-4 mr-1" /> Hide
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTestimonial(testimonial);
                        setIsDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(testimonial.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial?.id ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Customer Name</Label>
              <Input
                value={editingTestimonial?.name || ""}
                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={editingTestimonial?.location || ""}
                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, location: e.target.value })}
                placeholder="Abuja, Nigeria"
              />
            </div>
            <div>
              <Label>Rating</Label>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setEditingTestimonial({ ...editingTestimonial, rating })}
                    className="p-1"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        rating <= (editingTestimonial?.rating || 0)
                          ? "fill-gold text-gold"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Review Content</Label>
              <Textarea
                value={editingTestimonial?.content || ""}
                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: e.target.value })}
                rows={4}
                placeholder="Customer's review..."
              />
            </div>
            <div>
              <Label>Car Purchased (optional)</Label>
              <Input
                value={editingTestimonial?.car_purchased || ""}
                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, car_purchased: e.target.value })}
                placeholder="2022 Toyota Camry"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingTestimonial?.is_approved || false}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, is_approved: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Approved (visible on website)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
