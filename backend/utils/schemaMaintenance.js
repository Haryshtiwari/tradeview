/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const { executeQuery } = require('../config/database');

async function ensurePositionsCloseColumns() {
  try {
    const columns = await executeQuery("SHOW COLUMNS FROM positions WHERE Field IN ('closed_at', 'close_time', 'close_reason')")
    const hasClosedAt = columns.some((column) => column.Field === 'closed_at')
    const hasCloseTime = columns.some((column) => column.Field === 'close_time')
    const hasCloseReason = columns.some((column) => column.Field === 'close_reason')

    if (!hasClosedAt && !hasCloseTime && !hasCloseReason) {
      await executeQuery(
        "ALTER TABLE positions ADD COLUMN closed_at TIMESTAMP NULL, ADD COLUMN close_time TIMESTAMP NULL, ADD COLUMN close_reason ENUM('manual','stop_loss','take_profit','margin_call','system') DEFAULT 'manual'"
      )
    } else {
      if (!hasClosedAt) {
        await executeQuery("ALTER TABLE positions ADD COLUMN closed_at TIMESTAMP NULL")
      }
      if (!hasCloseTime) {
        await executeQuery("ALTER TABLE positions ADD COLUMN close_time TIMESTAMP NULL")
      }
      if (!hasCloseReason) {
        await executeQuery(
          "ALTER TABLE positions ADD COLUMN close_reason ENUM('manual','stop_loss','take_profit','margin_call','system') DEFAULT 'manual'"
        )
      }
    }

    if (!hasClosedAt || !hasCloseTime || !hasCloseReason) {
      // backfill closed_at for already closed positions
      await executeQuery("UPDATE positions SET closed_at = updated_at WHERE status = 'closed' AND closed_at IS NULL")
      await executeQuery("UPDATE positions SET close_time = COALESCE(close_time, closed_at, updated_at) WHERE status = 'closed' AND close_time IS NULL")
    }

    const closedAtIndex = await executeQuery(
      "SHOW INDEX FROM positions WHERE Key_name = 'idx_positions_closed_at'"
    )
    if (!closedAtIndex.length) {
      try {
        await executeQuery('CREATE INDEX idx_positions_closed_at ON positions(closed_at)')
      } catch (error) {
        if (!error.message.includes('Duplicate key name')) {
          throw error
        }
      }
    }

    const closeTimeIndex = await executeQuery(
      "SHOW INDEX FROM positions WHERE Key_name = 'idx_positions_close_time'"
    )
    if (!closeTimeIndex.length) {
      try {
        await executeQuery('CREATE INDEX idx_positions_close_time ON positions(close_time)')
      } catch (error) {
        if (!error.message.includes('Duplicate key name')) {
          throw error
        }
      }
    }

    const closeReasonIndex = await executeQuery(
      "SHOW INDEX FROM positions WHERE Key_name = 'idx_positions_close_reason'"
    )
    if (!closeReasonIndex.length) {
      try {
        await executeQuery('CREATE INDEX idx_positions_close_reason ON positions(close_reason)')
      } catch (error) {
        if (!error.message.includes('Duplicate key name')) {
          throw error
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to ensure position close columns:', error)
  }
}

module.exports = { ensurePositionsCloseColumns };
