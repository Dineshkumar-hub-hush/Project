import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { customersAPI } from '../api/customers'
import { SegmentBadge } from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import Pagination from '../components/ui/Pagination'
import Modal from '../components/ui/Modal'
import CustomerForm from '../components/customers/CustomerForm'
import { PageLoader, EmptyState } from '../components/ui/LoadingSpinner'
import { Plus, Pencil, Trash2, Download, Eye, Users, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

const SEGMENTS = ['All', 'VIP', 'Regular', 'New']

const EMPTY_FORM = {
  name: '', phone: '', email: '', address: '', style_preferences: '', notes: '', segment: 'Regular'
}

export default function Customers() {
  const navigate = useNavigate()
  const [data, setData]         = useState({ data: [], total: 0, pages: 1 })
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [phoneSearch, setPhone] = useState('')
  const [segment, setSegment]   = useState('All')
  const [modal, setModal]       = useState(null) // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: 15 }
      if (search) params.search = search
      if (phoneSearch) params.phone = phoneSearch
      if (segment !== 'All') params.segment = segment
      const res = await customersAPI.list(params)
      setData(res)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [page, search, phoneSearch, segment])

  useEffect(() => { fetchData() }, [fetchData])

  const openAdd = () => { setForm(EMPTY_FORM); setSelected(null); setModal('add') }
  const openEdit = (c) => { setForm({ name: c.name, phone: c.phone||'', email: c.email||'', address: c.address||'', style_preferences: c.style_preferences||'', notes: c.notes||'', segment: c.segment||'Regular' }); setSelected(c); setModal('edit') }
  
  const openDelete = (c) => { setSelected(c); setModal('delete') }

  const handleSave = async (formData) => {
    if (!formData.name || !formData.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      if (modal === 'add') {
        await customersAPI.create(formData)
        toast.success('Customer added 🌸')
      } else {
        await customersAPI.update(selected.id, formData)
        toast.success('Customer updated')
      }
      setModal(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving customer')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await customersAPI.delete(selected.id)
      toast.success('Customer deleted')
      setModal(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    const params = {}
    if (search) params.search = search
    if (segment !== 'All') params.segment = segment
    customersAPI.exportCSV(params)
    toast.success('Downloading CSV…')
  }

  const Field = ({ label, id, ...props }) => (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} className="input-field" {...props} />
    </div>
  )

  return (
    <div className="space-y-5 max-w-screen-xl">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
          <div className="w-52">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by name…" onClear={() => setPage(1)} />
          </div>
          <div className="w-44">
            <SearchInput value={phoneSearch} onChange={setPhone} placeholder="Search phone…" onClear={() => setPage(1)} />
          </div>
          <select
            value={segment}
            onChange={(e) => { setSegment(e.target.value); setPage(1) }}
            className="input-field w-auto py-2 text-sm"
          >
            {SEGMENTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary text-sm py-2">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={openAdd} className="btn-primary text-sm py-2">
            <Plus size={15} /> Add Customer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <PageLoader /> : data.data.length === 0 ? (
            <EmptyState message="No customers found" icon={Users} />
          ) : (
            <table className="w-full">
              <thead className="border-b border-dark-500 bg-dark-800/50">
                <tr>
                  <th className="th">Name</th>
                  <th className="th hidden sm:table-cell">Phone</th>
                  <th className="th hidden md:table-cell">Email</th>
                  <th className="th">Segment</th>
                  <th className="th hidden lg:table-cell text-right">Spending</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((c) => (
                  <tr key={c.id} className="table-row">
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {c.name[0].toUpperCase()}
                        </div>
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="td hidden sm:table-cell text-gray-400">
                      <span className="flex items-center gap-1"><Phone size={12} />{c.phone || '—'}</span>
                    </td>
                    <td className="td hidden md:table-cell text-gray-400 text-xs">{c.email || '—'}</td>
                    <td className="td"><SegmentBadge segment={c.segment} /></td>
                    <td className="td hidden lg:table-cell text-right text-gold-400 font-semibold">
                      ₹{Number(c.total_spending || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="td">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => navigate(`/customers/${c.id}`)} className="p-1.5 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-gray-200 transition-colors" title="View">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-brand-400 transition-colors" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => openDelete(c)} className="p-1.5 rounded-lg hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && data.pages > 1 && (
          <div className="px-4 py-3 border-t border-dark-500 flex items-center justify-between">
            <p className="text-xs text-gray-500">{data.total} customers total</p>
            <Pagination page={page} pages={data.pages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add New Customer' : 'Edit Customer'}>
        <CustomerForm
          initialValues={form}
          onSubmit={handleSave}
          onCancel={() => setModal(null)}
          saving={saving}
          mode={modal === 'add' ? 'add' : 'edit'}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={modal === 'delete'} onClose={() => setModal(null)} title="Delete Customer" size="sm">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-600/20 flex items-center justify-center mx-auto">
            <Trash2 size={24} className="text-red-400" />
          </div>
          <p className="text-gray-300">Delete <strong className="text-white">{selected?.name}</strong>?</p>
          <p className="text-sm text-gray-500">This will permanently delete the customer and all their purchase history.</p>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1 justify-center">
              {saving ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
