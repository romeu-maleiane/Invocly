'use server'

import { CreateContact, ContactsApi } from "@getbrevo/brevo";

interface CreateContanctOnBrevoProps {
    first_name: string
    last_name?: string
    email: string
}

export const createContanctOnBrevo = async ({ first_name, last_name, email }: CreateContanctOnBrevoProps) => {

    try {
        const BREVO_API_KEY = process.env.BREVO_API_KEY;

        if (!BREVO_API_KEY) throw new Error('Brevo API key is required')

        const contactAPI = new ContactsApi();
        (contactAPI as any).authentications.apiKey.apiKey = BREVO_API_KEY;

        const contact = new CreateContact();
        contact.email = email;
        contact.attributes = {
            FIRSTNAME: first_name || '',
            LASTNAME: last_name || '',
        };
        contact.listIds = [5]

        await contactAPI.createContact(contact).then(res => {
            console.log(JSON.stringify(res.body));
        }).catch(err => {
            console.error("Error creating contact:", err);
        })
        
        console.log('Contanct created')
    } catch (err) {
        console.error("Error creating contact:", err);
    }
}