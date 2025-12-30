// src/components/ui/Input.jsx
// Composant Input réutilisable avec label, erreur et hint

import { memo, forwardRef } from 'react';

const Input = memo(forwardRef(function Input({
  label,
  error,
  hint,
  type = 'text',
  id,
  name,
  required,
  disabled,
  className = '',
  containerClassName = '',
  ...props
}, ref) {
  const inputId = id || name;

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''} ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        id={inputId}
        name={name}
        disabled={disabled}
        required={required}
        className={`form-field__input ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      
      {error && (
        <span id={`${inputId}-error`} className="form-field__error">
          {error}
        </span>
      )}
      
      {hint && !error && (
        <span id={`${inputId}-hint`} className="form-field__hint">
          {hint}
        </span>
      )}
    </div>
  );
}));

export default Input;

// Textarea
export const Textarea = memo(forwardRef(function Textarea({
  label,
  error,
  hint,
  id,
  name,
  required,
  rows = 3,
  className = '',
  containerClassName = '',
  ...props
}, ref) {
  const inputId = id || name;

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''} ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={inputId}
        name={name}
        required={required}
        rows={rows}
        className={`form-field__textarea ${className}`}
        {...props}
      />
      
      {error && <span className="form-field__error">{error}</span>}
      {hint && !error && <span className="form-field__hint">{hint}</span>}
    </div>
  );
}));

// Select
export const Select = memo(forwardRef(function Select({
  label,
  error,
  hint,
  id,
  name,
  required,
  options = [],
  placeholder = 'Sélectionner...',
  className = '',
  containerClassName = '',
  ...props
}, ref) {
  const inputId = id || name;

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''} ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      
      <select
        ref={ref}
        id={inputId}
        name={name}
        required={required}
        className={`form-field__select ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option 
            key={option.value || option} 
            value={option.value || option}
          >
            {option.label || option}
          </option>
        ))}
      </select>
      
      {error && <span className="form-field__error">{error}</span>}
      {hint && !error && <span className="form-field__hint">{hint}</span>}
    </div>
  );
}));

// Checkbox
export const Checkbox = memo(forwardRef(function Checkbox({
  label,
  id,
  name,
  className = '',
  ...props
}, ref) {
  const inputId = id || name;

  return (
    <label className={`form-checkbox ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        id={inputId}
        name={name}
        {...props}
      />
      <span className="form-checkbox__mark" />
      {label && <span className="form-checkbox__label">{label}</span>}
    </label>
  );
}));