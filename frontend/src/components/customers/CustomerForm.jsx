import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function CustomerForm({ initialValues, onSubmit, onCancel, saving, mode = 'add' }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', style_preferences: '', notes: '', segment: 'Regular' })
  const [errors, setErrors] = useState({})

  useEffect(() => { setForm((s) => ({ ...s, ...initialValues })) }, [initialValues])

  const validate = (values) => {
    const e = {}
    if (!values.name || !values.name.trim()) e.name = 'Name is required'
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Invalid email'
    if (values.phone && !/^\+?[0-9 ]{7,15}$/.test(values.phone)) e.phone = 'Invalid phone'
    return e
  }

  const handleChange = (field) => (e) => {
    setForm((s) => ({ ...s, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate(form)
    if (Object.keys(e2).length) { setErrors(e2); toast.error('Please fix form errors'); return }
    await onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="c-name" className="label">Full Name *</label>
        <input id="c-name" name="name" className="input-field" value={form.name} onChange={handleChange('name')} placeholder="Priya Sharma" />
        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="c-phone" className="label">Phone</label>
          <input id="c-phone" name="phone" className="input-field" value={form.phone} onChange={handleChange('phone')} placeholder="98765 43210" />
          {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="c-email" className="label">Email</label>
          <input id="c-email" name="email" type="email" className="input-field" value={form.email} onChange={handleChange('email')} placeholder="priya@example.com" />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="c-segment" className="label">Segment</label>
          <select id="c-segment" name="segment" value={form.segment} onChange={handleChange('segment')} className="input-field w-full">
            <option>VIP</option>
            <option>Regular</option>
            <option>New</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Address</label>
        <textarea name="address" value={form.address} onChange={handleChange('address')} rows={2} placeholder="Full address…" className="input-field resize-none" />
      </div>

      <div>
        <label className="label">Style Preferences</label>
        <textarea name="style_preferences" value={form.style_preferences} onChange={handleChange('style_preferences')} rows={2} placeholder="e.g. Silk sarees, pastel colours…" className="input-field resize-none" />
      </div>

      <div>
        <label className="label">Internal Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange('notes')} rows={2} placeholder="Any special instructions or observations…" className="input-field resize-none" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? (mode === 'add' ? 'Adding…' : 'Saving…') : (mode === 'add' ? 'Add Customer' : 'Save Changes')}</button>
      </div>
    </form>
  )
}
