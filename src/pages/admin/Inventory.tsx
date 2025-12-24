import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Car = Database["public"]["Tables"]["cars"]["Row"];

const defaultCar: Partial<Car> = {
  make: "",
  model: "",
  year: new Date().getFullYear(),
  price: 0,
  mileage: 0,
  transmission: "automatic",
  fuel_type: "petrol",
  condition: "foreign_used",
  body_type: "sedan",
  status: "available",
  is_featured: false,
  is_new_arrival: true,
  is_top_deal: false,
};

export default function AdminInventory() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Partial<Car> | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setEditingCar(defaultCar);
      setIsDialogOpen(true);
      setSearchParams({});
    }
  }, [searchParams]);

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleSave = async () => {
    if (!editingCar) return;
    setSaving(true);

    try {
      if (editingCar.id) {
        const { error } = await supabase
          .from("cars")
          .update(editingCar as Car)
          .eq("id", editingCar.id);
        if (error) throw error;
        toast({ title: "Car updated successfully" });
      } else {
        const { error } = await supabase
          .from("cars")
          .insert(editingCar as Car);
        if (error) throw error;
        toast({ title: "Car added successfully" });
      }

      setIsDialogOpen(false);
      setEditingCar(null);
      fetchCars();
    } catch (error: any) {
      console.error("Error saving car:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save car",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this car?")) return;

    try {
      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Car deleted successfully" });
      fetchCars();
    } catch (error) {
      console.error("Error deleting car:", error);
      toast({
        title: "Error",
        description: "Failed to delete car",
        variant: "destructive",
      });
    }
  };

  const filteredCars = cars.filter(car =>
    `${car.make} ${car.model} ${car.year}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Inventory</h1>
            <p className="text-muted-foreground mt-1">Manage your vehicle listings</p>
          </div>
          <Button
            variant="gold"
            onClick={() => {
              setEditingCar(defaultCar);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Car
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Cars Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Vehicle</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading inventory...
                  </TableCell>
                </TableRow>
              ) : filteredCars.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No cars found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {car.main_image && (
                          <img
                            src={car.main_image}
                            alt={`${car.make} ${car.model}`}
                            className="w-16 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">
                            {car.year} {car.make} {car.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {car.stock_id || "-"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{formatPrice(Number(car.price))}</p>
                      {car.discount_price && (
                        <p className="text-sm text-muted-foreground line-through">
                          {formatPrice(Number(car.discount_price))}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          car.status === "available"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : car.status === "sold"
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        }
                      >
                        {car.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {car.is_featured && (
                          <Badge variant="secondary" className="text-xs">Featured</Badge>
                        )}
                        {car.is_new_arrival && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                        {car.is_top_deal && (
                          <Badge variant="secondary" className="text-xs">Deal</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCar(car);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(car.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCar?.id ? "Edit Car" : "Add New Car"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>Make</Label>
              <Input
                value={editingCar?.make || ""}
                onChange={(e) => setEditingCar({ ...editingCar, make: e.target.value })}
                placeholder="Toyota"
              />
            </div>
            <div>
              <Label>Model</Label>
              <Input
                value={editingCar?.model || ""}
                onChange={(e) => setEditingCar({ ...editingCar, model: e.target.value })}
                placeholder="Camry"
              />
            </div>
            <div>
              <Label>Year</Label>
              <Input
                type="number"
                value={editingCar?.year || ""}
                onChange={(e) => setEditingCar({ ...editingCar, year: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Price (₦)</Label>
              <Input
                type="number"
                value={editingCar?.price || ""}
                onChange={(e) => setEditingCar({ ...editingCar, price: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>Mileage (km)</Label>
              <Input
                type="number"
                value={editingCar?.mileage || ""}
                onChange={(e) => setEditingCar({ ...editingCar, mileage: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Transmission</Label>
              <Select
                value={editingCar?.transmission || "automatic"}
                onValueChange={(value) => setEditingCar({ ...editingCar, transmission: value as Car["transmission"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fuel Type</Label>
              <Select
                value={editingCar?.fuel_type || "petrol"}
                onValueChange={(value) => setEditingCar({ ...editingCar, fuel_type: value as Car["fuel_type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Condition</Label>
              <Select
                value={editingCar?.condition || "foreign_used"}
                onValueChange={(value) => setEditingCar({ ...editingCar, condition: value as Car["condition"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brand_new">Brand New</SelectItem>
                  <SelectItem value="foreign_used">Foreign Used</SelectItem>
                  <SelectItem value="local_used">Local Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Body Type</Label>
              <Select
                value={editingCar?.body_type || "sedan"}
                onValueChange={(value) => setEditingCar({ ...editingCar, body_type: value as Car["body_type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="coupe">Coupe</SelectItem>
                  <SelectItem value="hatchback">Hatchback</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="wagon">Wagon</SelectItem>
                  <SelectItem value="convertible">Convertible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={editingCar?.status || "available"}
                onValueChange={(value) => setEditingCar({ ...editingCar, status: value as Car["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Exterior Color</Label>
              <Input
                value={editingCar?.exterior_color || ""}
                onChange={(e) => setEditingCar({ ...editingCar, exterior_color: e.target.value })}
                placeholder="Black"
              />
            </div>
            <div>
              <Label>Interior Color</Label>
              <Input
                value={editingCar?.interior_color || ""}
                onChange={(e) => setEditingCar({ ...editingCar, interior_color: e.target.value })}
                placeholder="Beige"
              />
            </div>
            <div className="col-span-2">
              <Label>Main Image URL</Label>
              <Input
                value={editingCar?.main_image || ""}
                onChange={(e) => setEditingCar({ ...editingCar, main_image: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={editingCar?.description || ""}
                onChange={(e) => setEditingCar({ ...editingCar, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="col-span-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingCar?.is_featured || false}
                  onChange={(e) => setEditingCar({ ...editingCar, is_featured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingCar?.is_new_arrival || false}
                  onChange={(e) => setEditingCar({ ...editingCar, is_new_arrival: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">New Arrival</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingCar?.is_top_deal || false}
                  onChange={(e) => setEditingCar({ ...editingCar, is_top_deal: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Top Deal</span>
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
