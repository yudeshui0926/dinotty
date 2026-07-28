import { ref, computed } from 'vue'
import { describe, expect, it } from 'vitest'

// Mirrors the drag-highlight bookkeeping in useFileOperations. Tree folder
// rows call stopPropagation() on drop, so the workspace-level drop handler
// (which is what zeroes the counter) never runs for a drop onto a folder.
// Without an explicit reset the counter stays above zero and the blue drop
// outline stays lit forever.
function makeDragState() {
  const dragCounter = ref(0)
  const dragging = computed(() => dragCounter.value > 0)
  return {
    dragging,
    dragEnter: () => dragCounter.value++,
    dragLeave: () => (dragCounter.value = Math.max(0, dragCounter.value - 1)),
    resetDragState: () => (dragCounter.value = 0),
  }
}

describe('workspace drag highlight reset', () => {
  it('stays lit when a folder-row drop swallows the event and nothing resets', () => {
    const s = makeDragState()
    s.dragEnter() // entered workspace body
    s.dragEnter() // entered tree wrapper
    // folder row handled the drop and stopped propagation — no reset happens
    expect(s.dragging.value).toBe(true)
  })

  it('clears once resetDragState runs, regardless of counter depth', () => {
    const s = makeDragState()
    s.dragEnter()
    s.dragEnter()
    s.dragEnter()
    s.resetDragState()
    expect(s.dragging.value).toBe(false)
  })

  it('never goes negative when leave outnumbers enter', () => {
    const s = makeDragState()
    s.dragEnter()
    s.dragLeave()
    s.dragLeave()
    s.resetDragState()
    s.dragEnter()
    expect(s.dragging.value).toBe(true)
  })
})
