import { useEffect, useMemo, useState } from 'react'
import './App.css'

const LOCAL_STORAGE_KEY = 'codex.todo.list'
const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`

const defaultTodos = [
  {
    id: generateId(),
    text: '첫 번째 할 일을 추가해보세요',
    completed: false,
    createdAt: Date.now(),
  },
]

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

  const handleSubmit = (event) => {
    event.preventDefault()
    const value = input.trim()
    if (!value) return

    setTodos((prev) => [
      { id: generateId(), text: value, completed: false, createdAt: Date.now() },
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
            <p className="eyebrow">오늘의 할 일</p>
            <h1>Todo Planner</h1>
            <p className="subtitle">생각난 일을 빠르게 적고 바로 실행하세요.</p>
          </div>
          <div className="counter">
            <span>전체 {todos.length}</span>
            <span>진행중 {todos.filter((todo) => !todo.completed).length}</span>
          </div>
        </header>

        <form className="todo-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="할 일을 입력하고 Enter를 눌러 추가하세요"
          />
          <button type="submit">추가</button>
        </form>

        <div className="filters">
          {['all', 'active', 'completed'].map((type) => (
            <button
              key={type}
              type="button"
              className={filter === type ? 'active' : ''}
              onClick={() => setFilter(type)}
            >
              {type === 'all' && '전체'}
              {type === 'active' && '진행중'}
              {type === 'completed' && '완료'}
            </button>
          ))}
        </div>

        <ul className="todo-list">
          {filteredTodos.length === 0 && (
            <li className="empty-state">
              <p>해당 조건에 맞는 할 일이 없습니다.</p>
            </li>
          )}

          {filteredTodos.map((todo) => {
            const isEditing = editingId === todo.id

            return (
              <li
                key={todo.id}
                className={`todo-item ${todo.completed ? 'completed' : ''}`}
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
                    {new Date(todo.createdAt).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="todo-actions">
                  {isEditing ? (
                    <>
                      <button type="button" onClick={() => saveEditing(todo.id)}>
                        저장
                      </button>
                      <button type="button" onClick={cancelEditing}>
                        취소
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => startEditing(todo)}>
                      수정
                    </button>
                  )}
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDelete(todo.id)}
                  >
                    삭제
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default App
