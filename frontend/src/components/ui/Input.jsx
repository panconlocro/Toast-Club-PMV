function Input({
  as = 'input',
  label,
  id,
  className = '',
  helper,
  error,
  ...props
}) {
  const Element = as
  return (
    <div className="ui-field">
      {label && (
        <label className="ui-label" htmlFor={id}>
          {label}
        </label>
      )}
      <Element id={id} className={`ui-input ${className}`.trim()} {...props} />
      {helper && !error && <span className="ui-helper">{helper}</span>}
      {error && <span className="ui-helper ui-helper--error">{error}</span>}
    </div>
  )
}

export default Input
