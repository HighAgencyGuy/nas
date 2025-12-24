import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  author: string | null;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero text-white py-24 pt-32">
        <div className="section-container">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
            Our Blog
          </h1>
          <p className="text-xl text-white/80 max-w-2xl animate-fade-in-up delay-100">
            Insights, tips, and news from the automotive world.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="section-container">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No blog posts available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.cover_image || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.created_at), "MMM d, yyyy")}
                      </div>
                      {post.author && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {post.author}
                        </div>
                      )}
                    </div>
                    <h2 className="font-display text-xl font-bold mb-3 group-hover:text-accent transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {post.content.substring(0, 150)}...
                    </p>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-accent font-medium hover:gap-3 transition-all"
                    >
                      Read More
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
