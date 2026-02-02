/**
 * @typedef {Object} Recording
 * @property {string} id
 * @property {string} [created_at]
 * @property {string} [download_url]
 */

/**
 * @typedef {Object} Survey
 * @property {string} id
 * @property {string} created_at
 * @property {Object} respuestas_json
 */

/**
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} session_id
 * @property {string} session_code
 * @property {string} estado
 * @property {string} created_at
 * @property {number} recordings_count
 * @property {number} surveys_count
 * @property {Object} datos_participante
 * @property {string} [participant_name]
 * @property {string} [participant_email]
 * @property {number} [participant_age]
 * @property {Object|string} [texto_seleccionado]
 * @property {Recording[]} [recordings]
 */

/** @type {Recording} */
export const Recording = null

/** @type {Survey} */
export const Survey = null

/** @type {Session} */
export const Session = null
