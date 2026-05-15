'use server'

import { createClient } from '@/lib/supabase/server'
import { CallLog } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getLogs(sessionDate?: string, sessionShift?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_call_logs', {
    input_data: {
      session_date: sessionDate,
      session_shift: sessionShift
    }
  })

  if (error) {
    console.error('Error fetching logs:', error)
    return []
  }

  return (data as any[]).map((log: any) => ({
    ...log,
    id: log.call_logs_id,
    requestedBy: log.call_logs_requested_by,
    lastName: log.call_logs_last_name,
    roomNo: log.call_logs_room_no,
    guestReq: log.call_logs_guest_req,
    timeOfRequest: log.call_logs_time_of_request,
    timeOfDelivered: log.call_logs_time_of_delivered,
    acknowledgedBy: log.call_logs_acknowledged_by,
    callType: log.call_logs_call_type,
    followUp: log.call_logs_follow_up,
    remarks: log.call_logs_remarks,
    createdAt: log.call_logs_created_at,
    userId: log.call_logs_user_id,

  })) as CallLog[]
}

export async function addLog(log: CallLog, sessionDate?: string, sessionShift?: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('create_call_log', {
    input_data: {
      id: log.id,
      requested_by: log.requestedBy,
      last_name: log.lastName,
      room_no: log.roomNo,
      guest_req: log.guestReq,
      time_of_request: log.timeOfRequest,
      time_of_delivered: log.timeOfDelivered,
      remarks: log.remarks || '',
      created_at: log.createdAt,
      call_type: log.callType,
      user_id: log.userId,
      session_date: sessionDate,
      session_shift: sessionShift
    }
  })

  if (error) {
    console.error('Error adding log:', error)
    throw new Error('Failed to add log')
  }

  revalidatePath('/')
}

export async function updateLog(id: string, updates: Partial<CallLog>) {
  const supabase = await createClient()
  
  const rpcUpdates: any = {}
  if ('requestedBy' in updates) rpcUpdates.requested_by = updates.requestedBy
  if ('lastName' in updates) rpcUpdates.last_name = updates.lastName
  if ('roomNo' in updates) rpcUpdates.room_no = updates.roomNo
  if ('guestReq' in updates) rpcUpdates.guest_req = updates.guestReq
  if ('timeOfRequest' in updates) rpcUpdates.time_of_request = updates.timeOfRequest
  if ('timeOfDelivered' in updates) rpcUpdates.time_of_delivered = updates.timeOfDelivered
  if ('remarks' in updates) rpcUpdates.remarks = updates.remarks
  if ('followUp' in updates) rpcUpdates.follow_up = updates.followUp
  if ('acknowledgedBy' in updates) rpcUpdates.acknowledged_by = updates.acknowledgedBy
  if ('callType' in updates) rpcUpdates.call_type = updates.callType
  if ('userId' in updates) rpcUpdates.user_id = updates.userId


  const { error } = await supabase.rpc('update_call_log', {
    input_data: {
      id: id,
      updates: rpcUpdates
    }
  })

  if (error) {
    console.error('Error updating log:', error)
    throw new Error('Failed to update log')
  }

  revalidatePath('/')
}

export async function deleteLog(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('delete_call_log', {
    input_data: { id: id }
  })

  if (error) {
    console.error('Error deleting log:', error)
    throw new Error('Failed to delete log')
  }

  revalidatePath('/')
}

export async function clearAllLogs() {
  const supabase = await createClient()
  const { error } = await supabase.rpc('clear_all_logs', { input_data: {} })

  if (error) {
    console.error('Error clearing logs:', error)
    throw new Error('Failed to clear logs')
  }

  revalidatePath('/')
}

// User Settings Actions
export async function getSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_settings', { input_data: {} })

  if (error) {
    console.error('Error fetching settings:', error)
    return null
  }

  if (!data) return null

  return {
    id: data.settings_id,
    privacy_mode: data.settings_privacy_mode,
    terms_accepted: data.settings_terms_accepted,
    active_account: data.settings_active_account,
    updated_at: data.settings_updated_at,
  }
}


export async function updateSettings(updates: { privacy_mode?: boolean, terms_accepted?: boolean, active_account?: string }) {
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('update_settings', {
    input_data: { updates: updates }
  })

  if (error) {
    console.error('Error updating settings:', error)
  }

  revalidatePath('/')
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_user_profile', {
    input_data: { user_id: userId }
  })

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  if (!data) return null

  return {
    id: data.user_id,
    email: data.user_email,
    username: data.user_username,
    type: data.user_type as 'dev' | 'manager' | 'telex',
    status: data.user_status as 'unverified' | 'verified'
  }

}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return getUserProfile(user.id)
}

export async function getAllUsers() {
  const supabase = await createClient()
  
  // Verify requester is admin (dev or manager)
  const profile = await getCurrentUser()
  if (!profile || (profile.type !== 'dev' && profile.type !== 'manager')) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('user_table')
    .select('*')
    .order('user_updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data.map((u: any) => ({
    id: u.user_id,
    email: u.user_email,
    username: u.user_username,
    type: u.user_type,
    status: u.user_status
  }))
}

export async function verifyUser(userId: string, status: 'verified' | 'unverified') {
  const supabase = await createClient()

  // Verify requester is admin
  const profile = await getCurrentUser()
  if (!profile || (profile.type !== 'dev' && profile.type !== 'manager')) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('user_table')
    .update({ user_status: status })
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating user status:', error)
    throw new Error('Failed to update user status')
  }

  revalidatePath('/')
}

export async function getArchiveLogs() {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_archive_logs')

  if (error) {
    console.error('Error fetching archive logs:', error)
    return []
  }

  return (data as any[]).map((log: any) => ({
    id: log.call_logs_id,
    requestedBy: log.call_logs_requested_by,
    lastName: log.call_logs_last_name,
    roomNo: log.call_logs_room_no,
    guestReq: log.call_logs_guest_req,
    timeOfRequest: log.call_logs_time_of_request,
    timeOfDelivered: log.call_logs_time_of_delivered,
    remarks: log.call_logs_remarks,
    followUp: log.call_logs_follow_up,
    acknowledgedBy: log.call_logs_acknowledged_by,
    createdAt: log.call_logs_created_at,
    callType: log.call_logs_call_type,
    userId: log.call_logs_user_id,
    dateId: log.call_logs_date_id,
    username: log.user_username,
    date: log.date_date,
    shift: log.date_shift
  }))
}


export async function getOrCreateDateSession(date: string, shift: 'AM' | 'PM') {
  const supabase = await createClient()
  const profile = await getCurrentUser()
  if (!profile) throw new Error('Unauthorized')

  // Check if session exists
  const { data: existing, error: fetchError } = await supabase
    .from('date_table')
    .select('date_id')
    .eq('date_date', date)
    .eq('date_shift', shift)
    .eq('date_user_id', profile.id)
    .single()

  if (existing) return existing.date_id

  // Create new session
  const { data: created, error: createError } = await supabase
    .from('date_table')
    .insert({
      date_date: date,
      date_shift: shift,
      date_user_id: profile.id
    })
    .select('date_id')
    .single()

  if (createError) {
    console.error('Error creating date session:', createError)
    throw new Error('Failed to create session')
  }

  return created.date_id
}
