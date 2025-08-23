'use server'
import { createClient } from "@/lib/supabase/server"

export const InsertUser = async (id: string, first_name: string, last_name: string, email_address: string) => {
    const supabase = await createClient()

    try {
        const { error } = await supabase
        .from('users')
        .insert({
            'id': id,
            'user_name': `${first_name} ${last_name || ''}`.trim(),
            'email': email_address
        })
        
        if(error){
            throw error
            
        }
    } catch (error) {
        console.error('Supabase Insert User Error: ', error)
    }
}