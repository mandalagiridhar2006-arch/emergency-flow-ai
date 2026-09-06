import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Supabase Todos Test</h1>
      <ul className="space-y-2">
        {todos?.map((todo) => (
          <li key={todo.id} className="p-2 border rounded bg-card">{todo.name}</li>
        ))}
      </ul>
      {(!todos || todos.length === 0) && (
        <p className="text-sm text-muted-foreground mt-4">
          No todos found or &apos;todos&apos; table not yet created in Supabase.
        </p>
      )}
    </div>
  )
}
