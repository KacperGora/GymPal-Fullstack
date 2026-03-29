'use client';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';
import Link from 'next/link';

import { useAdminStats } from '@/features/admin/queries';

const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
}) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {icon}
      <Box>
        <Typography variant="h4">{value ?? '—'}</Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboardPage = () => {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5">Panel admina</Typography>
        <Link href="/admin/users" style={{ textDecoration: 'none' }}>
          <Typography variant="body2" color="primary">
            Zarządzaj użytkownikami →
          </Typography>
        </Link>
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={100}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          <StatCard
            label="Wszyscy użytkownicy"
            value={stats?.total}
            icon={<GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
          />
          <StatCard
            label="Klienci"
            value={stats?.byRole.CLIENT}
            icon={<PersonIcon sx={{ fontSize: 40, color: 'success.main' }} />}
          />
          <StatCard
            label="Trenerzy"
            value={stats?.byRole.TRAINER}
            icon={
              <FitnessCenterIcon sx={{ fontSize: 40, color: 'warning.main' }} />
            }
          />
          <StatCard
            label="Aktywne relacje trener-klient"
            value={stats?.activeTrainerClientRelations}
            icon={
              <AdminPanelSettingsIcon
                sx={{ fontSize: 40, color: 'info.main' }}
              />
            }
          />
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboardPage;
