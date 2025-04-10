import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function TaskList() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get the current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setTasks(data)
    } catch (error) {
      setError(error.message)
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleComplete = async (taskId, currentStatus) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('tasks')
        .update({ is_complete: !currentStatus })
        .eq('id', taskId)
      
      if (error) throw error
      
      fetchTasks()
    } catch (error) {
      setError(error.message)
      console.error('Error toggling task status:', error)
    }
  }

  const updateTask = async (taskId) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('tasks')
        .update({ 
          title: editTitle,
          description: editDescription
        })
        .eq('id', taskId)
      
      if (error) throw error
      
      fetchTasks()
      setEditingTask(null)
      setEditTitle('')
      setEditDescription('')
    } catch (error) {
      setError(error.message)
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    
    try {
      setError(null)
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
      
      if (error) throw error
      
      fetchTasks()
    } catch (error) {
      setError(error.message)
      console.error('Error deleting task:', error)
    }
  }

  const startEditing = (task) => {
    setEditingTask(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description)
  }

  if (!user) return <div>Please sign in to view your tasks</div>
  if (loading) return <div className="loading">Loading tasks...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (tasks.length === 0) return <div className="empty">No tasks found</div>

  return (
    <div className="task-list">
      <h2>Your Tasks</h2>
      {error && <div className="error-message">{error}</div>}
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className={`task-item ${task.is_complete ? 'completed' : ''}`}>
            <div className="task-content">
              <input
                type="checkbox"
                checked={task.is_complete}
                onChange={() => toggleComplete(task.id, task.is_complete)}
              />
              {editingTask === task.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Task title"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Task description"
                  />
                  <div className="task-actions">
                    <button onClick={() => updateTask(task.id)}>Save</button>
                    <button onClick={() => {
                      setEditingTask(null)
                      setEditTitle('')
                      setEditDescription('')
                    }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <div className="task-actions">
                    <button onClick={() => startEditing(task)}>Edit</button>
                    <button onClick={() => deleteTask(task.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}