'use server'
import { createClient } from "@/lib/supabase/server"

interface UpdatePlanProps {
    plan: 'free' | 'premium' 
    name: string 
    email: string
}
export const updatePlan = async ({plan, name, email}: UpdatePlanProps) => {
    const supabase = await createClient()

    try{
        const { error } = await supabase
        .from('users')
        .update({'plan': plan })
        .or(`user_name.eq.${name},email.eq.${email}`)
        
        if(error) throw new Error(`${error.message}`);
        
    } catch(error){
        console.error('Update Plan Error: ', error)
    }
}