import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Calendar from '../components/Calendar';
import TaskModal from '../components/TaskModal';
import ProjectModal from '../components/ProjectModal';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export default function Home() {
  const { user, signInWithGoogle, logout, loading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (user) {
      // プロジェクトを取得
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
        const projectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsData);
        if (projectsData.length > 0 && !selectedProject) {
          setSelectedProject(projectsData[0].id);
        }
      });

      // タスクを取得
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('startDate')
      );

      const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(tasksData);
      });

      return () => {
        unsubscribeProjects();
        unsubscribeTasks();
      };
    }
  }, [user, selectedProject]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">工程表アプリ</h1>
          <button
            onClick={signInWithGoogle}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Googleでログイン
          </button>
        </div>
      </div>
    );
  }

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const filteredTasks = selectedProject 
    ? tasks.filter(task => task.projectId === selectedProject)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">工程表アプリ</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.displayName}
            </span>
            <button
              onClick={logout}
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto p-4">
        {/* プロジェクト選択とボタン */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  プロジェクト選択
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 min-w-[200px]"
                >
                  <option value="">プロジェクトを選択</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.clientName} - {project.propertyName}
                    </option>
                  ))}
                </select>
              </div>
              {selectedProjectData && (
                <div className="text-sm text-gray-600">
                  得意先: {selectedProjectData.clientName}<br/>
                  物件: {selectedProjectData.propertyName}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowProjectModal(true)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                新規プロジェクト
              </button>
              <button
                onClick={() => setShowTaskModal(true)}
                disabled={!selectedProject}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                新規工程
              </button>
            </div>
          </div>
        </div>

        {/* カレンダー */}
        <Calendar
          tasks={filteredTasks}
          onTaskEdit={(task) => {
            setEditingTask(task);
            setShowTaskModal(true);
          }}
        />
      </main>

      {/* モーダル */}
      {showTaskModal && (
        <TaskModal
          projectId={selectedProject}
          editingTask={editingTask}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
        />
      )}

      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
        />
      )}
    </div>
  );
}