import { getAllContacts } from '@/app/actions/contacts'
import { ContactsClient } from '@/components/contacts/ContactsClient'

export default async function ContactsPage() {
  const { data: contacts } = await getAllContacts()

  return (
    <ContactsClient initialContacts={contacts || []} />
  )
}
