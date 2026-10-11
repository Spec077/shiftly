import { useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { ArrowRightIcon, CheckIcon, ClipboardTextIcon, CopyIcon, FileTextIcon, GearSixIcon, InfoIcon, ListIcon, LockKeyIcon, SparkleIcon, XIcon } from '@phosphor-icons/react'

import { parseStaffingInput } from './parser/parseStaffingInput'
import { groupByRoleAndFacility } from './parser/groupResults'
import { formatOutput } from './parser/formatOutput'
import type { ParseResult } from './parser/types'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ParseResult | null>(null)
  const [panel, setPanel] = useState<'menu' | 'settings' | null>(null)
  const [copied, setCopied] = useState('')
  const [error, setError] = useState('')
  const [pwaError, setPwaError] = useState(false)
  const [previouslyCached, setPreviouslyCached] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const resultRef = useRef<HTMLElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { offlineReady: [newlyCached] } = useRegisterSW({
    onRegisterError: () => setPwaError(true),
    onRegisteredSW: (_url, registration) => setPreviouslyCached(Boolean(registration?.active)),
  })
  const offlineReady = newlyCached || previouslyCached
  const grouped = result ? groupByRoleAndFacility(result.records) : null
  const output = grouped ? formatOutput(grouped) : ''

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(''), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  useEffect(() => {
    if (panel) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [panel])

  useEffect(() => {
    if (result) resultRef.current?.focus()
  }, [result])

  function convert() {
    if (!input.trim()) return
    const parsed = parseStaffingInput(input)
    setError('')
    setCopied('')
    setResult(parsed)
  }

  function clear() {
    setInput('')
    setResult(null)
    setCopied('')
    setError('')
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  async function paste() {
    try {
      const text = await navigator.clipboard.readText()
      if (text.length > 10000) {
        setError('Your clipboard has more than 10,000 characters. Paste a smaller list.')
      } else {
        setInput(text)
        setError(text.trim() ? '' : 'Your clipboard is empty. Copy a staffing list first.')
      }
    } catch {
      setError('Clipboard access is unavailable. Touch and hold the text box, then choose Paste.')
    }
    inputRef.current?.focus()
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output)
      setCopied('List copied')
      setError('')
    } catch {
      setError('Copy is unavailable. Touch and hold the result to select and copy it manually.')
    }
  }

  // return (
  //   <main className="app-shell">
  //     <nav className="topbar" aria-label="Main navigation">
  //       <button className="icon-button" aria-label="Open menu" onClick={() => setPanel('menu')}><ListIcon size={23} weight="bold" /></button>
  //       <button className="icon-button" aria-label="Open app information" onClick={() => setPanel('settings')}><GearSixIcon size={25} weight="bold" /></button>
  //     </nav>
  //     <header className="page-header">
  //       <div><h1>Shiftly</h1><p>Paste. Convert. Copy.</p></div>
  //       <span className={`status ${offlineReady ? '' : 'status-pending'}`}><span />{offlineReady ? 'Offline Ready' : 'On-device'}</span>
  //     </header>

  //     <div className="page-content">
  //     {!result ? <>
  //       <section className="input-card" aria-labelledby="input-heading">
  //         <h2 id="input-heading"><FileTextIcon size={25} weight="duotone" /><label htmlFor="staffing">Paste Staffing Needs</label></h2>
  //         <div className="textarea-wrap">
  //           <textarea ref={inputRef} id="staffing" maxLength={10000} placeholder="Paste the facility list here..." value={input} spellCheck={false} onChange={event => setInput(event.target.value)} aria-describedby="input-help character-count" />
  //           <span className="character-count" id="character-count">{input.length.toLocaleString()}/10,000</span>
  //         </div>
  //         <p className="input-help" id="input-help"><InfoIcon size={14} />Supports different formats, dates, and notes.</p>
  //       </section>
  //       <div className="example-row"><span>Have your list ready?</span><button className="example-button" onClick={paste}><ClipboardTextIcon size={18} />Paste</button></div>
  //     </> : <section ref={resultRef} tabIndex={-1} className="converted" aria-labelledby="result-heading">
  //       <div className="result-header"><h2 id="result-heading">{result.records.length ? <><CheckIcon size={20} />{result.reviewLines.length ? 'Converted with review items' : 'Converted successfully'}</> : 'No available shifts converted'}</h2></div>
  //       {output && <div className="result-card"><pre tabIndex={0} aria-label="Formatted staffing list">{output}</pre></div>}
  //       {result.reviewLines.length > 0 && <section className="review-panel" aria-labelledby="review-heading"><h3 id="review-heading"><InfoIcon size={19} />Needs Review ({result.reviewLines.length})</h3><p>Some entries could not be confidently converted. Check these against your original list.</p><pre>{result.reviewLines.join('\n')}</pre></section>}
  //       {!result.records.length && !result.reviewLines.length && <p className="result-note">No available shifts were found. Check that your list includes a facility, role, date, and non-zero shift counts.</p>}
  //       <div className="result-tools"><button className="example-button" onClick={() => { setResult(null); setCopied(''); setError(''); window.setTimeout(() => inputRef.current?.focus(), 0) }}>Edit input</button><button className="example-button" onClick={clear}>Clear</button></div>
  //     </section>}
  //     {error && <p className="error" role="alert">{error}</p>}
  //     </div>
  //     <p className="copy-feedback" role="status" aria-live="polite">{copied && <><CheckIcon size={17} />{copied}</>}</p>
  //     <footer className="page-footer">
  //       {!result ? <button className="convert-button" disabled={!input.trim()} onClick={convert}><span><SparkleIcon size={27} weight="duotone" />Convert</span><ArrowRightIcon className="convert-arrow" size={24} /></button> : output ? <button className="convert-button" onClick={() => copy()}><span><CopyIcon size={24} />Copy List</span></button> : <button className="convert-button" onClick={() => setResult(null)}><span>Edit staffing needs</span><ArrowRightIcon className="convert-arrow" size={24} /></button>}
  //       <p className="privacy"><LockKeyIcon size={16} />100% private. Staffing text is never stored or uploaded.</p>
  //     </footer>
  //     <dialog ref={dialogRef} className="modal" aria-label={panel === 'menu' ? 'Welcome to Shiftly' : 'About this app'} onCancel={() => setPanel(null)} onClick={event => { if (event.target === event.currentTarget) setPanel(null) }}>
  //       <div className="result-header"><h2>{panel === 'menu' ? 'Welcome to Shiftly' : 'About this app'}</h2><button className="icon-button" aria-label="Close dialog" onClick={() => setPanel(null)}><XIcon size={22} /></button></div>
  //       {panel === 'menu' ? <><p>Turn your staffing needs into a copy-ready list.</p><ol><li>Paste your facility names, roles, and shifts.</li><li>Convert and check any Needs Review entries.</li><li>Copy the list to your group chat. CNA and Nurse entries are grouped under their own headings.</li></ol><p>Three counts mean AM / PM / NOC. Two counts are accepted for Nurse entries as AM / PM.</p></> : <><p>Conversion runs entirely on this device. Your staffing text stays in memory and clears when you reload.</p><p>{offlineReady ? 'Shiftly is cached and ready to reopen offline.' : pwaError ? 'Offline setup could not finish. Reopen the app online to try again.' : 'Open the published app online once and wait for Offline Ready before using it without internet.'}</p><p>On iPhone, open the published app in Safari, tap Share, then Add to Home Screen.</p></>}
  //     </dialog>
  //   </main>
  // )
   return(
    <></>
   )


}

export default App
