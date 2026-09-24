'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { processImportBatch, previewImportBatch } from '@/app/actions/import'
import { UploadCloud, CheckCircle, AlertTriangle, XCircle, Info, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type ImportStep = 'upload' | 'mapping' | 'preview' | 'result'

type RowClassification = 'New' | 'Possible Duplicate' | 'Changed' | 'Invalid' | 'Ignored'

interface ProcessedRow {
  index: number
  clientName?: string
  propertyAddress?: string
  effectiveDay?: string
  closingDay?: string
  raw: Record<string, unknown>
  classification: RowClassification
  reason?: string
}

export function ImportWizard() {
  const router = useRouter()
  const [step, setStep] = useState<ImportStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [worksheetName, setWorksheetName] = useState<string>('')
  const [worksheets, setWorksheets] = useState<string[]>([])
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [defaultYear, setDefaultYear] = useState<string>(new Date().getFullYear().toString())
  
  const [processedRows, setProcessedRows] = useState<ProcessedRow[]>([])
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [result, setResult] = useState<{success: boolean; count: number; error?: string} | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFile(file)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      setWorkbook(wb)
      setWorksheets(wb.SheetNames)
      setWorksheetName(wb.SheetNames[0])
      setStep('mapping')
    }
    reader.readAsBinaryString(file)
  }

  const processData = async () => {
    if (!workbook || !worksheetName) return
    setIsPreviewing(true)

    try {
      const ws = workbook.Sheets[worksheetName]
      const data = XLSX.utils.sheet_to_json(ws, { raw: false }) 

      const basicParsed: ProcessedRow[] = []
      
      data.forEach((row: any, index: number) => {
        const clientName = row['CLIENT NAME']?.toString().trim()
        const propertyAddress = row['PROPERTY ADDRESS']?.toString().trim()
        
        let effectiveDay = row['EFFECTIVE DAY']?.toString().trim()
        let closingDay = row['CLOSING DAY']?.toString().trim()

        const fixDate = (dateStr?: string) => {
          if (!dateStr) return undefined
          if (!/\d{4}$/.test(dateStr) && !/^\d{4}/.test(dateStr)) {
            return `${dateStr}/${defaultYear}`
          }
          return dateStr
        }

        effectiveDay = fixDate(effectiveDay)
        closingDay = fixDate(closingDay)

        basicParsed.push({
          index,
          clientName,
          propertyAddress,
          effectiveDay,
          closingDay,
          raw: row,
          classification: 'New'
        })
      })

      // Send to server to preview/check duplicates
      const previewData = basicParsed.map(r => ({
        index: r.index,
        clientName: r.clientName,
        propertyAddress: r.propertyAddress,
        effectiveDay: r.effectiveDay
      }))

      const serverResults = await previewImportBatch(previewData)

      // Merge results
      const finalRows = basicParsed.map(r => {
        const sr = serverResults.find((s: Record<string, unknown>) => s.index === r.index)
        let classification: RowClassification = (sr?.classification as RowClassification) || 'New'
        let reason = sr?.reason || ''

        // Rule: Ignore if only False values
        if (classification !== 'Ignored') {
          const tasks = ['EBBA', 'CONTRACT', 'FHA/VA', 'COMPENSATION', 'ESCROW', 'LBP DISC', 'FLOOD DISC', 'MLS PROFILE', 'SPD', 'ADDENDUM', 'INSPECTION']
          const hasTrue = tasks.some(t => r.raw[t]?.toString().toLowerCase() === 'true')
          if (!hasTrue && !r.clientName && !r.propertyAddress) {
             classification = 'Ignored'
             reason = 'Empty row with only False values'
          }
        }

        return { ...r, classification, reason }
      })

      setProcessedRows(finalRows)

      const validIndices = new Set<number>()
      finalRows.forEach(r => {
        if (r.classification !== 'Ignored' && r.classification !== 'Invalid') {
          validIndices.add(r.index)
        }
      })
      setSelectedRows(validIndices)
      
      setStep('preview')
    } catch (e) {
      console.error(e)
      alert("Error previewing data. Check console.")
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleImport = async () => {
    setIsSubmitting(true)
    try {
      const rowsToImport = processedRows
        .filter(r => selectedRows.has(r.index))
        .map(r => ({
          clientName: r.clientName,
          propertyAddress: r.propertyAddress,
          effectiveDay: r.effectiveDay,
          closingDay: r.closingDay,
          realtor: r.raw['REALTOR']?.toString(),
          loanType: r.raw['LOAN TYPE']?.toString(),
          ebba: r.raw['EBBA']?.toString(),
          contract: r.raw['CONTRACT']?.toString(),
          fhaVa: r.raw['FHA/VA']?.toString(),
          compensation: r.raw['COMPENSATION']?.toString(),
          escrow: r.raw['ESCROW']?.toString(),
          lbpDisc: r.raw['LBP DISC']?.toString(),
          floodDisc: r.raw['FLOOD DISC']?.toString(),
          mlsProfile: r.raw['MLS PROFILE']?.toString(),
          spd: r.raw['SPD']?.toString(),
          addendum: r.raw['ADDENDUM']?.toString(),
          inspection: r.raw['INSPECTION']?.toString(),
          importRowNumber: r.index + 2 
        }))

      const response = await processImportBatch({
        filename: file?.name || 'unknown.xlsx',
        worksheet: worksheetName,
        rows: rowsToImport
      })

      setResult({ success: true, count: response.importedCount })
    } catch (err: any) {
      setResult({ success: false, count: 0, error: err.message })
    } finally {
      setIsSubmitting(false)
      setStep('result')
    }
  }

  const toggleRow = (index: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-black">Import Transactions</h2>
        <div className="flex gap-2 text-sm">
          <span className={`px-2 py-1 rounded ${step === 'upload' ? 'bg-brand-gold text-white font-medium' : 'text-gray-500'}`}>1. Upload</span>
          <span className={`px-2 py-1 rounded ${step === 'mapping' ? 'bg-brand-gold text-white font-medium' : 'text-gray-500'}`}>2. Mapping</span>
          <span className={`px-2 py-1 rounded ${step === 'preview' ? 'bg-brand-gold text-white font-medium' : 'text-gray-500'}`}>3. Preview</span>
        </div>
      </div>

      <div className="p-6">
        
        {step === 'upload' && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors relative">
            <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-brand-black">Upload Transaction Coordinator Excel</h3>
            <p className="text-sm text-text-muted mt-1 mb-6">Select your .xlsx file to begin the import process.</p>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="bg-brand-black text-white px-6 py-2 rounded-lg text-sm font-medium">
              Browse Files
            </button>
          </div>
        )}

        {step === 'mapping' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">File Loaded: {file?.name}</p>
                <p>We found {worksheets.length} worksheet(s). Please configure how we should read the data.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-black mb-1">Select Worksheet</label>
              <select 
                value={worksheetName}
                onChange={e => setWorksheetName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              >
                {worksheets.map(ws => <option key={ws} value={ws}>{ws}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-black mb-1">Default Year</label>
              <p className="text-xs text-gray-500 mb-2">If a date is missing the year (e.g. &quot;Sep 15&quot;), we will assume this year.</p>
              <input 
                type="number" 
                value={defaultYear}
                onChange={e => setDefaultYear(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep('upload')}
                disabled={isPreviewing}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={processData}
                disabled={isPreviewing}
                className="px-4 py-2 text-sm font-medium bg-brand-gold text-white rounded-lg flex items-center gap-1 hover:bg-yellow-600 disabled:opacity-50"
              >
                {isPreviewing ? <><Loader2 className="w-4 h-4 animate-spin"/> Processing...</> : <><ChevronRight className="w-4 h-4" /> Preview Data</>}
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-bold text-brand-black">Preview Data</h3>
                <p className="text-sm text-gray-600">Review the classifications before importing.</p>
              </div>
              <div className="text-sm">
                <span className="font-medium">{selectedRows.size}</span> of {processedRows.length} rows selected
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 z-10">
                  <tr>
                    <th className="p-3"><input type="checkbox" checked={selectedRows.size === processedRows.filter(r => r.classification !== 'Ignored').length} onChange={() => {}} disabled /></th>
                    <th className="p-3 font-semibold text-gray-700">Row</th>
                    <th className="p-3 font-semibold text-gray-700">Status</th>
                    <th className="p-3 font-semibold text-gray-700">Client Name</th>
                    <th className="p-3 font-semibold text-gray-700">Property Address</th>
                    <th className="p-3 font-semibold text-gray-700">Dates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {processedRows.map(row => (
                    <tr key={row.index} className={row.classification === 'Ignored' ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}>
                      <td className="p-3">
                        <input 
                          type="checkbox" 
                          checked={selectedRows.has(row.index)} 
                          onChange={() => toggleRow(row.index)}
                          disabled={row.classification === 'Ignored'}
                        />
                      </td>
                      <td className="p-3 text-gray-500">{row.index + 2}</td>
                      <td className="p-3">
                        {row.classification === 'New' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs"><CheckCircle className="w-3 h-3"/> New</span>}
                        {row.classification === 'Ignored' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"><XCircle className="w-3 h-3"/> Ignored</span>}
                        {row.classification === 'Possible Duplicate' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs"><AlertTriangle className="w-3 h-3"/> Duplicate?</span>}
                        {row.classification === 'Changed' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"><Info className="w-3 h-3"/> Changed</span>}
                        {row.reason && <p className="text-[10px] text-gray-500 mt-1">{row.reason}</p>}
                      </td>
                      <td className="p-3">{row.clientName || '-'}</td>
                      <td className="p-3">{row.propertyAddress || '-'}</td>
                      <td className="p-3 text-xs text-gray-500">
                        {row.effectiveDay && <div>Eff: {row.effectiveDay}</div>}
                        {row.closingDay && <div>Close: {row.closingDay}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep('mapping')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleImport}
                disabled={isSubmitting || selectedRows.size === 0}
                className="px-4 py-2 text-sm font-medium bg-brand-gold text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Importing...' : `Import ${selectedRows.size} Records`}
              </button>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <div className="text-center py-12 max-w-lg mx-auto">
            {result.success ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-brand-black mb-2">Import Successful!</h3>
                <p className="text-gray-600 mb-6">Successfully imported <b>{result.count}</b> transactions and generated their associated tasks.</p>
                <button 
                  onClick={() => router.push('/dashboard/transactions')}
                  className="bg-brand-black text-white px-6 py-2 rounded-lg text-sm font-medium"
                >
                  View Transactions
                </button>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-brand-black mb-2">Import Failed</h3>
                <p className="text-gray-600 mb-6">{result.error}</p>
                <button 
                  onClick={() => setStep('upload')}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg text-sm font-medium"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
