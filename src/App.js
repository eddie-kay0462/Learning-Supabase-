import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import TaskList from './components/TaskList'
import AddTask from './components/AddTask'
import Auth from './components/Auth'
import './App.css'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="app">
      <header>
        <h1>Task Manager</h1>
        <Auth />
      </header>
      
      {session ? (
        <main>
          <AddTask />
          <TaskList />
        </main>
      ) : (
        <div className="auth-required">
          <p>Please sign in to manage your tasks</p>
        </div>
      )}
    </div>
  )
}

export default App