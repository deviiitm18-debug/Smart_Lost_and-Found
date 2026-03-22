export type ItemType = 'lost' | 'found'
export type ItemStatus = 'active' | 'resolved' | 'expired'

export interface Item {
  id: string
  user_id: string
  type: ItemType
  title: string
  description: string | null
  category: string
  location: string
  campus: string | null
  date_occurred: string
  image_url: string | null
  status: ItemStatus
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  display_name: string | null
  email: string | null
  campus: string | null
  created_at: string
}

export interface Message {
  id: string
  item_id: string
  sender_id: string
  recipient_id: string
  content: string
  is_read: boolean
  created_at: string
}

export const CATEGORIES = [
  'Electronics',
  'Books & Notes',
  'ID & Cards',
  'Keys',
  'Bags & Wallets',
  'Clothing',
  'Accessories',
  'Sports Equipment',
  'Other'
] as const

export const LOCATIONS = [
  'Library',
  'Cafeteria',
  'Lecture Hall A',
  'Lecture Hall B',
  'Science Building',
  'Engineering Building',
  'Student Center',
  'Gym',
  'Parking Lot',
  'Bus Stop',
  'Dormitory',
  'Other'
] as const

export const CAMPUSES = [
  'Main Campus',
  'North Campus',
  'South Campus',
  'Medical Campus'
] as const
