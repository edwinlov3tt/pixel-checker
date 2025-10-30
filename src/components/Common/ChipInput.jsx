import { useState } from 'react';
import { X } from 'lucide-react';

export default function ChipInput({ label, value = [], onChange, placeholder, type = 'text' }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    const trimmedValue = inputValue.trim();

    // Add chip on Enter, comma, or space
    if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && trimmedValue) {
      e.preventDefault();

      // Validate email if needed
      if (type === 'email' && !isValidEmail(trimmedValue)) {
        return;
      }

      // Add to array if not already present
      if (!value.includes(trimmedValue)) {
        onChange([...value, trimmedValue]);
      }

      setInputValue('');
    }

    // Remove last chip on backspace if input is empty
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');

    // Split by comma, semicolon, or newline
    const emails = pastedText
      .split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => {
        if (!email) return false;
        if (type === 'email') return isValidEmail(email);
        return true;
      })
      .filter(email => !value.includes(email));

    if (emails.length > 0) {
      onChange([...value, ...emails]);
    }
  };

  const removeChip = (indexToRemove) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>

      <div className="min-h-[42px] px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus-within:border-[#CF0E0F] transition-colors">
        <div className="flex flex-wrap gap-2">
          {/* Chips */}
          {value.map((chip, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[#CF0E0F]/20 text-[#CF0E0F] rounded text-sm font-medium"
            >
              {chip}
              <button
                type="button"
                onClick={() => removeChip(index)}
                className="hover:bg-[#CF0E0F]/30 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] bg-transparent text-white placeholder-gray-500 outline-none"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Press Enter, comma, or space to add. Backspace to remove.
      </p>
    </div>
  );
}
