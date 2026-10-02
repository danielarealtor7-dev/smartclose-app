import { createClient } from '@/utils/supabase/server'

export default async function TransactionOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: tx } = await supabase
    .from('transactions')
    .select(`
      *,
      buyer_agent:contacts!transactions_buyer_agent_id_fkey(first_name, last_name, phone, email),
      listing_agent:contacts!transactions_listing_agent_id_fkey(first_name, last_name, phone, email),
      lender:contacts!transactions_lender_id_fkey(first_name, last_name, phone, email),
      inspector:contacts!transactions_inspector_id_fkey(first_name, last_name, phone, email),
      title_company:contacts!transactions_title_company_id_fkey(first_name, last_name, phone, email),
      escrow_agent:contacts!transactions_escrow_agent_id_fkey(first_name, last_name, phone, email)
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (!tx) {
    return <div className="p-6 text-gray-500">Transaction not found.</div>
  }

  const fmt = (val?: number | null) =>
    val != null ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'

  const fmtDate = (d?: string | null) => {
    if (!d) return '—'
    // d comes as YYYY-MM-DD
    const [y, m, day] = d.split('-')
    return `${m}/${day}/${y}`
  }

  const contactName = (c: any) => c ? `${c.first_name} ${c.last_name}` : '—'

  const sideLabels: Record<string, string> = {
    BUYER: 'Buyer Side',
    LISTING: 'Listing Side',
    DUAL: 'Dual Agency',
  }

  const finLabels: Record<string, string> = {
    CONVENTIONAL: 'Conventional',
    FHA: 'FHA',
    VA: 'VA',
    CASH: 'Cash',
    OTHER: 'Other',
  }

  const propLabels: Record<string, string> = {
    SINGLE_FAMILY: 'Single Family',
    CONDO: 'Condo',
    MANUFACTURED: 'Manufactured Home',
    NEW_CONSTRUCTION: 'New Construction',
    OTHER: 'Other',
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <h2 className="text-lg font-bold text-brand-black">Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Property Details */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Property</h3>
          <dl className="space-y-2.5 text-sm">
            <Row label="Address" value={tx.property_address} />
            <Row label="City, State ZIP" value={[tx.city, tx.state, tx.zip_code].filter(Boolean).join(', ') || '—'} />
            <Row label="Type" value={propLabels[tx.property_type] || tx.property_type} />
            <Row label="Transaction Side" value={sideLabels[tx.transaction_side] || tx.transaction_side} />
          </dl>
        </div>

        {/* Financials */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Financials</h3>
          <dl className="space-y-2.5 text-sm">
            <Row label="Purchase Price" value={fmt(tx.price)} highlight />
            <Row label="EMD" value={fmt(tx.emd_amount)} />
            <Row label="TC Commission" value={fmt(tx.commission_tc)} />
            <Row label="Financing" value={finLabels[tx.financing_type] || tx.financing_type} />
          </dl>
        </div>

        {/* Key Dates */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Key Dates</h3>
          <dl className="space-y-2.5 text-sm">
            <Row label="Effective Date" value={fmtDate(tx.effective_date)} />
            <Row label="Inspection Deadline" value={fmtDate(tx.inspection_deadline)} />
            <Row label="Closing Date" value={fmtDate(tx.closing_date)} highlight />
          </dl>
        </div>

        {/* Parties */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Parties</h3>
          <dl className="space-y-2.5 text-sm">
            <Row label="Buyer(s)" value={tx.buyer_names || '—'} />
            <Row label="Seller(s)" value={tx.seller_names || '—'} />
          </dl>
        </div>

        {/* Key Contacts */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 md:col-span-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Key Contacts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <ContactCard label="Buyer's Agent" contact={tx.buyer_agent} />
            <ContactCard label="Listing Agent" contact={tx.listing_agent} />
            <ContactCard label="Lender" contact={tx.lender} />
            <ContactCard label="Inspector" contact={tx.inspector} />
            <ContactCard label="Title Company" contact={tx.title_company} />
            <ContactCard label="Escrow Agent" contact={tx.escrow_agent} />
          </div>
        </div>

        {/* Notes */}
        {tx.notes && (
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 md:col-span-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Notes</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{tx.notes}</p>
          </div>
        )}

      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <dt className="text-gray-500 shrink-0">{label}</dt>
      <dd className={`font-medium text-right ${highlight ? 'text-brand-gold' : 'text-brand-black'}`}>{value}</dd>
    </div>
  )
}

function ContactCard({ label, contact }: { label: string; contact: any }) {
  return (
    <div className="border border-gray-100 rounded-md p-3 bg-gray-50/50">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      {contact ? (
        <>
          <p className="font-medium text-brand-black text-sm">{contact.first_name} {contact.last_name}</p>
          {contact.phone && <p className="text-xs text-gray-500 mt-0.5">{contact.phone}</p>}
          {contact.email && <p className="text-xs text-gray-500">{contact.email}</p>}
        </>
      ) : (
        <p className="text-sm text-gray-400 italic">Not assigned</p>
      )}
    </div>
  )
}

