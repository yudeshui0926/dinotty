import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

// Regression test for the upload-file-input ref binding used in
// FileWorkspacePreview.vue. A static `ref="ops.fileInputRef"` attribute is
// treated by Vue as a literal string key and never writes back to the
// nested composable ref, leaving fileInputRef.value permanently undefined
// so triggerUpload()'s `fileInputRef.value?.click()` silently no-ops. The
// fix binds it dynamically with `:ref="ops.fileInputRef"` so Vue detects
// the bound value is a Ref and assigns element.value directly.
describe('upload input ref binding', () => {
  it('does NOT populate the ref when bound as a static string (old, broken pattern)', async () => {
    const ops = { fileInputRef: ref<HTMLInputElement>() }
    const Comp = defineComponent({
      render: () => h('input', { ref: 'ops.fileInputRef', type: 'file' }),
    })
    mount(Comp)
    expect(ops.fileInputRef.value).toBeUndefined()
  })

  it('populates the ref when bound dynamically (fixed pattern)', async () => {
    const ops = { fileInputRef: ref<HTMLInputElement>() }
    const Comp = defineComponent({
      render: () => h('input', { ref: ops.fileInputRef, type: 'file' }),
    })
    mount(Comp)
    expect(ops.fileInputRef.value).toBeInstanceOf(HTMLInputElement)
    expect(ops.fileInputRef.value?.click).toBeInstanceOf(Function)
  })
})
