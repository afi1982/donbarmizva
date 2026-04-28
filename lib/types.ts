export type GuestStatus = 'pending' | 'coming' | 'not_coming' | 'maybe'

export interface Guest {
  id: string
  name: string
  phone: string
  token: string
  status: GuestStatus
  responded_at: string | null
  invited_at: string | null
  reminder_sent: boolean
  created_at: string
}

export interface InvitationConfig {
  id: number
  child_name: string
  event_date: string | null
  event_time: string
  parasha: string
  hebrew_date: string
  synagogue_name: string
  address: string
  city: string
  parents_names: string
  siblings_names: string
  custom_message: string
  whatsapp_message: string
  reminder_message: string
}
