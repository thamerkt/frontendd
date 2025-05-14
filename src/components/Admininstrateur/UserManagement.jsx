import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Profileservice from '../../services/profileService';
import { 
  Search, Mail, Phone, Shield, Ban, 
  CheckCircle, Trash2, UserCheck, UserX,
  Users, UserPlus, UserMinus, UserCog, 
  ArrowUp, ArrowDown
} from 'lucide-react';
import authStore from '../../redux/authStore';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0d9488', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

const REQUIRED_USER_REPORTS = [
  {
    type: "users_overview",
    title: "Users Overview Report",
    description: "Summary of user metrics",
    is_scheduled: true,
    schedule_frequency: "monthly",
    metrics: [
      { metric_name: "Total Users", metric_value: 0, unit: "" },
      { metric_name: "Active Users", metric_value: 0, unit: "" },
      { metric_name: "Suspended Users", metric_value: 0, unit: "" },
      { metric_name: "Verified Users", metric_value: 0, unit: "" }
    ]
  }
];

const INITIAL_ACTIVITY_DATA = [
  { name: 'Jan', active: 0, new: 0 },
  { name: 'Feb', active: 0, new: 0 },
  { name: 'Mar', active: 0, new: 0 },
  { name: 'Apr', active: 0, new: 0 },
  { name: 'May', active: 0, new: 0 },
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [tableUsers, setTableUsers] = useState([]); // For table only
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    verifiedUsers: 0
  });
  const [userReports, setUserReports] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [activityData, setActivityData] = useState(INITIAL_ACTIVITY_DATA);
  const [isSidebarExpanded] = useState(true);

  // Memoize normalization for performance
  const normalizeUsers = useCallback((usersData) => {
    return usersData.map(user => {
      // If user comes from authStore.getusers(), adapt fields
      // Example: { email, keycloak_id, is_verified, is_suspended, account_type, date_joined }
      if (
        user &&
        typeof user === 'object' &&
        user.email &&
        user.account_type &&
        user.date_joined
      ) {
        return {
          ...user,
          id: user.keycloak_id || user.id || user.email, // fallback to email if no id
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || {},
          created_at: user.created_at || user.date_joined || user.createdAt || '',
          avatar: user.avatar || '/default-avatar.png',
          status: user.is_suspended ? 'suspended' : 'active',
          role: user.account_type || 'user',
          is_verified: typeof user.is_verified === 'boolean' ? user.is_verified : false,
          is_company: typeof user.is_company === 'boolean' ? user.is_company : false,
        };
      }
      // Fallback to legacy/other user shape
      return {
        ...user,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || {},
        created_at: user.created_at || user.createdAt || '',
        avatar: user.avatar || '/default-avatar.png',
        status: user.status || 'active',
        role: user.role || 'user',
        is_verified: typeof user.is_verified === 'boolean' ? user.is_verified : false,
        is_company: typeof user.is_company === 'boolean' ? user.is_company : false,
      };
    });
  }, []);

  // For table: normalization for fetchProfile
  const normalizeProfileUsers = useCallback((usersData) => {
    return usersData.map(user => ({
      id: user.id || user._id || user.email,
      first_name: user.first_name || user.firstname || '',
      last_name: user.last_name || user.lastname || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || {},
      created_at: user.created_at || user.date_joined || user.createdAt || '',
      avatar: user.avatar || '/default-avatar.png',
      status: user.status || (user.is_suspended ? 'suspended' : 'active'),
      role: user.role || user.account_type || 'user',
      is_verified: typeof user.is_verified === 'boolean' ? user.is_verified : false,
      is_company: typeof user.is_company === 'boolean' ? user.is_company : false,
    }));
  }, []);

  // Memoize stats calculation
  const calculateStats = useCallback((usersData) => {
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(user => user.is_suspended !== 'true').length;
    const suspendedUsers = usersData.filter(user => user.is_suspended === 'true').length;
    const verifiedUsers = usersData.filter(user => user.is_verified).length;
    return { totalUsers, activeUsers, suspendedUsers, verifiedUsers };
  }, []);

  // Memoize role distribution
  const calculateRoleDistribution = useCallback((usersData) => {
    const roleCounts = {};
    usersData.forEach(user => {
      const role = user.role || 'user';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    return Object.keys(roleCounts).map(role => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: roleCounts[role]
    }));
  }, []);

  // Memoize activity data simulation
  const simulateActivityData = useCallback(() => {
    // For fast loading, use deterministic values instead of random
    return INITIAL_ACTIVITY_DATA.map((month, idx) => ({
      ...month,
      active: 100 - idx * 10,
      new: 30 - idx * 5
    }));
  }, []);

  // Only fetch on mount or when needed
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Get users from authStore.getusers() and from Profileservice.fetchAllUsers()
    // Merge both, deduplicate by id/email
    const fetchAll = async () => {
      try {
        // 4. Normalize
        const usersData = await authStore.getUsers();
        // 5. Calculate stats and role distribution
        const stats = calculateStats(usersData);
        const roleData = calculateRoleDistribution(usersData);

        setStats(stats);
        setRoleDistribution(roleData);

        // Simulate activity data (deterministic for fast load)
        setActivityData(simulateActivityData());

        // Initialize reports (localStorage is synchronous, so fast)
        let reports = JSON.parse(localStorage.getItem('user_reports') || '[]');
        if (!Array.isArray(reports) || reports.length === 0) {
          const now = new Date().toISOString();
          reports = REQUIRED_USER_REPORTS.map(template => ({
            ...template,
            id: Math.random().toString(36).slice(2),
            user: "users",
            date_created: now,
            start_date: now.split('T')[0],
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            metrics: [
              { metric_name: "Total Users", metric_value: stats.totalUsers, unit: "" },
              { metric_name: "Active Users", metric_value: stats.activeUsers, unit: "" },
              { metric_name: "Suspended Users", metric_value: stats.suspendedUsers, unit: "" },
              { metric_name: "Verified Users", metric_value: stats.verifiedUsers, unit: "" }
            ]
          }));
          localStorage.setItem('user_reports', JSON.stringify(reports));
        } else {
          reports = reports.map(report => ({
            ...report,
            metrics: [
              { metric_name: "Total Users", metric_value: stats.totalUsers, unit: "" },
              { metric_name: "Active Users", metric_value: stats.activeUsers, unit: "" },
              { metric_name: "Suspended Users", metric_value: stats.suspendedUsers, unit: "" },
              { metric_name: "Verified Users", metric_value: stats.verifiedUsers, unit: "" }
            ]
          }));
          localStorage.setItem('user_reports', JSON.stringify(reports));
        }
        if (isMounted) {
          setUserReports(reports);
          setUsers(usersData);
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to fetch users');
        console.error(err);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchAll();

    return () => { isMounted = false; };
    // eslint-disable-next-line
  }, [normalizeUsers, calculateStats, calculateRoleDistribution, simulateActivityData]);

  // Fetch table users from fetchProfile
  useEffect(() => {
    let isMounted = true;
    const fetchTableUsers = async () => {
      try {
        const res = await Profileservice.fetchAllUsers();
        if (isMounted) {
          setTableUsers(normalizeProfileUsers(Array.isArray(res) ? res : []));
        }
      } catch (err) {
        // Table errors are not fatal for the page
        if (isMounted) setTableUsers([]);
      }
    };
    fetchTableUsers();
    console.log(tableUsers);
    return () => { isMounted = false; };
  }, [normalizeProfileUsers]);

  // Use useCallback for handlers to avoid unnecessary re-renders
  const handleStatusChange = useCallback(async (userId, newStatus) => {
    try {
      await Profileservice.updateUserStatus(userId, newStatus);
      setTableUsers(users =>
        users.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      // Only update stats and roleDistribution, not refetch all
      setStats(prev => {
        let { totalUsers, activeUsers, suspendedUsers, verifiedUsers } = prev;
        if (newStatus === 'active') {
          activeUsers += 1;
          suspendedUsers -= 1;
        } else {
          activeUsers -= 1;
          suspendedUsers += 1;
        }
        return { totalUsers, activeUsers, suspendedUsers, verifiedUsers };
      });
    } catch (err) {
      setError('Failed to update user status');
      console.error(err);
    }
  }, []);

  const handleDeleteUser = useCallback(async () => {
    if (!deleteUserId) return;
    try {
      await Profileservice.deleteProfile(deleteUserId);
      setTableUsers(users => users.filter(user => user.id !== deleteUserId));
      setShowDeleteConfirm(false);
      setDeleteUserId(null);
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1
      }));
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  }, [deleteUserId]);

  // Memoize filtered users for fast rendering (for table only)
  const filteredTableUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return tableUsers.filter(user => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const matchesSearch =
        fullName.includes(q) ||
        user.email?.toLowerCase().includes(q);
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [tableUsers, searchQuery, selectedRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 max-w-md mx-auto bg-red-50 rounded-lg">
          <div className="text-red-500 text-2xl mb-3">⚠️</div>
          <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
          <p className="mt-2 text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
  className="min-h-screen bg-gray-50"
  style={{
    marginLeft: isSidebarExpanded ? '16rem' : '5rem',
    transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)'
  }}
>
      <div className="p-6 space-y-6 max-w-full">
        {/* Header */}
        <motion.div 
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center w-full"
        >
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add User
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {[
            { 
              title: "Total Users", 
              value: stats.totalUsers, 
              change: "+0%", 
              icon: <Users className="h-6 w-6" />,
              trend: "up"
            },
            { 
              title: "Active Users", 
              value: stats.activeUsers, 
              change: "+0%", 
              icon: <UserCheck className="h-6 w-6" />,
              trend: "up"
            },
            { 
              title: "Suspended Users", 
              value: stats.suspendedUsers, 
              change: "+0", 
              icon: <UserMinus className="h-6 w-6" />,
              trend: "down"
            },
            { 
              title: "Verified Users", 
              value: stats.verifiedUsers, 
              change: "+0%", 
              icon: <Shield className="h-6 w-6" />,
              trend: "up"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={false}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUp className="h-4 w-4 text-teal-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${stat.trend === "up" ? "text-teal-600" : "text-red-600"}`}>
                      {stat.change} from last month
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-teal-50 text-teal-600">
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Role Distribution */}
          <motion.div 
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Role Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} users`, "Count"]}
                    contentStyle={{
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* User Activity */}
          <motion.div 
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">User Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="active" 
                    fill="#0d9488" 
                    radius={[4, 4, 0, 0]}
                    animationBegin={0}
                    name="Active Users"
                  />
                  <Bar 
                    dataKey="new" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]}
                    animationBegin={0}
                    name="New Users"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* User Table */}
        <motion.div 
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto w-full"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <h2 className="text-xl font-semibold text-gray-800">User List</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="host">Host</option>
                </select>
              </div>
            </div>
          </div>

          <div className="w-full">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTableUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="group"
                    style={index > 50 ? { display: 'none' } : undefined} // Only render first 50 for fast load
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                          <img 
                            src={user.avatar || '/default-avatar.png'} 
                            alt={`${user.first_name} ${user.last_name}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-xs text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-2" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-2" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900 capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_verified ? (
                        <span className="inline-flex items-center text-green-600 font-semibold text-xs">
                          <UserCheck className="h-4 w-4 mr-1" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-gray-400 font-semibold text-xs">
                          <UserX className="h-4 w-4 mr-1" /> No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.status === 'active' ? (
                          <button
                            className="text-red-600 hover:text-red-900 flex items-center"
                            onClick={() => handleStatusChange(user.id, 'suspended')}
                            title="Suspend"
                          >
                            <Ban className="h-5 w-5 mr-1" />
                            Suspend
                          </button>
                        ) : (
                          <button
                            className="text-green-600 hover:text-green-900 flex items-center"
                            onClick={() => handleStatusChange(user.id, 'active')}
                            title="Activate"
                          >
                            <CheckCircle className="h-5 w-5 mr-1" />
                            Activate
                          </button>
                        )}
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => {
                            // Placeholder for edit functionality
                            console.log("Edit user:", user.id);
                          }}
                          title="Edit"
                        >
                          <UserCog className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            setDeleteUserId(user.id);
                            setShowDeleteConfirm(true);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex flex-col items-center">
                  <Trash2 className="h-12 w-12 text-red-500 mb-2" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete User</h3>
                  <p className="text-gray-600 mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
                  <div className="flex space-x-3">
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={handleDeleteUser}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}