'use client';

import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';

export interface FilterGroup {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface FilterDropdownProps {
  groups: FilterGroup[];
  filters: Record<string, string | null>;
  onChange: (key: string, value: string | null) => void;
  onClear: () => void;
  buttonLabel: string;
  clearLabel: string;
}

export default function FilterDropdown({
  groups,
  filters,
  onChange,
  onClear,
  buttonLabel,
  clearLabel,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeCount = Object.values(filters).filter(v => v !== null).length;
  const hasActive = activeCount > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border font-semibold text-sm transition-all ${
          hasActive
            ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-md shadow-[#3B82F6]/20'
            : 'bg-card border-border text-[#0D1B4B] dark:text-foreground hover:border-[#3B82F6]/50'
        }`}
      >
        <SlidersHorizontal size={15} />
        {buttonLabel}
        {hasActive && (
          <span className="ml-0.5 w-5 h-5 flex items-center justify-center bg-white/25 rounded-full text-[10px] font-black">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0D1B4B] border border-border rounded-2xl shadow-2xl z-50 p-5">
          <div className="space-y-5">
            {groups.map(group => (
              <div key={group.key}>
                <p className="text-[11px] font-black uppercase tracking-wider text-[#0D1B4B] dark:text-white/60 mb-2.5">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.options.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        onChange(group.key, filters[group.key] === opt.value ? null : opt.value)
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        filters[group.key] === opt.value
                          ? 'bg-[#3B82F6] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-white/10 text-[#0D1B4B] dark:text-white/80 hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] dark:hover:text-[#3B82F6]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {hasActive && (
            <div className="mt-5 pt-4 border-t border-border/60">
              <button
                onClick={() => { onClear(); setOpen(false); }}
                className="text-xs text-[#3B82F6] hover:underline font-semibold"
              >
                {clearLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
