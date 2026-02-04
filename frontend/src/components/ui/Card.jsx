function Card({ title, subtitle, className = '', children }) {
  return (
    <section className={`ui-card ${className}`.trim()}>
      {(title || subtitle) && (
        <header className="ui-card__header">
          {title && <h2 className="ui-card__title">{title}</h2>}
          {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
        </header>
      )}
      <div className="ui-card__content">{children}</div>
    </section>
  )
}

export default Card
