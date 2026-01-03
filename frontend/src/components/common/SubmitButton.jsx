import React from 'react';

export default function SubmitButton({ 
  loading, 
  loadingText = 'Loading...', 
  text = 'Submit', 
  icon: Icon,
  disabled = false,
  className = ''
}) {
  const isDisabled = loading || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`
        w-full flex items-center justify-center gap-2 py-3 rounded-lg 
        font-semibold text-white transition-all
        ${isDisabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-700'
        }
        ${className}
      `}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          {loadingText}
        </>
      ) : (
        <>
          {Icon && <Icon size={20} />}
          {text}
        </>
      )}
    </button>
  );
}
