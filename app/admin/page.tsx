import AdminPanel from '@/components/AdminPanel';
import { useAuth } from '@/components/AuthProvider';

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Please log in to access the admin panel</h1>
        <a href="/login" style={{ color: '#4A154B', fontWeight: 'bold', textDecoration: 'underline' }}>
          Login with Slack
        </a>
      </div>
    );
  }

  return <AdminPanel />;
}
