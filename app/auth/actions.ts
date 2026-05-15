'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  // Check if email already exists in user_table
  const { data: existingUser } = await supabase
    .from('user_table')
    .select('user_id')
    .eq('user_email', email)
    .single()

  if (existingUser) {
    return { error: 'Email already exists in user database' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    const { error: insertError } = await supabase
      .from('user_table')
      .insert({
        user_id: data.user.id,
        user_email: email,
        user_username: username,
      })

    if (insertError) {
      console.error('Error saving user data:', insertError)
      // Note: Auth user is created but table insert failed. 
      // In a real app you might want to rollback or handle this.
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
