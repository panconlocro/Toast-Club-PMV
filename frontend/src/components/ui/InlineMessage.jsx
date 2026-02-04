function InlineMessage({ variant = 'info', className = '', children }) {
  return (
    <div className={`ui-alert ui-alert--${variant} ${className}`.trim()}>{children}</div>
  )
}

export default InlineMessage
