import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

export default function AdminSettings() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    try {
      if (settings.id) {
        const { error } = await supabase
          .from("site_settings")
          .update(settings)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert(settings as SiteSettings);
        if (error) throw error;
      }

      toast({ title: "Settings saved successfully" });
      fetchSettings();
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your site configuration</p>
          </div>
          <Button variant="gold" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Hero Section */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Headline</Label>
              <Input
                value={settings.hero_headline || ""}
                onChange={(e) => setSettings({ ...settings, hero_headline: e.target.value })}
                placeholder="Your Trusted Auto Partner in Abuja"
              />
            </div>
            <div>
              <Label>Subtext</Label>
              <Input
                value={settings.hero_subtext || ""}
                onChange={(e) => setSettings({ ...settings, hero_subtext: e.target.value })}
                placeholder="Premium new and pre-owned vehicles..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Phone Number</Label>
              <Input
                value={settings.phone || ""}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+234 000 000 0000"
              />
            </div>
            <div>
              <Label>WhatsApp Number</Label>
              <Input
                value={settings.whatsapp || ""}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                placeholder="+234 000 000 0000"
              />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input
                value={settings.email || ""}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="info@nasautos.com"
              />
            </div>
            <div>
              <Label>Business Hours</Label>
              <Input
                value={settings.business_hours || ""}
                onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
                placeholder="Mon - Sat: 9:00 AM - 6:00 PM"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Input
                value={settings.address || ""}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Karu, Abuja, Nigeria"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Social Media</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Facebook URL</Label>
              <Input
                value={settings.facebook || ""}
                onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                placeholder="https://facebook.com/nasautos"
              />
            </div>
            <div>
              <Label>Instagram URL</Label>
              <Input
                value={settings.instagram || ""}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                placeholder="https://instagram.com/nasautos"
              />
            </div>
            <div>
              <Label>Twitter URL</Label>
              <Input
                value={settings.twitter || ""}
                onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                placeholder="https://twitter.com/nasautos"
              />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input
                value={settings.logo || ""}
                onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
