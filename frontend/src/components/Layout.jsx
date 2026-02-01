function Layout({ title, subtitle, children }) {
  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__title-group">
          <h1 className="layout__title">{title}</h1>
          {subtitle && <p className="layout__subtitle">{subtitle}</p>}
        </div>
      </header>
      <div className="layout__content">{children}</div>
    </div>
  )
}

export default Layout
