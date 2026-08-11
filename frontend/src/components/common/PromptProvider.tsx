import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal } from './Modal';

interface PromptContextType {
  showPrompt: (title: string, defaultValue?: string) => Promise<string | null>;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const usePrompt = () => {
  const context = useContext(PromptContext);
  if (!context) throw new Error('usePrompt must be used within PromptProvider');
  return context.showPrompt;
};

export const PromptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [resolveFn, setResolveFn] = useState<(val: string | null) => void>(() => {});

  const showPrompt = (promptTitle: string, defaultValue = '') => {
    setTitle(promptTitle);
    setValue(defaultValue);
    setIsOpen(true);
    return new Promise<string | null>((resolve) => {
      setResolveFn(() => resolve);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    resolveFn(value);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveFn(null);
  };

  return (
    <PromptContext.Provider value={{ showPrompt }}>
      {children}
      <Modal isOpen={isOpen} onClose={handleCancel} title={title}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 font-medium"
            >
              Submit
            </button>
          </div>
        </form>
      </Modal>
    </PromptContext.Provider>
  );
};
