import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AddTask() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('You must be logged in to create tasks')
      
      const { error } = await supabase
        .from('tasks')
        .insert([
          { 
            title, 
            description, 
            is_complete: false,
            user_id: user.id
          }
        ])
      
      if (error) throw error
      
      // Reset form
      setTitle('')
      setDescription('')
      
      // Refresh the task list (you might want to lift this state up)
      window.location.reload()
    } catch (error) {
      setError(error.message)
      console.error('Error creating task:', error)
    }
  }

  return (
    <div className="add-task">
      <h2>Add New Task</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit">Add Task</button>
      </form>
    </div>
  )
}