import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { toast } from 'react-toastify';
import { ClipboardDocumentListIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { theme } from '../theme';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const [stats, setStats] = useState({
    overview: {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0
    },
    byStatus: {
      labels: [],
      data: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [overviewRes, statusRes, tasksRes] = await Promise.all([
          fetch('http://localhost:5000/api/stats/overview', { headers }),
          fetch('http://localhost:5000/api/stats/by-status', { headers }),
          fetch('http://localhost:5000/api/tasks', { headers })
        ]);

        const [overview, byStatus, allTasks] = await Promise.all([
          overviewRes.json(),
          statusRes.json(),
          tasksRes.json()
        ]);

        setStats({
          overview,
          byStatus: {
            labels: byStatus.map(s => s._id === 'todo' ? 'To Do' : s._id === 'inProgress' ? 'In Progress' : 'Completed'),
            data: byStatus.map(s => s.count)
          }
        });
        setTasks(allTasks);
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Pie chart for status
  // Ensure order: Completed, In Progress, To Do
  const statusOrder = ['completed', 'inProgress', 'todo'];
  const statusLabels = ['Completed', 'In Progress', 'To Do'];
  const statusColors = ['#22c55e', '#facc15', '#ef4444'];
  const statusData = statusOrder.map(status => {
    const idx = stats.byStatus.labels.findIndex(l => l.toLowerCase().replace(' ', '') === status.toLowerCase());
    return idx !== -1 ? stats.byStatus.data[idx] : 0;
  });
  const pieData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusData,
        backgroundColor: statusColors,
        borderWidth: 1,
      },
    ],
  };
  const pieOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: '#fff' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Progress bar
  const percentComplete = stats.overview.totalTasks > 0 ? Math.round((stats.overview.completedTasks / stats.overview.totalTasks) * 100) : 0;

  // Upcoming deadlines (next 5 tasks by dueDate, not completed)
  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // Recently completed tasks (last 5 by dueDate)
  const recentCompleted = tasks
    .filter(t => t.status === 'completed')
    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
    .slice(0, 5);

  // Prepare bar chart data for status/priority
  const priorities = ['high', 'medium', 'low'];
  const priorityLabels = ['High', 'Medium', 'Low'];
  const priorityColors = ['#ef4444', '#f59e42', '#22c55e'];
  const barStatusLabels = ['To Do', 'In Progress', 'Completed'];
  const barStatusKeys = ['todo', 'inProgress', 'completed'];
  const barData = {
    labels: barStatusLabels,
    datasets: priorities.map((priority, i) => ({
      label: priorityLabels[i],
      backgroundColor: priorityColors[i],
      data: barStatusKeys.map(status =>
        tasks.filter(t => t.status === status && t.priority === priority).length
      ),
      borderRadius: 4,
      barPercentage: 0.6,
      categoryPercentage: 0.7
    }))
  };
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: '#fff' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`${theme.components.card.base} ${theme.spacing.card}`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className={theme.typography.h3}>{title}</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className={theme.layout.container}>
      <div className={theme.layout.section}>
        <h1 className={theme.typography.h1}>Dashboard</h1>

        {/* Stats Grid */}
        <div className={theme.layout.grid.cols4}>
          <StatCard
            title="Total Tasks"
            value={stats.overview.totalTasks}
            icon={ClipboardDocumentListIcon}
            color="bg-primary-500"
          />
          <StatCard
            title="Completed Tasks"
            value={stats.overview.completedTasks}
            icon={CheckCircleIcon}
            color="bg-success-500"
          />
          <StatCard
            title="Pending Tasks"
            value={stats.overview.pendingTasks}
            icon={ClockIcon}
            color="bg-warning-500"
          />
          <StatCard
            title="Overdue Tasks"
            value={stats.overview.overdueTasks}
            icon={ExclamationCircleIcon}
            color="bg-danger-500"
          />
        </div>

        {/* Main Chart and Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex flex-col">
            <h2 className="text-lg font-semibold mb-2 text-black dark:text-white">Tasks by Status</h2>
            <Pie data={pieData} options={pieOptions} />
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2 text-black dark:text-white">Completion Progress</h2>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                <div
                  className="bg-green-500 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all duration-500"
                  style={{ width: `${percentComplete}%` }}
                >
                  {percentComplete}%
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex flex-col justify-center">
            <h2 className="text-lg font-semibold mb-2 text-black dark:text-white">Tasks by Status & Priority</h2>
            <Bar data={barData} options={barOptions} height={300} />
          </div>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-4 text-black dark:text-white">Upcoming Deadlines</h2>
            {upcomingTasks.length === 0 ? (
              <div className="text-gray-400">No upcoming tasks.</div>
            ) : (
              <ul>
                {upcomingTasks.map(task => (
                  <li key={task._id} className="mb-2 flex flex-col">
                    <span className="font-medium text-primary-600 dark:text-primary-400">{task.title}</span>
                    <span className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-4 text-black dark:text-white">Recently Completed</h2>
            {recentCompleted.length === 0 ? (
              <div className="text-gray-400">No recently completed tasks.</div>
            ) : (
              <ul>
                {recentCompleted.map(task => (
                  <li key={task._id} className="mb-2 flex flex-col">
                    <span className="font-medium text-success-600 dark:text-success-400">{task.title}</span>
                    <span className="text-xs text-gray-500">Completed: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 