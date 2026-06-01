import { describe, it, expect } from 'bun:test'

import {
  architectureTaskTypes,
  modalityTaskTypes,
  processingTaskTypes,
} from '../src/types/task-map'

describe('Generated types: architectureTaskTypes', () => {
  it('maps all image architectures to imageInference', () => {
    const imageArchitectures = ['sdxl',
      'sd3',
      'sd-1-5',
      'pony',
      'illustrious']

    for (const arch of imageArchitectures) {
      if (arch in architectureTaskTypes) {
        expect(architectureTaskTypes[arch]).toBe('imageInference')
      }
    }
  })

  it('has no empty or undefined values', () => {
    for (const [key, value] of Object.entries(architectureTaskTypes)) {
      expect(value, `architectureTaskTypes['${key}'] should not be undefined`).toBeDefined()
      expect(typeof value).toBe('string')
      expect(value.length).toBeGreaterThan(0)
    }
  })
})

describe('Generated types: modalityTaskTypes', () => {
  it('maps video to videoInference', () => {
    expect(modalityTaskTypes.video).toBe('videoInference')
  })

  it('maps audio to audioInference', () => {
    expect(modalityTaskTypes.audio).toBe('audioInference')
  })

  it('maps 3d to 3dInference', () => {
    expect(modalityTaskTypes['3d']).toBe('3dInference')
  })

  it('maps image to imageInference', () => {
    expect(modalityTaskTypes.image).toBe('imageInference')
  })

  it('maps text to textInference', () => {
    expect(modalityTaskTypes.text).toBe('textInference')
  })
})

describe('Generated types: processingTaskTypes', () => {
  it('maps processing types to correct taskTypes', () => {
    const processingMappings: Record<string, string> = {
      'caption-image': 'caption',
      'upscale-image': 'upscale',
      'remove-background-image': 'removeBackground',
      'prompt-enhance': 'promptEnhance',
      vectorize: 'vectorize',
    }

    for (const [key, expected] of Object.entries(processingMappings)) {
      if (key in processingTaskTypes) {
        expect(processingTaskTypes[key]).toBe(expected)
      }
    }
  })
})
