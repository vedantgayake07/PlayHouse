import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { UserAvatar } from '../../components/common/UserAvatar.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { formatDate } from '../../utils/formatters.js';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  X
} from 'lucide-react';

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'all') params.role = roleFilter;

      const res = await api.admin.getUsers(params);
      if (res.success && res.data) {
        setUsers(res.data.users || []);
        setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (user) => {
    if (user.id === currentUser?.id) {
      toast.error('You cannot change your own admin role.');
      return;
    }

    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await api.admin.updateUserRole(user.id, newRole);
      if (res.success) {
        toast.success(`Role for ${user.name} changed to ${newRole}.`);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.admin.deleteUser(deleteTarget.id);
      if (res.success) {
        toast.success(`User ${deleteTarget.name} and their media deleted.`);
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)' }}>
              <Users size={22} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Manage User Accounts
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Promote administrators, manage access privileges, and inspect member profiles.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          padding: '14px',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          style={{
            padding: '9px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '13px'
          }}
        >
          <option value="all">All Roles</option>
          <option value="ADMIN">Administrators</option>
          <option value="USER">Standard Users</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1fr 1fr 1.5fr 1fr',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase'
          }}
        >
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Uploads</span>
          <span>Joined</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        <div>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found matching query.</div>
          ) : (
            users.map((u) => {
              const isSelf = u.id === currentUser?.id;
              return (
                <div
                  key={u.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 1fr 1fr 1.5fr 1fr',
                    alignItems: 'center',
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <UserAvatar user={u} size={32} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {u.name} {isSelf && '(You)'}
                    </span>
                  </div>

                  <div style={{ color: 'var(--text-secondary)' }} className="line-clamp-1">
                    {u.email}
                  </div>

                  <div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: u.role === 'ADMIN' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                        color: u.role === 'ADMIN' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                      }}
                    >
                      {u.role}
                    </span>
                  </div>

                  <div style={{ color: 'var(--text-secondary)' }}>
                    {u.uploadCount || 0} files
                  </div>

                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {formatDate(u.createdAt)}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    {!isSelf && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRoleToggle(u)}
                          title={u.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: 'var(--bg-tertiary)',
                            color: u.role === 'ADMIN' ? '#f59e0b' : 'var(--accent-primary)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {u.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(u)}
                          title="Delete user"
                          style={{
                            padding: '6px',
                            borderRadius: '4px',
                            color: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteUser}
          title="Delete User Account"
          message={`Are you sure you want to delete ${deleteTarget.name} (${deleteTarget.email})? All their uploaded media, favorites, and playlists will be permanently deleted.`}
          confirmText="Delete Account"
        />
      )}
    </div>
  );
};
