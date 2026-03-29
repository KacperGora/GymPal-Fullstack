'use client';

import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  MenuItem,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import type { AdminUser } from '@/features/admin/api/admin.api';
import { useUpdateUserRole } from '@/features/admin/mutations/useUpdateUserRole';
import { useAdminUsers } from '@/features/admin/queries';

const ROLE_COLORS: Record<
  AdminUser['role'],
  'default' | 'primary' | 'success'
> = {
  ADMIN: 'primary',
  TRAINER: 'success',
  CLIENT: 'default',
};

const AdminUsersPage = () => {
  const { data: users, isLoading } = useAdminUsers();
  const { mutate: updateRole, isPending } = useUpdateUserRole();

  const [dialog, setDialog] = useState<{
    user: AdminUser;
    role: AdminUser['role'];
  } | null>(null);

  const openDialog = (user: AdminUser) => setDialog({ user, role: user.role });
  const closeDialog = () => setDialog(null);

  const handleConfirm = () => {
    if (!dialog) return;
    updateRole(
      { id: dialog.user.id, role: dialog.role },
      { onSuccess: closeDialog },
    );
  };

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Użytkownicy
      </Typography>

      {isLoading ? (
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Imię i nazwisko</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rola</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={ROLE_COLORS[user.role]}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openDialog(user)}>
                    Zmień rolę
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!dialog} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Zmień rolę użytkownika</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            {dialog?.user.email}
          </Typography>
          <Select
            fullWidth
            value={dialog?.role ?? ''}
            onChange={(e) =>
              setDialog(
                (d) => d && { ...d, role: e.target.value as AdminUser['role'] },
              )
            }
            sx={{ mt: 1 }}
          >
            <MenuItem value="CLIENT">CLIENT</MenuItem>
            <MenuItem value="TRAINER">TRAINER</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Anuluj</Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={isPending || dialog?.role === dialog?.user.role}
          >
            {isPending ? <CircularProgress size={20} /> : 'Zapisz'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsersPage;
