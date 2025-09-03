'use server'
import { createClient } from "@/lib/supabase/server"

interface UpdatePlanProps {
    plan: 'free' | 'premium' 
    id: string 
    email: string
}
export const updatePlan = async ({plan, id, email}: UpdatePlanProps) => {
    const supabase = await createClient()

    try{
        const { error } = await supabase
        .from('users')
        .update({'plan': plan })
        .or(`id.eq.${id},email.eq.${email}`)
        
        if(error) throw new Error(`${error.message}`);
        
    } catch(error){
        console.error('Update Plan Error: ', error)
    }
}