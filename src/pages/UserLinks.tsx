import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { UrlCard } from '@/components/UrlCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { urlApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, Link2 } from 'lucide-react';

interface UrlData {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
}

export default function UserLinks() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: urls = [], isLoading } = useQuery<UrlData[]>({
    queryKey: ['userUrls'],
    queryFn: async () => (await urlApi.getAll()).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => urlApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userUrls'] });
      toast.success('Link deleted');
    },
    onError: () => {
      toast.error('Failed to delete link');
    },
  });

  const filteredUrls = useMemo(() => {
    if (!search.trim()) return urls;
    const lowercasedSearch = search.toLowerCase();
    return urls.filter(
      (url) =>
        (url.originalUrl && url.originalUrl.toLowerCase().includes(lowercasedSearch)) ||
        (url.shortCode && url.shortCode.toLowerCase().includes(lowercasedSearch))
    );
  }, [search, urls]);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold">My Links</h1>
              <p className="text-muted-foreground">Manage all your shortened links</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search links..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading...
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search ? 'No links found matching your search' : 'No links yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUrls.map((url) => (
                <UrlCard
                  key={url._id}
                  id={url._id}
                  originalUrl={url.originalUrl}
                  shortCode={url.shortCode}
                  clicks={url.clicks}
                  createdAt={url.createdAt}
                  onDelete={deleteMutation.mutate}
                  onViewAnalytics={(code) => navigate(`/analytics/${code}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
