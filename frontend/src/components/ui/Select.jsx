function Select({ label, id, className = '', children, ...props }) {
  return (
    <div className="ui-field">
      {label && (
        <label className="ui-label" htmlFor={id}>
          {label}
        </label>
      )}
      <select id={id} className={`ui-input ui-select ${className}`.trim()} {...props}>
        {children}
      </select>
    </div>
  )
}

export default Select
