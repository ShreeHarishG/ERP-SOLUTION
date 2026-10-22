'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, ApiUser } from '@/services/users.api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Search, Edit2, ShieldAlert, CheckCircle2, XCircle, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import UserModal from '@/components/forms/UserModal';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersApi.list({ page, limit: 10, search }),
  });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: usersApi.toggleStatus,
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  });

  const handleOpenModal = (user?: ApiUser) => {
    setEditingUser(user || null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    if (editingUser) {
      await updateMutation.mutateAsync({ id: editingUser.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleToggleStatus = (id: string) => {
    if (window.confirm('Are you sure you want to change this user\'s status?')) {
      toggleStatusMutation.mutate(id);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this user?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system access and roles</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      <div className="glass-card flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 py-2 h-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-brand" size={32} />
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-rose-400">Failed to load users</div>
          ) : data?.users.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No users found</div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-input flex items-center justify-center font-medium text-slate-300">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        user.role === 'admin' ? 'badge-purple' : 
                        user.role === 'sales' ? 'badge-blue' : 
                        user.role === 'purchase' ? 'badge-amber' : 
                        user.role === 'inventory' ? 'badge-gray' : 'badge-green'
                      }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {user.isActive ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                          <CheckCircle2 size={16} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                          <XCircle size={16} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="text-slate-400">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-1.5 text-slate-400 hover:text-brand hover:bg-brand/10 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        {currentUser?.id !== user.id && (
                          <>
                            <button 
                              onClick={() => handleToggleStatus(user.id)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded transition-colors"
                              title={user.isActive ? "Deactivate" : "Activate"}
                            >
                              <ShieldAlert size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(user.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination placeholder if needed */}
      </div>

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        user={editingUser}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
