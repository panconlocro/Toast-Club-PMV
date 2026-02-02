function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  const classes = `ui-button ui-button--${variant} ui-button--${size} ${className}`.trim()
  return <button type={type} className={classes} {...props} />
}

export default Button
