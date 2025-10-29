export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      classes: {
        Row: {
          id: number
          name: string
          description: string | null
          class_code: string
          teacher_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          class_code?: string
          teacher_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          class_code?: string
          teacher_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      game_sections: {
        Row: {
          id: number
          name: string
          description: string | null
          order_index: number
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          order_index: number
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          order_index?: number
        }
      }
      profiles: {
        Row: {
          id: string
          role_id: number
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role_id: number
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_id?: number
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
      }
      student_classes: {
        Row: {
          id: number
          student_id: string
          class_id: number
          joined_at: string
        }
        Insert: {
          id?: number
          student_id: string
          class_id: number
          joined_at?: string
        }
        Update: {
          id?: number
          student_id?: string
          class_id?: number
          joined_at?: string
        }
      }
      student_progress: {
        Row: {
          id: number
          student_id: string
          waypoint_id: number
          completed: boolean
          score: number
          mistakes: number
          attempts: number
          time_spent: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          student_id: string
          waypoint_id: number
          completed?: boolean
          score?: number
          mistakes?: number
          attempts?: number
          time_spent?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          student_id?: string
          waypoint_id?: number
          completed?: boolean
          score?: number
          mistakes?: number
          attempts?: number
          time_spent?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      story_progress: {
        Row: {
          id: number
          student_id: string
          has_seen_intro: boolean
          last_dialogue_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          student_id: string
          has_seen_intro?: boolean
          last_dialogue_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          student_id?: string
          has_seen_intro?: boolean
          last_dialogue_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      potion_game_progress: {
        Row: {
          id: number
          student_id: string
          has_seen_tutorial: boolean
          total_score: number
          potions_brewed: number
          perfect_potions: number
          failed_attempts: number
          highest_streak: number
          current_streak: number
          total_time_played: number
          last_played_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          student_id: string
          has_seen_tutorial?: boolean
          total_score?: number
          potions_brewed?: number
          perfect_potions?: number
          failed_attempts?: number
          highest_streak?: number
          current_streak?: number
          total_time_played?: number
          last_played_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          student_id?: string
          has_seen_tutorial?: boolean
          total_score?: number
          potions_brewed?: number
          perfect_potions?: number
          failed_attempts?: number
          highest_streak?: number
          current_streak?: number
          total_time_played?: number
          last_played_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      waypoints: {
        Row: {
          id: number
          section_id: number
          name: string
          description: string | null
          type: string
          order_index: number
          required_waypoint_id: number | null
        }
        Insert: {
          id?: number
          section_id: number
          name: string
          description?: string | null
          type: string
          order_index: number
          required_waypoint_id?: number | null
        }
        Update: {
          id?: number
          section_id?: number
          name?: string
          description?: string | null
          type?: string
          order_index?: number
          required_waypoint_id?: number | null
        }
      }
    }
  }
}
