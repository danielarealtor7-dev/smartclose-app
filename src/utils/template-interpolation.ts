import { Transaction } from '@/types'

// Prevent HTML injection
const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function interpolateTemplate(
  templateString: string,
  transaction: Partial<Transaction>,
  additionalData: Record<string, string> = {}
) {
  if (!templateString) return { result: '', missingVariables: [] };

  const missingVariables = new Set<string>();
  
  // Create a mapping of all possible variables to values
  // This uses a mix of transaction fields and additionalData (like tc_name)
  const context: Record<string, string> = {
    buyer_name: transaction.buyer_names || '',
    seller_name: transaction.seller_names || '',
    property_address: transaction.property_address || '',
    realtor_name: additionalData.realtor_name || '', // Passed from contacts if available
    title_contact: additionalData.title_contact || '',
    title_company: additionalData.title_company || '',
    lender_name: additionalData.lender_name || '',
    effective_date: transaction.effective_date || '',
    inspection_deadline: transaction.inspection_deadline || '',
    closing_date: transaction.closing_date || '',
    tc_name: additionalData.tc_name || 'Transaction Coordinator',
  };

  const result = templateString.replace(/\{\{([\w_]+)\}\}/g, (match, variableName) => {
    // Only allow specific known variables to prevent arbitrary injection
    if (!(variableName in context)) {
      missingVariables.add(variableName);
      return match; // Return the raw {{variable}} if it's completely unknown
    }
    
    const value = context[variableName];
    
    if (!value || value.trim() === '') {
      missingVariables.add(variableName);
      // Keep it as {{variable}} in the output so the user knows what to fill
      return match;
    }
    
    return escapeHtml(value);
  });

  return {
    result,
    missingVariables: Array.from(missingVariables)
  };
}
