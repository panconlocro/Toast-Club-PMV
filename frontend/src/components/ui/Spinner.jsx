function Spinner({ label = 'Cargando...' }) {
  return <span className="ui-spinner" role="status" aria-label={label} />
}

export default Spinner
