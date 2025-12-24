import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Car, Users, MessageSquare, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface Stats {
  totalCars: number;
  availableCars: number;
  totalLeads: number;
  newLeads: number;
  totalValue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalCars: 0,
    availableCars: 0,
    totalLeads: 0,
    newLeads: 0,
    totalValue: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch cars stats
        const { data: cars } = await supabase.from("cars").select("id, status, price");
        const totalCars = cars?.length || 0;
        const availableCars = cars?.filter(c => c.status === "available").length || 0;
        const totalValue = cars?.reduce((sum, c) => sum + (Number(c.price) || 0), 0) || 0;

        // Fetch leads stats
        const { data: leads } = await supabase.from("leads").select("id, status");
        const totalLeads = leads?.length || 0;
        const newLeads = leads?.filter(l => l.status === "new").length || 0;

        setStats({ totalCars, availableCars, totalLeads, newLeads, totalValue });

        // Fetch recent leads
        const { data: recent } = await supabase
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);
        setRecentLeads(recent || []);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Inventory",
      value: stats.totalCars,
      subtitle: `${stats.availableCars} available`,
      icon: Car,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Leads",
      value: stats.totalLeads,
      subtitle: `${stats.newLeads} new`,
      icon: MessageSquare,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Inventory Value",
      value: `₦${(stats.totalValue / 1000000).toFixed(1)}M`,
      subtitle: "Total stock value",
      icon: DollarSign,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      title: "New This Week",
      value: stats.newLeads,
      subtitle: "Lead inquiries",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to Nas Autos admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions & Recent Leads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Link
                to="/admin/inventory?action=add"
                className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gold/10">
                  <Car className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="font-medium text-sm">Add New Car</p>
                  <p className="text-xs text-muted-foreground">List a vehicle</p>
                </div>
              </Link>
              <Link
                to="/admin/leads"
                className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="p-2 rounded-lg bg-green-500/10">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">View Leads</p>
                  <p className="text-xs text-muted-foreground">{stats.newLeads} pending</p>
                </div>
              </Link>
              <Link
                to="/admin/blog?action=add"
                className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">New Blog Post</p>
                  <p className="text-xs text-muted-foreground">Create content</p>
                </div>
              </Link>
              <Link
                to="/admin/settings"
                className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Site Settings</p>
                  <p className="text-xs text-muted-foreground">Update info</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Leads</CardTitle>
              <Link to="/admin/leads" className="text-sm text-gold hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No leads yet
                </p>
              ) : (
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.email}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            lead.status === "new"
                              ? "bg-green-500/10 text-green-500"
                              : lead.status === "contacted"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
