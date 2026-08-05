import { useState } from 'react';

const TransactionFormEngine = ({ onSubmit, initialData = {}, isLoading = false }) => {
  const [formData, setFormData] = useState({
    date: initialData.date || new Date().toISOString().split('T')[0],
    category: initialData.category || 'expense',
    amount: initialData.amount || '',
    note: initialData.note || '',
    // Income fields
    source: initialData.source || '',
    // Expense fields
    expense_type: initialData.expense_type || '',
    custom_expense_type: initialData.custom_expense_type || '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const preparePayload = () => {
    const payload = {
      date: formData.date,
      category: formData.category,
      amount: parseFloat(formData.amount),
      note: formData.note || null,
      details: {},
    };

    // Income logic
    if (formData.category === 'income') {
      payload.details.source = formData.source;
    }

    // Expense logic
    if (formData.category === 'expense') {
      const resolvedExpenseType = formData.expense_type === 'Others'
        ? formData.custom_expense_type
        : formData.expense_type;

      payload.details.expense_type = resolvedExpenseType;
    }

    // Remove empty details object if no details present
    if (Object.keys(payload.details).length === 0) {
      delete payload.details;
    }

    return payload;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = preparePayload();
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Base Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
        <input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., 50.00"
          required
        />
      </div>

      {/* Income Fields */}
      {formData.category === 'income' && (
        <div className="space-y-4 p-4 bg-green-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Salary, Freelance"
              required
            />
          </div>
        </div>
      )}

      {/* Expense Fields */}
      {formData.category === 'expense' && (
        <div className="space-y-4 p-4 bg-red-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expense Type</label>
            <select
              value={formData.expense_type}
              onChange={(e) => handleChange('expense_type', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select expense type</option>
              <option value="Petrol">Petrol</option>
              <option value="Lunch">Lunch</option>
              <option value="Others">Others</option>
            </select>
          </div>
          {formData.expense_type === 'Others' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Custom Expense Type</label>
              <input
                type="text"
                value={formData.custom_expense_type}
                onChange={(e) => handleChange('custom_expense_type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Groceries, Utilities"
                required
              />
            </div>
          )}
        </div>
      )}

      {/* Note field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
        <textarea
          value={formData.note}
          onChange={(e) => handleChange('note', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows="3"
          placeholder="Add any additional notes..."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Submitting...' : 'Submit Transaction'}
      </button>
    </form>
  );
};

export default TransactionFormEngine;