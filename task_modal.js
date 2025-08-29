import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';

export default function TaskModal({ projectId, editingTask, onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    collaboratorName: '',
    startDate: '',
    endDate: '',
    manager: '',
    workType: '基礎'
  });

  useEffect(() => {
    if (editingTask) {
      const startDate = new Date(editingTask.startDate.seconds * 1000);
      const endDate = new Date(editingTask.endDate.seconds * 1000);
      
      setFormData({
        collaboratorName: editingTask.collaboratorName,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        manager: editingTask.manager,
        workType: editingTask.workType
      });
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const taskData = {
        ...formData,
        projectId,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        userId: user.uid,
        updatedAt: Timestamp.now()
      };

      if (editingTask) {
        await updateDoc(doc(db, 'tasks', editingTask.id), taskData);
      } else {
        await addDoc(collection(db, 'tasks'), {
          ...taskData,
          createdAt: Timestamp.now()
        });
      }

      onClose();
    } catch (error) {
      console.error('タスク保存エラー:', error);
      alert('保存に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (editingTask && confirm('この工程を削除しますか？')) {
      try {
        await deleteDoc(doc(db, 'tasks', editingTask.id));
        onClose();
      } catch (error) {
        console.error('タスク削除エラー:', error);
        alert('削除に失敗しました');
      }
    }
  };

  const workTypes = ['基礎', '躯体', '屋根', '外壁', '内装', '設備', 'その他'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {editingTask ? '工程編集' : '新規工程'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              協力業者名
            </label>
            <input
              type="text"
              value={formData.collaboratorName}
              onChange={(e) => setFormData({...formData, collaboratorName: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              工種
            </label>
            <select
              value={formData.workType}
              onChange={(e) => setFormData({...formData, workType: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {workTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開始日
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              終了日
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              工務担当者
            </label>
            <input
              type="text"
              value={formData.manager}
              onChange={(e) => setFormData({...formData, manager: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-between pt-4">
            {editingTask && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                削除
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {editingTask ? '更新' : '作成'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}