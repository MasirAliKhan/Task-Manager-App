import React, { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { theme } from '../theme';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const cellRefs = useRef([]);

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

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return theme.colors.danger[500];
      case 'medium':
        return theme.colors.warning[500];
      case 'low':
        return theme.colors.success[500];
      default:
        return theme.colors.secondary[500];
    }
  };

  const getStatusBox = (status) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-500';
      case 'inProgress':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-600';
      default:
        return 'bg-gray-400';
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className={theme.components.card.base}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className={theme.typography.h2}>
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className={`${theme.components.button.base} ${theme.components.button.outline}`}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className={`${theme.components.button.base} ${theme.components.button.outline}`}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className={`${theme.typography.small} p-2 text-center bg-gray-50 dark:bg-gray-800`}
            >
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            const dayTasks = getTasksForDate(day);
            return (
              <div
                key={index}
                ref={el => (cellRefs.current[index] = el)}
                className={`min-h-[100px] p-2 bg-white dark:bg-gray-800 transition duration-200 ease-in-out z-10 ${
                  !isSameMonth(day, currentDate) ? 'text-gray-400 dark:text-gray-600' : ''
                } ${isToday(day) ? 'bg-primary-50 dark:bg-primary-900' : ''}`}
                onMouseEnter={e => {
                  setHoveredDay({ day, dayTasks, index });
                  const rect = cellRefs.current[index].getBoundingClientRect();
                  setPopoverPos({
                    top: rect.top + window.scrollY - 8, // 8px above (will subtract popover height later)
                    left: rect.left + window.scrollX + rect.width / 2
                  });
                }}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div className="font-medium mb-1 text-black dark:text-white">{format(day, 'd')}</div>
                <div className="space-y-1">
                  {dayTasks.map(task => (
                    <div
                      key={task._id}
                      className={`rounded-lg px-2 py-1 flex flex-col items-start mb-1 shadow-sm ${getStatusBox(task.status)}`}
                    >
                      <span className="font-semibold text-white text-xs truncate">{task.title}</span>
                      <span className={`mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-white/80 text-black`}>{
                        task.status === 'todo' ? 'To Do' :
                        task.status === 'inProgress' ? 'In Progress' :
                        task.status === 'completed' ? 'Completed' : task.status
                      }</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {hoveredDay && (
          <div
            className="absolute z-50"
            style={{
              top: popoverPos.top,
              left: popoverPos.left,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
            }}
          >
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-4 border-primary-500 p-6 min-w-[260px] min-h-[120px] scale-110 flex flex-col items-center transition-all duration-200">
                <div className="text-2xl font-bold mb-2 text-black dark:text-white">{format(hoveredDay.day, 'd MMMM yyyy')}</div>
                <div className="w-full">
                  {hoveredDay.dayTasks.length === 0 ? (
                    <div className="text-gray-400 text-center">No tasks</div>
                  ) : (
                    hoveredDay.dayTasks.map(task => (
                      <div key={task._id} className={`rounded-lg px-3 py-2 mb-2 shadow ${getStatusBox(task.status)} text-white`}>
                        <div className="font-semibold">{task.title}</div>
                        <div className="text-xs">{task.status === 'todo' ? 'To Do' : task.status === 'inProgress' ? 'In Progress' : 'Completed'}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Arrow at bottom */}
              <div className="absolute left-1/2 -bottom-3 transform -translate-x-1/2">
                <div className="w-4 h-4 bg-white dark:bg-gray-800 border-b-4 border-r-4 border-primary-500 rotate-45"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
        <h1 className={theme.typography.h1}>Calendar</h1>
        {renderCalendar()}
      </div>
    </div>
  );
};

export default Calendar; 