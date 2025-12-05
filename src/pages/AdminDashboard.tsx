import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { urlApi, userApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Link2, Users, MousePointerClick, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface UrlData {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
}

interface UserData {
  _id: string;
  username: string;
  createdAt: string;
}

// Hàm tạo dữ liệu giả tổng hợp
const generateAggregatedFakeData = (urls: UrlData[]) => {
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const days = 7;
  const clicksPerDay = [];
  let remaining = totalClicks;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayClicks = i === 0 ? remaining : Math.floor(Math.random() * (remaining / (i + 1)) * 1.5);
    remaining -= dayClicks;
    clicksPerDay.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: Math.max(0, dayClicks),
    });
  }
  return { clicksPerDay };
};

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: urls = [], isLoading: isLoadingUrls } = useQuery<UrlData[]>({
    queryKey: ['adminAllUrls'],
    queryFn: async () => (await urlApi.getAll()).data,
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<UserData[]>({
    queryKey: ['adminAllUsers'],
    queryFn: async () => (await userApi.getAll()).data,
  });

  const isLoading = isLoadingUrls || isLoadingUsers;

  const { totalClicks, recentUsers, recentUrls, aggregatedAnalytics } = useMemo(() => {
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    const recentUsers = users.slice(0, 5);
    const recentUrls = urls.slice(0, 5);
    const aggregatedAnalytics = generateAggregatedFakeData(urls);
    return { totalClicks, recentUsers, recentUrls, aggregatedAnalytics };
  }, [urls, users]);

  const stats = useMemo(() => [
    { 
      label: 'Total Users', 
      value: users.length, 
      icon: Users, 
      color: 'bg-purple/20 text-purple',
      trend: '+12%'
    },
    { 
      label: 'Total Clicks', 
      value: totalClicks, 
      icon: MousePointerClick, 
      color: 'bg-teal/20 text-teal',
      trend: '+23%'
    },
    { 
      label: 'Total Links', 
      value: urls.length, 
      icon: Link2, 
      color: 'bg-primary/20 text-primary',
      trend: '+8%'
    },
    { 
      label: 'Avg. Clicks/Link', 
      value: urls.length ? Math.round(totalClicks / urls.length) : 0, 
      icon: TrendingUp, 
      color: 'bg-accent/20 text-accent',
      trend: '+5%'
    },
  ], [users.length, urls.length, totalClicks]);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.username}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl border border-border p-6 card-hover"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                    {stat.trend}
                  </span>
                </div>
                <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Aggregated Clicks Chart */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Total Clicks Over Time</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aggregatedAnalytics?.clicksPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : recentUsers.length === 0 ? (
                <p className="text-muted-foreground">No users yet</p>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple/20 flex items-center justify-center text-purple font-semibold">
                          {u.username[0].toUpperCase()}
                        </div>
                        <span className="font-medium">{u.username}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Links */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Links</h2>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : recentUrls.length === 0 ? (
                <p className="text-muted-foreground">No links yet</p>
              ) : (
                <div className="space-y-3">
                  {recentUrls.map((url) => (
                    <div
                      key={url._id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-medium text-primary truncate">
                          /{url.shortCode}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {url.originalUrl}
                        </p>
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap">
                        {url.clicks} clicks
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
