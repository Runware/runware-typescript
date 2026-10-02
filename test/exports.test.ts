/**
 * Every modality / processing params type in SchemaMap is importable from the
 * package entry point, alongside its result type. This file fails `typecheck`
 * if one goes missing from src/index.ts.
 */
import { describe, it, expect } from 'bun:test'

import type {
  AudioInferenceParams,
  CaptionImageParams,
  CaptionParams,
  CaptionVideoParams,
  ControlnetPreprocessParams,
  ImageInferenceParams,
  MaskingParams,
  PromptEnhanceParams,
  RemoveBackgroundImageParams,
  RemoveBackgroundParams,
  RemoveBackgroundVideoParams,
  SchemaMap,
  TextInferenceParams,
  ThreeDInferenceParams,
  TrainingParams,
  UpscaleImageParams,
  UpscaleParams,
  UpscaleVideoParams,
  VectorizeParams,
  VideoInferenceParams,
} from '../src/index'

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

describe('entry point param type exports', () => {
  it('re-exports the params type for every modality and operation', () => {
    const checks: Array<true> = [
      true satisfies Same<AudioInferenceParams, SchemaMap['audio']['params']>,
      true satisfies Same<ImageInferenceParams, SchemaMap['image']['params']>,
      true satisfies Same<TextInferenceParams, SchemaMap['text']['params']>,
      true satisfies Same<VideoInferenceParams, SchemaMap['video']['params']>,
      true satisfies Same<ThreeDInferenceParams, SchemaMap['3d']['params']>,
      true satisfies Same<CaptionParams, SchemaMap['caption']['params']>,
      true satisfies Same<CaptionImageParams, SchemaMap['caption-image']['params']>,
      true satisfies Same<CaptionVideoParams, SchemaMap['caption-video']['params']>,
      true satisfies Same<ControlnetPreprocessParams, SchemaMap['controlnet-preprocess']['params']>,
      true satisfies Same<MaskingParams, SchemaMap['masking']['params']>,
      true satisfies Same<PromptEnhanceParams, SchemaMap['prompt-enhance']['params']>,
      true satisfies Same<RemoveBackgroundParams, SchemaMap['remove-background']['params']>,
      true satisfies Same<
        RemoveBackgroundImageParams, SchemaMap['remove-background-image']['params']
      >,
      true satisfies Same<
        RemoveBackgroundVideoParams, SchemaMap['remove-background-video']['params']
      >,
      true satisfies Same<TrainingParams, SchemaMap['training']['params']>,
      true satisfies Same<UpscaleParams, SchemaMap['upscale']['params']>,
      true satisfies Same<UpscaleImageParams, SchemaMap['upscale-image']['params']>,
      true satisfies Same<UpscaleVideoParams, SchemaMap['upscale-video']['params']>,
      true satisfies Same<VectorizeParams, SchemaMap['vectorize']['params']>,
    ]
    expect(checks.every(Boolean)).toBe(true)
  })
})
