import React from 'react';

export default function AlertMessage({ type, message }) {
  if (!message) return null;

  const styles = {
    success: {
      container: 'bg-green-50 border border-green-200',
      text: 'text-green-800'
    },
    error: {
      container: 'bg-red-50 border border-red-200',
      text: 'text-red-800'
    },
    warning: {
      container: 'bg-yellow-50 border border-yellow-200',
      text: 'text-yellow-800'
    },
    info: {
      container: 'bg-blue-50 border border-blue-200',
      text: 'text-blue-800'
    }
  };

  const style = styles[type] || styles.info;

  return (
    <div className={`mb-6 p-4 rounded-lg ${style.container}`}>
      <p className={`${style.text} text-sm font-medium`}>{message}</p>
    </div>
  );
}
