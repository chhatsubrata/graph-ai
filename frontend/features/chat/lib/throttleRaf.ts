/**
 * Batch rapid updates on requestAnimationFrame (optional shared helper).
 */
export function createRafBatcher<T>(flush: (items: T[]) => void) {
  const queue: T[] = []
  let raf = 0

  const run = () => {
    raf = 0
    const batch = queue.splice(0, queue.length)
    if (batch.length) flush(batch)
  }

  return {
    push(item: T) {
      queue.push(item)
      if (!raf) raf = requestAnimationFrame(run)
    },
    cancel() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      queue.length = 0
    },
  }
}
