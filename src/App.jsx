import { useEffect, useMemo, useState } from 'react'
import './App.css'

const LOCAL_STORAGE_KEY = 'codex.todo.list'
const accentClasses = ['accent-sunrise', 'accent-sky', 'accent-rose', 'accent-mint']

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`

const defaultTodos = [
  {
    id: generateId(),
    text: '✨ Add your first task and own the day',
    completed: false,
    createdAt: Date.now(),
  },
]

function buildCalendar() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    days.push(null)
  }

  for (let date = 1; date <= lastDay.getDate(); date += 1) {
    const current = new Date(year, month, date)
    days.push({
      date,
      isToday: current.toDateString() === today.toDateString(),
      isWeekend: [0, 6].includes(current.getDay()),
    })
  }

  while (days.length % 7 !== 0) {
    days.push(null)
  }

  return {
    label: new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
    }).format(today),
    days,
  }
}

function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      return saved ? JSON.parse(saved) : defaultTodos
    } catch {
      return defaultTodos
    }
  })
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed)
    if (filter === 'completed') return todos.filter((todo) => todo.completed)
    return todos
  }, [todos, filter])

  const calendar = useMemo(() => buildCalendar(), [])

  const handleSubmit = (event) => {
    event.preventDefault()
    const value = input.trim()
    if (!value) return

    setTodos((prev) => [
      {
        id: generateId(),
        text: value,
        completed: false,
        createdAt: Date.now(),
      },
      ...prev,
    ])
    setInput('')
  }

  const handleDelete = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const toggleComplete = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const startEditing = (todo) => {
    setEditingId(todo.id)
    setEditingText(todo.text)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingText('')
  }

  const saveEditing = (id) => {
    const value = editingText.trim()
    if (!value) {
      cancelEditing()
      return
    }

    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text: value } : todo))
    )
    cancelEditing()
  }

  return (
    <div className="app-shell">
      <div className="todo-panel">
        <header className="todo-header">
          <div>
            <p className="eyebrow">Today's Focus ✍️</p>
            <h1>Todo Planner ✨</h1>
            <p className="subtitle">
              Capture ideas quickly and stay inspired with colorful vibes.
            </p>
          </div>
          <div className="counter">
            <span>🌈 Total {todos.length}</span>
            <span>⚡ Active {todos.filter((todo) => !todo.completed).length}</span>
            <span>✅ Done {todos.filter((todo) => todo.completed).length}</span>
          </div>
        </header>

        <form className="todo-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type a task and press Enter to add ✏️"
          />
          <button type="submit">Add Task 🚀</button>
        </form>

        <div className="filters">
          {['all', 'active', 'completed'].map((type) => (
            <button
              key={type}
              type="button"
              className={filter === type ? 'active' : ''}
              onClick={() => setFilter(type)}
            >
              {type === 'all' && 'All 🌼'}
              {type === 'active' && 'Active 🔥'}
              {type === 'completed' && 'Done 💚'}
            </button>
          ))}
        </div>

        <div className="board-layout">
          <ul className="todo-list">
            {filteredTodos.length === 0 && (
              <li className="empty-state">
                <p>No tasks match this filter just yet.</p>
              </li>
            )}

            {filteredTodos.map((todo, index) => {
              const isEditing = editingId === todo.id
              const accent = accentClasses[index % accentClasses.length]

              return (
                <li
                  key={todo.id}
                  className={`todo-item ${accent} ${todo.completed ? 'completed' : ''}`}
                >
                  <button
                    type="button"
                    className="checkbox"
                    onClick={() => toggleComplete(todo.id)}
                    aria-label="complete toggle"
                  >
                    <span />
                  </button>

                  <div className="todo-content">
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') saveEditing(todo.id)
                          if (event.key === 'Escape') cancelEditing()
                        }}
                      />
                    ) : (
                      <p>{todo.text}</p>
                    )}
                    <span className="timestamp">
                      {new Date(todo.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="todo-actions">
                    {isEditing ? (
                      <>
                        <button type="button" onClick={() => saveEditing(todo.id)}>
                          Save
                        </button>
                        <button type="button" onClick={cancelEditing}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => startEditing(todo)}>
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      className="danger"
                      onClick={() => handleDelete(todo.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <section className="calendar-card">
            <div className="calendar-header">
              <span className="calendar-eyebrow">Mini Calendar 🗓️</span>
              <p className="calendar-title">{calendar.label}</p>
            </div>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <span key={day} className="calendar-day-label">
                  {day}
                </span>
              ))}
              {calendar.days.map((day, idx) => (
                <span
                  key={idx}
                  className={`calendar-cell ${
                    day?.isToday ? 'today' : ''
                  } ${day?.isWeekend ? 'weekend' : ''}`}
                >
                  {day?.date}
                </span>
              ))}
            </div>
            <p className="calendar-hint">
              💡 Track completed tasks alongside your calendar!
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default App
