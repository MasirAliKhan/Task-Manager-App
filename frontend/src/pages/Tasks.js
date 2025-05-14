import React, { useState, useEffect, useContext } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { theme } from '../theme';
import { NotificationContext } from '../components/Layout';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    labels: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { setNotificationRefresh } = useContext(NotificationContext);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingTask
        ? `http://localhost:5000/api/tasks/${editingTask._id}`
        : 'http://localhost:5000/api/tasks';
      
      const response = await fetch(url, {
        method: editingTask ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save task');
      }

      toast.success(editingTask ? 'Task updated successfully' : 'Task created successfully');
      setShowModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'todo',
        labels: []
      });
      fetchTasks();
      setNotificationRefresh(prev => prev + 1);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete task');
        }

        toast.success('Task deleted successfully');
        fetchTasks();
        setNotificationRefresh(prev => prev + 1);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.split('T')[0],
      priority: task.priority,
      status: task.status,
      labels: task.labels
    });
    setShowModal(true);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const token = localStorage.getItem('token');
      const updateData = {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: newStatus,
        labels: task.labels || []
      };

      console.log('Updating task status:', { taskId, newStatus, updateData }); // Debug log

      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task status');
      }

      toast.success('Task status updated successfully');
      fetchTasks();
      setNotificationRefresh(prev => prev + 1);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error(error.message || 'Failed to update task status');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: destination.droppableId,
        labels: task.labels || []
      };

      console.log('Dragging task:', { taskId: draggableId, newStatus: destination.droppableId, updateData }); // Debug log

      const response = await fetch(`http://localhost:5000/api/tasks/${draggableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task status');
      }

      toast.success('Task moved successfully');
      fetchTasks();
      setNotificationRefresh(prev => prev + 1);
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error(error.message || 'Failed to move task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const priorityMatch = selectedPriority === 'all' || task.priority === selectedPriority;
    const statusMatch = selectedStatus === 'all' || task.status === selectedStatus;
    const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       task.labels.some(label => label.toLowerCase().includes(searchQuery.toLowerCase()));
    return priorityMatch && statusMatch && searchMatch;
  });

  const columns = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    inProgress: filteredTasks.filter(task => task.status === 'inProgress'),
    completed: filteredTasks.filter(task => task.status === 'completed')
  };

  const TaskCard = ({ task }) => (
    <div className={`
      ${theme.components.card.base}
      ${theme.spacing.card}
      mb-4 flex flex-col justify-between
      h-[180px]
      bg-white dark:bg-[#23272f] border border-gray-200 dark:border-gray-700 shadow-md
      transition-transform duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-xl
    `}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className={theme.typography.h3}>{task.title}</h3>
            <p className={theme.typography.body}>{task.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {task.labels.map((label, index) => (
                <span key={index} className={`${theme.components.badge.base} dark:text-white`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(task)}
              className={`${theme.components.button.base} ${theme.components.button.secondary}`}
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(task._id)}
              className={`${theme.components.button.base} ${theme.components.button.danger}`}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2 mt-2 w-full">
        <div>
          <span className={theme.typography.small}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
        <span className={`${theme.components.badge.base} ${
          task.priority === 'high' ? theme.components.badge.danger :
          task.priority === 'medium' ? theme.components.badge.warning :
          theme.components.badge.success
        }`}>
          {task.priority}
        </span>
        {task.status === 'todo' && (
          <button
            onClick={() => handleStatusChange(task._id, 'inProgress')}
            className={`${theme.components.button.base} ${theme.components.button.primary} whitespace-nowrap`}
          >
            Start Progress
          </button>
        )}
        {task.status === 'inProgress' && (
          <button
            onClick={() => handleStatusChange(task._id, 'completed')}
            className={`${theme.components.button.base} ${theme.components.button.success} whitespace-nowrap`}
          >
            Mark Complete
          </button>
        )}
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
        <div className="flex justify-between items-center mb-6">
          <h1 className={theme.typography.h1}>Tasks</h1>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${theme.components.input.base} min-h-[44px] px-4 py-2 rounded-lg text-base w-44`}
            />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className={`${theme.components.input.base} min-h-[44px] px-4 py-2 rounded-lg text-base w-44`}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`${theme.components.input.base} min-h-[44px] px-4 py-2 rounded-lg text-base w-44`}
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={() => {
                setEditingTask(null);
                setFormData({
                  title: '',
                  description: '',
                  dueDate: '',
                  priority: 'medium',
                  status: 'todo',
                  labels: []
                });
                setShowModal(true);
              }}
              className={`${theme.components.button.base} ${theme.components.button.primary} min-h-[44px] py-2 rounded-lg text-base flex items-center gap-2 w-44`}
            >
              <PlusIcon className="h-5 w-5" />
              Add Task
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full">
            <div className="flex-1 min-w-0 mb-4 md:mb-0">
              <Droppable droppableId="todo">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                  >
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">To Do</h2>
                    {columns.todo.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            <div className="flex-1 min-w-0 mb-4 md:mb-0">
              <Droppable droppableId="inProgress">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                  >
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">In Progress</h2>
                    {columns.inProgress.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            <div className="flex-1 min-w-0">
              <Droppable droppableId="completed">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                  >
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Completed</h2>
                    {columns.completed.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
              {editingTask ? 'Edit Task' : 'Add Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
              />
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
                required
              />
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input
                type="text"
                placeholder="Labels (comma separated, e.g. work,urgent)"
                value={formData.labels.join(', ')}
                onChange={e =>
                  setFormData({
                    ...formData,
                    labels: e.target.value.split(',').map(l => l.trim()).filter(Boolean)
                  })
                }
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
              />
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition"
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;