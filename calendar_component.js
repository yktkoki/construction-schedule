import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isWithinInterval } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function Calendar({ tasks, onTaskEdit }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getTasksForDay = (day) => {
    return tasks.filter(task => {
      const taskStart = new Date(task.startDate.seconds * 1000);
      const taskEnd = new Date(task.endDate.seconds * 1000);
      return isWithinInterval(day, { start: taskStart, end: taskEnd });
    });
  };

  const getTaskPosition = (task, day) => {
    const taskStart = new Date(task.startDate.seconds * 1000);
    const taskEnd = new Date(task.endDate.seconds * 1000);
    
    const isStart = isSameDay(taskStart, day);
    const isEnd = isSameDay(taskEnd, day);
    const isMiddle = !isStart && !isEnd;

    return { isStart, isEnd, isMiddle };
  };

  const workTypeColors = {
    '基礎': 'bg-blue-500',
    '躯体': 'bg-green-500',
    '屋根': 'bg-purple-500',
    '外壁': 'bg-orange-500',
    '内装': 'bg-pink-500',
    '設備': 'bg-yellow-500',
    'その他': 'bg-gray-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* カレンダーヘッダー */}
      <div className="flex justify-between items-center p-4 border-b">
        <button
          onClick={prevMonth}
          className="px-3 py-1 border rounded hover:bg-gray-50"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'yyyy年MM月', { locale: ja })}
        </h2>
        <button
          onClick={nextMonth}
          className="px-3 py-1 border rounded hover:bg-gray-50"
        >
          →
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-600 border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] border-r border-b last:border-r-0 p-1 ${
                isWeekend ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              {/* 日付 */}
              <div className={`text-sm font-medium ${
                isWeekend ? 'text-red-600' : 'text-gray-900'
              }`}>
                {format(day, 'd')}
              </div>

              {/* タスク表示 */}
              <div className="mt-1 space-y-1">
                {dayTasks.map(task => {
                  const position = getTaskPosition(task, day);
                  const colorClass = workTypeColors[task.workType] || workTypeColors['その他'];

                  return (
                    <div
                      key={task.id}
                      onClick={() => onTaskEdit(task)}
                      className={`${colorClass} text-white text-xs p-1 rounded cursor-pointer hover:opacity-80 ${
                        position.isMiddle ? 'mx-0' : position.isStart ? 'mr-0' : 'ml-0'
                      }`}
                      title={`${task.workType} - ${task.collaboratorName} (${task.manager})`}
                    >
                      <div className="truncate">
                        {position.isStart || position.isMiddle ? task.workType : ''}
                      </div>
                      {position.isStart && (
                        <div className="truncate text-[10px] opacity-90">
                          {task.collaboratorName}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}