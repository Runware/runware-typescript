/**
 * AUTO-GENERATED from schema-map@20260619230808 — do not edit manually.
 * Run: bun run scripts/generate-types.ts
 */

/**
 * exactly-illustrative architecture params.
 */
export type ExactlyIllustrativeParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Reference images for guiding generation. Each entry specifies an image, its purpose, and optional strength. */
  referenceImages?: ({
  /** The purpose of this reference image. */
  type: 'sketch' | 'reference'
  /** Influence strength of the reference image. Only available when type is `sketch`. */
  strength?: number
  /** Image input (UUID, URL, Data URI, or Base64). */
  image: unknown
})[]
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Global inference settings. */
  settings?: {
  /** Generation quality level. */
  quality?: 'low' | 'high'
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * flux-1-dev architecture params.
 */
export type Flux1DevParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** First Block Cache (FBCache) acceleration. Reuses feature block computations across steps. */
  fbCache?: boolean
  /** Controls the sensitivity threshold for determining when to reuse cached computations. Lower values reuse more aggressively. */
  fbCacheThreshold?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DB Cache (CacheDiT) acceleration. Caches and reuses intermediate transformer block outputs to skip redundant computations. */
  dbCache?: boolean
  /** Controls the sensitivity threshold for DB Cache. Lower values reuse cached blocks more aggressively, higher values prioritize quality. */
  dbCacheThreshold?: number
  /** Controls how many steps to skip between cache refreshes. Higher values skip more steps for faster generation at the cost of quality. */
  dbCacheSkipInterval?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:25@1' | 'runware:26@1' | 'runware:27@1' | 'runware:28@1' | 'runware:29@1' | 'runware:30@1' | 'runware:31@1' | 'runware:98@1'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for IP-Adapter image-prompted generation. */
  ipAdapters?: ({
  /** IP-Adapter model identifier. */
  model: 'runware:56@1' | 'runware:56@2' | 'runware:56@3' | 'runware:56@4'
  /** Strength of the IP-Adapter influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the reference. */
  weight?: number
  /** Images to guide the IP-Adapter (UUID, URL, Data URI, or Base64). */
  guideImages: unknown[]
  /** Controls how multiple reference images are combined. */
  combineMethod?: 'concat' | 'add' | 'subtract' | 'average' | 'norm_average'
  /** Determines which embedding components are used and their strength. */
  embedScaling?: 'only_v' | 'kv' | 'kv_penalty_c' | 'k_mean_v_penalty_c'
  /** Shapes how influence evolves during generation. */
  weightType?: 'normal' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'weak_input' | 'weak_output' | 'weak_middle' | 'strong_middle' | 'style_transfer' | 'composition' | 'strong_style_transfer' | 'style_and_composition' | 'strong_style_and_composition'
  /** Controls composition/layout influence specifically. */
  weightComposition?: number
})[]
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** LayerDiffuse for transparent image generation. */
  layerDiffuse?: boolean
  /** Identity customization for character consistency. */
  pulid?: {
  /** Absolute step number to start identity influence. Must be less than `steps`. */
  CFGstartStep?: number
  /** Percentage of steps to start identity influence. */
  CFGstartStepPercentage?: number
  /** Identity preservation strength. Higher values create closer resemblance to the reference face. */
  idWeight?: number
  /** Reference images for identity customization (UUID, URL, Data URI, or Base64). */
  images: unknown[]
  /** Guidance scale for identity embedding. */
  trueCFGScale?: number
}
  /** True Classifier-Free Guidance scale. Higher values increase prompt adherence at the cost of quality. */
  trueCFGScale?: number
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * flux-1-kontext-dev architecture params.
 */
export type Flux1KontextDevParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** List of reference images (UUID, URL, Data URI, or Base64). */
  referenceImages?: unknown[]
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width?: number
  /** Height of the generated media in pixels. */
  height?: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** First Block Cache (FBCache) acceleration. Reuses feature block computations across steps. */
  fbCache?: boolean
  /** Controls the sensitivity threshold for determining when to reuse cached computations. Lower values reuse more aggressively. */
  fbCacheThreshold?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DB Cache (CacheDiT) acceleration. Caches and reuses intermediate transformer block outputs to skip redundant computations. */
  dbCache?: boolean
  /** Controls the sensitivity threshold for DB Cache. Lower values reuse cached blocks more aggressively, higher values prioritize quality. */
  dbCacheThreshold?: number
  /** Controls how many steps to skip between cache refreshes. Higher values skip more steps for faster generation at the cost of quality. */
  dbCacheSkipInterval?: number
}
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** True Classifier-Free Guidance scale. Higher values increase prompt adherence at the cost of quality. */
  trueCFGScale?: number
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * flux-1-schnell architecture params.
 */
export type Flux1SchnellParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** First Block Cache (FBCache) acceleration. Reuses feature block computations across steps. */
  fbCache?: boolean
  /** Controls the sensitivity threshold for determining when to reuse cached computations. Lower values reuse more aggressively. */
  fbCacheThreshold?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DB Cache (CacheDiT) acceleration. Caches and reuses intermediate transformer block outputs to skip redundant computations. */
  dbCache?: boolean
  /** Controls the sensitivity threshold for DB Cache. Lower values reuse cached blocks more aggressively, higher values prioritize quality. */
  dbCacheThreshold?: number
  /** Controls how many steps to skip between cache refreshes. Higher values skip more steps for faster generation at the cost of quality. */
  dbCacheSkipInterval?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** True Classifier-Free Guidance scale. Higher values increase prompt adherence at the cost of quality. */
  trueCFGScale?: number
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * illustrious architecture params.
 */
export type IllustriousParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Number of layers to skip in the CLIP model. */
  clipSkip?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DeepCache acceleration. Skips transformer computations in certain steps to speed up generation. */
  deepCache?: boolean
  /** Interval for DeepCache acceleration. A value of 2 skips every other step, 3 skips two out of three, etc. */
  deepCacheInterval?: number
  /** Branch ID for DeepCache acceleration. Determines which U-Net layers are skipped. */
  deepCacheBranchId?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:20@1' | 'runware:3@1'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for IP-Adapter image-prompted generation. */
  ipAdapters?: ({
  /** IP-Adapter model identifier. */
  model: 'runware:55@1' | 'runware:55@2' | 'runware:55@3' | 'runware:55@4'
  /** Strength of the IP-Adapter influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the reference. */
  weight?: number
  /** Images to guide the IP-Adapter (UUID, URL, Data URI, or Base64). */
  guideImages: unknown[]
  /** Controls how multiple reference images are combined. */
  combineMethod?: 'concat' | 'add' | 'subtract' | 'average' | 'norm_average'
  /** Determines which embedding components are used and their strength. */
  embedScaling?: 'only_v' | 'kv' | 'kv_penalty_c' | 'k_mean_v_penalty_c'
  /** Shapes how influence evolves during generation. */
  weightType?: 'normal' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'weak_input' | 'weak_output' | 'weak_middle' | 'strong_middle' | 'style_transfer' | 'composition' | 'strong_style_transfer' | 'style_and_composition' | 'strong_style_and_composition'
  /** Controls composition/layout influence specifically. */
  weightComposition?: number
})[]
  /** Configuration for running a refiner model on top of the base model output. */
  refiner?: {
  /** Refiner model identifier. */
  model: 'runware:101055@128080'
  /** Absolute step number to switch from the base model to the refiner. */
  startStep?: number
  /** Percentage of total steps at which to switch from the base model to the refiner. */
  startStepPercentage?: number
}
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * noobai architecture params.
 */
export type NoobaiParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Number of layers to skip in the CLIP model. */
  clipSkip?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DeepCache acceleration. Skips transformer computations in certain steps to speed up generation. */
  deepCache?: boolean
  /** Interval for DeepCache acceleration. A value of 2 skips every other step, 3 skips two out of three, etc. */
  deepCacheInterval?: number
  /** Branch ID for DeepCache acceleration. Determines which U-Net layers are skipped. */
  deepCacheBranchId?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:20@1' | 'runware:3@1'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for IP-Adapter image-prompted generation. */
  ipAdapters?: ({
  /** IP-Adapter model identifier. */
  model: 'runware:55@1' | 'runware:55@2' | 'runware:55@3' | 'runware:55@4'
  /** Strength of the IP-Adapter influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the reference. */
  weight?: number
  /** Images to guide the IP-Adapter (UUID, URL, Data URI, or Base64). */
  guideImages: unknown[]
  /** Controls how multiple reference images are combined. */
  combineMethod?: 'concat' | 'add' | 'subtract' | 'average' | 'norm_average'
  /** Determines which embedding components are used and their strength. */
  embedScaling?: 'only_v' | 'kv' | 'kv_penalty_c' | 'k_mean_v_penalty_c'
  /** Shapes how influence evolves during generation. */
  weightType?: 'normal' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'weak_input' | 'weak_output' | 'weak_middle' | 'strong_middle' | 'style_transfer' | 'composition' | 'strong_style_transfer' | 'style_and_composition' | 'strong_style_and_composition'
  /** Controls composition/layout influence specifically. */
  weightComposition?: number
})[]
  /** Configuration for running a refiner model on top of the base model output. */
  refiner?: {
  /** Refiner model identifier. */
  model: 'runware:101055@128080'
  /** Absolute step number to switch from the base model to the refiner. */
  startStep?: number
  /** Percentage of total steps at which to switch from the base model to the refiner. */
  startStepPercentage?: number
}
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * pony architecture params.
 */
export type PonyParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Number of layers to skip in the CLIP model. */
  clipSkip?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DeepCache acceleration. Skips transformer computations in certain steps to speed up generation. */
  deepCache?: boolean
  /** Interval for DeepCache acceleration. A value of 2 skips every other step, 3 skips two out of three, etc. */
  deepCacheInterval?: number
  /** Branch ID for DeepCache acceleration. Determines which U-Net layers are skipped. */
  deepCacheBranchId?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:20@1' | 'runware:3@1'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for IP-Adapter image-prompted generation. */
  ipAdapters?: ({
  /** IP-Adapter model identifier. */
  model: 'runware:55@1' | 'runware:55@2' | 'runware:55@3' | 'runware:55@4'
  /** Strength of the IP-Adapter influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the reference. */
  weight?: number
  /** Images to guide the IP-Adapter (UUID, URL, Data URI, or Base64). */
  guideImages: unknown[]
  /** Controls how multiple reference images are combined. */
  combineMethod?: 'concat' | 'add' | 'subtract' | 'average' | 'norm_average'
  /** Determines which embedding components are used and their strength. */
  embedScaling?: 'only_v' | 'kv' | 'kv_penalty_c' | 'k_mean_v_penalty_c'
  /** Shapes how influence evolves during generation. */
  weightType?: 'normal' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'weak_input' | 'weak_output' | 'weak_middle' | 'strong_middle' | 'style_transfer' | 'composition' | 'strong_style_transfer' | 'style_and_composition' | 'strong_style_and_composition'
  /** Controls composition/layout influence specifically. */
  weightComposition?: number
})[]
  /** Configuration for running a refiner model on top of the base model output. */
  refiner?: {
  /** Refiner model identifier. */
  model: 'runware:101055@128080'
  /** Absolute step number to switch from the base model to the refiner. */
  startStep?: number
  /** Percentage of total steps at which to switch from the base model to the refiner. */
  startStepPercentage?: number
}
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * sd-1-5 architecture params.
 */
export type Sd15Params = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Number of layers to skip in the CLIP model. */
  clipSkip?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DeepCache acceleration. Skips transformer computations in certain steps to speed up generation. */
  deepCache?: boolean
  /** Interval for DeepCache acceleration. A value of 2 skips every other step, 3 skips two out of three, etc. */
  deepCacheInterval?: number
  /** Branch ID for DeepCache acceleration. Determines which U-Net layers are skipped. */
  deepCacheBranchId?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:11@1' | 'runware:12@1' | 'runware:13@1' | 'runware:142@0' | 'runware:17@1' | 'runware:6@1' | 'runware:6@2'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for IP-Adapter image-prompted generation. */
  ipAdapters?: ({
  /** IP-Adapter model identifier. */
  model: 'runware:55@10' | 'runware:55@5' | 'runware:55@6' | 'runware:55@7' | 'runware:55@8' | 'runware:55@9'
  /** Strength of the IP-Adapter influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the reference. */
  weight?: number
  /** Images to guide the IP-Adapter (UUID, URL, Data URI, or Base64). */
  guideImages: unknown[]
  /** Controls how multiple reference images are combined. */
  combineMethod?: 'concat' | 'add' | 'subtract' | 'average' | 'norm_average'
  /** Determines which embedding components are used and their strength. */
  embedScaling?: 'only_v' | 'kv' | 'kv_penalty_c' | 'k_mean_v_penalty_c'
  /** Shapes how influence evolves during generation. */
  weightType?: 'normal' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'weak_input' | 'weak_output' | 'weak_middle' | 'strong_middle' | 'style_transfer' | 'composition' | 'strong_style_transfer' | 'style_and_composition' | 'strong_style_and_composition'
  /** Controls composition/layout influence specifically. */
  weightComposition?: number
})[]
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * sd-1-5-distilled architecture params.
 */
export type Sd15DistilledParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Number of layers to skip in the CLIP model. */
  clipSkip?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DeepCache acceleration. Skips transformer computations in certain steps to speed up generation. */
  deepCache?: boolean
  /** Interval for DeepCache acceleration. A value of 2 skips every other step, 3 skips two out of three, etc. */
  deepCacheInterval?: number
  /** Branch ID for DeepCache acceleration. Determines which U-Net layers are skipped. */
  deepCacheBranchId?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:11@1' | 'runware:12@1' | 'runware:13@1' | 'runware:142@0' | 'runware:17@1' | 'runware:6@1' | 'runware:6@2'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for IP-Adapter image-prompted generation. */
  ipAdapters?: ({
  /** IP-Adapter model identifier. */
  model: 'runware:55@10' | 'runware:55@5' | 'runware:55@6' | 'runware:55@7' | 'runware:55@8' | 'runware:55@9'
  /** Strength of the IP-Adapter influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the reference. */
  weight?: number
  /** Images to guide the IP-Adapter (UUID, URL, Data URI, or Base64). */
  guideImages: unknown[]
  /** Controls how multiple reference images are combined. */
  combineMethod?: 'concat' | 'add' | 'subtract' | 'average' | 'norm_average'
  /** Determines which embedding components are used and their strength. */
  embedScaling?: 'only_v' | 'kv' | 'kv_penalty_c' | 'k_mean_v_penalty_c'
  /** Shapes how influence evolves during generation. */
  weightType?: 'normal' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'weak_input' | 'weak_output' | 'weak_middle' | 'strong_middle' | 'style_transfer' | 'composition' | 'strong_style_transfer' | 'style_and_composition' | 'strong_style_and_composition'
  /** Controls composition/layout influence specifically. */
  weightComposition?: number
})[]
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * sd-1-5-hyper architecture params.
 */
export type Sd15HyperParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Number of layers to skip in the CLIP model. */
  clipSkip?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DeepCache acceleration. Skips transformer computations in certain steps to speed up generation. */
  deepCache?: boolean
  /** Interval for DeepCache acceleration. A value of 2 skips every other step, 3 skips two out of three, etc. */
  deepCacheInterval?: number
  /** Branch ID for DeepCache acceleration. Determines which U-Net layers are skipped. */
  deepCacheBranchId?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:11@1' | 'runware:12@1' | 'runware:13@1' | 'runware:142@0' | 'runware:17@1' | 'runware:6@1' | 'runware:6@2'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for IP-Adapter image-prompted generation. */
  ipAdapters?: ({
  /** IP-Adapter model identifier. */
  model: 'runware:55@10' | 'runware:55@5' | 'runware:55@6' | 'runware:55@7' | 'runware:55@8' | 'runware:55@9'
  /** Strength of the IP-Adapter influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the reference. */
  weight?: number
  /** Images to guide the IP-Adapter (UUID, URL, Data URI, or Base64). */
  guideImages: unknown[]
  /** Controls how multiple reference images are combined. */
  combineMethod?: 'concat' | 'add' | 'subtract' | 'average' | 'norm_average'
  /** Determines which embedding components are used and their strength. */
  embedScaling?: 'only_v' | 'kv' | 'kv_penalty_c' | 'k_mean_v_penalty_c'
  /** Shapes how influence evolves during generation. */
  weightType?: 'normal' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'weak_input' | 'weak_output' | 'weak_middle' | 'strong_middle' | 'style_transfer' | 'composition' | 'strong_style_transfer' | 'style_and_composition' | 'strong_style_and_composition'
  /** Controls composition/layout influence specifically. */
  weightComposition?: number
})[]
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * sd-1-5-lcm architecture params.
 */
export type Sd15LcmParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Number of layers to skip in the CLIP model. */
  clipSkip?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DeepCache acceleration. Skips transformer computations in certain steps to speed up generation. */
  deepCache?: boolean
  /** Interval for DeepCache acceleration. A value of 2 skips every other step, 3 skips two out of three, etc. */
  deepCacheInterval?: number
  /** Branch ID for DeepCache acceleration. Determines which U-Net layers are skipped. */
  deepCacheBranchId?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:11@1' | 'runware:12@1' | 'runware:13@1' | 'runware:142@0' | 'runware:17@1' | 'runware:6@1' | 'runware:6@2'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for IP-Adapter image-prompted generation. */
  ipAdapters?: ({
  /** IP-Adapter model identifier. */
  model: 'runware:55@10' | 'runware:55@5' | 'runware:55@6' | 'runware:55@7' | 'runware:55@8' | 'runware:55@9'
  /** Strength of the IP-Adapter influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the reference. */
  weight?: number
  /** Images to guide the IP-Adapter (UUID, URL, Data URI, or Base64). */
  guideImages: unknown[]
  /** Controls how multiple reference images are combined. */
  combineMethod?: 'concat' | 'add' | 'subtract' | 'average' | 'norm_average'
  /** Determines which embedding components are used and their strength. */
  embedScaling?: 'only_v' | 'kv' | 'kv_penalty_c' | 'k_mean_v_penalty_c'
  /** Shapes how influence evolves during generation. */
  weightType?: 'normal' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'weak_input' | 'weak_output' | 'weak_middle' | 'strong_middle' | 'style_transfer' | 'composition' | 'strong_style_transfer' | 'style_and_composition' | 'strong_style_and_composition'
  /** Controls composition/layout influence specifically. */
  weightComposition?: number
})[]
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * sd-2-1 architecture params.
 */
export type Sd21Params = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Number of layers to skip in the CLIP model. */
  clipSkip?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DeepCache acceleration. Skips transformer computations in certain steps to speed up generation. */
  deepCache?: boolean
  /** Interval for DeepCache acceleration. A value of 2 skips every other step, 3 skips two out of three, etc. */
  deepCacheInterval?: number
  /** Branch ID for DeepCache acceleration. Determines which U-Net layers are skipped. */
  deepCacheBranchId?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * sdxl architecture params.
 */
export type SdxlParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Number of layers to skip in the CLIP model. */
  clipSkip?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DeepCache acceleration. Skips transformer computations in certain steps to speed up generation. */
  deepCache?: boolean
  /** Interval for DeepCache acceleration. A value of 2 skips every other step, 3 skips two out of three, etc. */
  deepCacheInterval?: number
  /** Branch ID for DeepCache acceleration. Determines which U-Net layers are skipped. */
  deepCacheBranchId?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:20@1' | 'runware:3@1'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for IP-Adapter image-prompted generation. */
  ipAdapters?: ({
  /** IP-Adapter model identifier. */
  model: 'runware:55@1' | 'runware:55@2' | 'runware:55@3' | 'runware:55@4'
  /** Strength of the IP-Adapter influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the reference. */
  weight?: number
  /** Images to guide the IP-Adapter (UUID, URL, Data URI, or Base64). */
  guideImages: unknown[]
  /** Controls how multiple reference images are combined. */
  combineMethod?: 'concat' | 'add' | 'subtract' | 'average' | 'norm_average'
  /** Determines which embedding components are used and their strength. */
  embedScaling?: 'only_v' | 'kv' | 'kv_penalty_c' | 'k_mean_v_penalty_c'
  /** Shapes how influence evolves during generation. */
  weightType?: 'normal' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'weak_input' | 'weak_output' | 'weak_middle' | 'strong_middle' | 'style_transfer' | 'composition' | 'strong_style_transfer' | 'style_and_composition' | 'strong_style_and_composition'
  /** Controls composition/layout influence specifically. */
  weightComposition?: number
})[]
  /** Configuration for running a refiner model on top of the base model output. */
  refiner?: {
  /** Refiner model identifier. */
  model: 'runware:101055@128080'
  /** Absolute step number to switch from the base model to the refiner. */
  startStep?: number
  /** Percentage of total steps at which to switch from the base model to the refiner. */
  startStepPercentage?: number
}
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** Personalized image generation with subject identity preservation. */
  photoMaker?: {
  /** Reference images for subject identity preservation. Each image must contain a single, clear face of the subject (UUID, URL, Data URI, or Base64). */
  images: unknown[]
  /** Controls the balance between preserving the subject's original features and the creative transformation specified in the prompt. Lower values provide stronger subject fidelity, higher values allow more creative freedom. */
  strength?: number
  /** Artistic style applied to the generated images. */
  style?: 'No style' | 'Cinematic' | 'Disney Character' | 'Digital Art' | 'Photographic' | 'Fantasy art' | 'Neonpunk' | 'Enhance' | 'Comic book' | 'Lowpoly' | 'Line art'
}
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * sdxl-distilled architecture params.
 */
export type SdxlDistilledParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Number of layers to skip in the CLIP model. */
  clipSkip?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DeepCache acceleration. Skips transformer computations in certain steps to speed up generation. */
  deepCache?: boolean
  /** Interval for DeepCache acceleration. A value of 2 skips every other step, 3 skips two out of three, etc. */
  deepCacheInterval?: number
  /** Branch ID for DeepCache acceleration. Determines which U-Net layers are skipped. */
  deepCacheBranchId?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:20@1' | 'runware:3@1'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for IP-Adapter image-prompted generation. */
  ipAdapters?: ({
  /** IP-Adapter model identifier. */
  model: 'runware:55@1' | 'runware:55@2' | 'runware:55@3' | 'runware:55@4'
  /** Strength of the IP-Adapter influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the reference. */
  weight?: number
  /** Images to guide the IP-Adapter (UUID, URL, Data URI, or Base64). */
  guideImages: unknown[]
  /** Controls how multiple reference images are combined. */
  combineMethod?: 'concat' | 'add' | 'subtract' | 'average' | 'norm_average'
  /** Determines which embedding components are used and their strength. */
  embedScaling?: 'only_v' | 'kv' | 'kv_penalty_c' | 'k_mean_v_penalty_c'
  /** Shapes how influence evolves during generation. */
  weightType?: 'normal' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'weak_input' | 'weak_output' | 'weak_middle' | 'strong_middle' | 'style_transfer' | 'composition' | 'strong_style_transfer' | 'style_and_composition' | 'strong_style_and_composition'
  /** Controls composition/layout influence specifically. */
  weightComposition?: number
})[]
  /** Configuration for running a refiner model on top of the base model output. */
  refiner?: {
  /** Refiner model identifier. */
  model: 'runware:101055@128080'
  /** Absolute step number to switch from the base model to the refiner. */
  startStep?: number
  /** Percentage of total steps at which to switch from the base model to the refiner. */
  startStepPercentage?: number
}
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * sdxl-hyper architecture params.
 */
export type SdxlHyperParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Number of layers to skip in the CLIP model. */
  clipSkip?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DeepCache acceleration. Skips transformer computations in certain steps to speed up generation. */
  deepCache?: boolean
  /** Interval for DeepCache acceleration. A value of 2 skips every other step, 3 skips two out of three, etc. */
  deepCacheInterval?: number
  /** Branch ID for DeepCache acceleration. Determines which U-Net layers are skipped. */
  deepCacheBranchId?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:20@1' | 'runware:3@1'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for IP-Adapter image-prompted generation. */
  ipAdapters?: ({
  /** IP-Adapter model identifier. */
  model: 'runware:55@1' | 'runware:55@2' | 'runware:55@3' | 'runware:55@4'
  /** Strength of the IP-Adapter influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the reference. */
  weight?: number
  /** Images to guide the IP-Adapter (UUID, URL, Data URI, or Base64). */
  guideImages: unknown[]
  /** Controls how multiple reference images are combined. */
  combineMethod?: 'concat' | 'add' | 'subtract' | 'average' | 'norm_average'
  /** Determines which embedding components are used and their strength. */
  embedScaling?: 'only_v' | 'kv' | 'kv_penalty_c' | 'k_mean_v_penalty_c'
  /** Shapes how influence evolves during generation. */
  weightType?: 'normal' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'weak_input' | 'weak_output' | 'weak_middle' | 'strong_middle' | 'style_transfer' | 'composition' | 'strong_style_transfer' | 'style_and_composition' | 'strong_style_and_composition'
  /** Controls composition/layout influence specifically. */
  weightComposition?: number
})[]
  /** Configuration for running a refiner model on top of the base model output. */
  refiner?: {
  /** Refiner model identifier. */
  model: 'runware:101055@128080'
  /** Absolute step number to switch from the base model to the refiner. */
  startStep?: number
  /** Percentage of total steps at which to switch from the base model to the refiner. */
  startStepPercentage?: number
}
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * sdxl-lcm architecture params.
 */
export type SdxlLcmParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Number of layers to skip in the CLIP model. */
  clipSkip?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DeepCache acceleration. Skips transformer computations in certain steps to speed up generation. */
  deepCache?: boolean
  /** Interval for DeepCache acceleration. A value of 2 skips every other step, 3 skips two out of three, etc. */
  deepCacheInterval?: number
  /** Branch ID for DeepCache acceleration. Determines which U-Net layers are skipped. */
  deepCacheBranchId?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:20@1' | 'runware:3@1'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for IP-Adapter image-prompted generation. */
  ipAdapters?: ({
  /** IP-Adapter model identifier. */
  model: 'runware:55@1' | 'runware:55@2' | 'runware:55@3' | 'runware:55@4'
  /** Strength of the IP-Adapter influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the reference. */
  weight?: number
  /** Images to guide the IP-Adapter (UUID, URL, Data URI, or Base64). */
  guideImages: unknown[]
  /** Controls how multiple reference images are combined. */
  combineMethod?: 'concat' | 'add' | 'subtract' | 'average' | 'norm_average'
  /** Determines which embedding components are used and their strength. */
  embedScaling?: 'only_v' | 'kv' | 'kv_penalty_c' | 'k_mean_v_penalty_c'
  /** Shapes how influence evolves during generation. */
  weightType?: 'normal' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'weak_input' | 'weak_output' | 'weak_middle' | 'strong_middle' | 'style_transfer' | 'composition' | 'strong_style_transfer' | 'style_and_composition' | 'strong_style_and_composition'
  /** Controls composition/layout influence specifically. */
  weightComposition?: number
})[]
  /** Configuration for running a refiner model on top of the base model output. */
  refiner?: {
  /** Refiner model identifier. */
  model: 'runware:101055@128080'
  /** Absolute step number to switch from the base model to the refiner. */
  startStep?: number
  /** Percentage of total steps at which to switch from the base model to the refiner. */
  startStepPercentage?: number
}
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * sdxl-lightning architecture params.
 */
export type SdxlLightningParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Number of layers to skip in the CLIP model. */
  clipSkip?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DeepCache acceleration. Skips transformer computations in certain steps to speed up generation. */
  deepCache?: boolean
  /** Interval for DeepCache acceleration. A value of 2 skips every other step, 3 skips two out of three, etc. */
  deepCacheInterval?: number
  /** Branch ID for DeepCache acceleration. Determines which U-Net layers are skipped. */
  deepCacheBranchId?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:20@1' | 'runware:3@1'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for IP-Adapter image-prompted generation. */
  ipAdapters?: ({
  /** IP-Adapter model identifier. */
  model: 'runware:55@1' | 'runware:55@2' | 'runware:55@3' | 'runware:55@4'
  /** Strength of the IP-Adapter influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the reference. */
  weight?: number
  /** Images to guide the IP-Adapter (UUID, URL, Data URI, or Base64). */
  guideImages: unknown[]
  /** Controls how multiple reference images are combined. */
  combineMethod?: 'concat' | 'add' | 'subtract' | 'average' | 'norm_average'
  /** Determines which embedding components are used and their strength. */
  embedScaling?: 'only_v' | 'kv' | 'kv_penalty_c' | 'k_mean_v_penalty_c'
  /** Shapes how influence evolves during generation. */
  weightType?: 'normal' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'weak_input' | 'weak_output' | 'weak_middle' | 'strong_middle' | 'style_transfer' | 'composition' | 'strong_style_transfer' | 'style_and_composition' | 'strong_style_and_composition'
  /** Controls composition/layout influence specifically. */
  weightComposition?: number
})[]
  /** Configuration for running a refiner model on top of the base model output. */
  refiner?: {
  /** Refiner model identifier. */
  model: 'runware:101055@128080'
  /** Absolute step number to switch from the base model to the refiner. */
  startStep?: number
  /** Percentage of total steps at which to switch from the base model to the refiner. */
  startStepPercentage?: number
}
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * sdxl-turbo architecture params.
 */
export type SdxlTurboParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Number of layers to skip in the CLIP model. */
  clipSkip?: number
  /** Syntax used for prompt weighting. */
  promptWeighting?: 'compel' | 'sdEmbeds'
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DeepCache acceleration. Skips transformer computations in certain steps to speed up generation. */
  deepCache?: boolean
  /** Interval for DeepCache acceleration. A value of 2 skips every other step, 3 skips two out of three, etc. */
  deepCacheInterval?: number
  /** Branch ID for DeepCache acceleration. Determines which U-Net layers are skipped. */
  deepCacheBranchId?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:20@1' | 'runware:3@1'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for IP-Adapter image-prompted generation. */
  ipAdapters?: ({
  /** IP-Adapter model identifier. */
  model: 'runware:55@1' | 'runware:55@2' | 'runware:55@3' | 'runware:55@4'
  /** Strength of the IP-Adapter influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the reference. */
  weight?: number
  /** Images to guide the IP-Adapter (UUID, URL, Data URI, or Base64). */
  guideImages: unknown[]
  /** Controls how multiple reference images are combined. */
  combineMethod?: 'concat' | 'add' | 'subtract' | 'average' | 'norm_average'
  /** Determines which embedding components are used and their strength. */
  embedScaling?: 'only_v' | 'kv' | 'kv_penalty_c' | 'k_mean_v_penalty_c'
  /** Shapes how influence evolves during generation. */
  weightType?: 'normal' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'weak_input' | 'weak_output' | 'weak_middle' | 'strong_middle' | 'style_transfer' | 'composition' | 'strong_style_transfer' | 'style_and_composition' | 'strong_style_and_composition'
  /** Controls composition/layout influence specifically. */
  weightComposition?: number
})[]
  /** Configuration for running a refiner model on top of the base model output. */
  refiner?: {
  /** Refiner model identifier. */
  model: 'runware:101055@128080'
  /** Absolute step number to switch from the base model to the refiner. */
  startStep?: number
  /** Percentage of total steps at which to switch from the base model to the refiner. */
  startStepPercentage?: number
}
  /** Two-stage generation for improved resolution. Can be enabled with `true` for default settings, or configured as an object for fine-grained control. */
  hiresFix?: true | {
  /** The upscaling model to use for hires fix. */
  model: 'runware:realesrgan@anime-6b' | 'runware:esrgan@animesharp' | 'runware:esrgan@ultrasharp' | 'runware:504@1'
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Factor by which to upscale the generated image. A value of 2 doubles width and height. */
  upscaleFactor?: 4
}
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * z-image architecture params.
 */
export type ZImageParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** First Block Cache (FBCache) acceleration. Reuses feature block computations across steps. */
  fbCache?: boolean
  /** Controls the sensitivity threshold for determining when to reuse cached computations. Lower values reuse more aggressively. */
  fbCacheThreshold?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DB Cache (CacheDiT) acceleration. Caches and reuses intermediate transformer block outputs to skip redundant computations. */
  dbCache?: boolean
  /** Controls the sensitivity threshold for DB Cache. Lower values reuse cached blocks more aggressively, higher values prioritize quality. */
  dbCacheThreshold?: number
  /** Controls how many steps to skip between cache refreshes. Higher values skip more steps for faster generation at the cost of quality. */
  dbCacheSkipInterval?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * z-image-turbo architecture params.
 */
export type ZImageTurboParams = {
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs?: {
  /** Image used as a starting point for the generation (UUID, URL, Data URI, or Base64). */
  seedImage?: unknown
  /** Image used to specify which areas of the seed image should be edited (UUID, URL, Data URI, or Base64). */
  maskImage?: unknown
}
  /** Text prompt describing elements to include in the generated output. */
  positivePrompt: string
  /** Prompt to guide what to exclude from generation. Ignored when guidance is disabled (CFGScale ≤ 1). */
  negativePrompt?: string
  /** Width of the generated media in pixels. */
  width: number
  /** Height of the generated media in pixels. */
  height: number
  /** Random seed for reproducible generation. When not provided, a random seed is generated in the unsigned 32-bit range. */
  seed?: number
  /** Total number of denoising steps. Higher values generally produce more detailed results but take longer. */
  steps?: number
  /** Scheduler to use for the diffusion process. */
  scheduler?: 'DDIM' | 'DDIMScheduler' | 'DDPMScheduler' | 'DEISMultistepScheduler' | 'Default' | 'DPM++' | 'DPM++ 2M' | 'DPM++ 2M Beta' | 'DPM++ 2M Exponential' | 'DPM++ 2M Karras' | 'DPM++ 2M SDE' | 'DPM++ 2M SDE Beta' | 'DPM++ 2M SDE Exponential' | 'DPM++ 2M SDE Karras' | 'DPM++ 2M SDE Uniform' | 'DPM++ 2M Uniform' | 'DPM++ 3M' | 'DPM++ 3M Beta' | 'DPM++ 3M Exponential' | 'DPM++ 3M Karras' | 'DPM++ 3M SDE Uniform' | 'DPM++ 3M Uniform' | 'DPM++ Beta' | 'DPM++ Exponential' | 'DPM++ Karras' | 'DPM++ SDE' | 'DPM++ SDE Beta' | 'DPM++ SDE Exponential' | 'DPM++ SDE Karras' | 'DPM++ Uniform' | 'DPM++ Uniform Beta' | 'DPM++ Uniform Exponential' | 'DPM++ Uniform Karras' | 'DPMSolverMultistepInverse' | 'DPMSolverMultistepScheduler' | 'DPMSolverSinglestepScheduler' | 'EDMDPMSolverMultistepScheduler' | 'EDMEulerScheduler' | 'Euler' | 'Euler a' | 'Euler Beta' | 'Euler Exponential' | 'Euler Karras' | 'EulerAncestralDiscreteScheduler' | 'EulerDiscreteScheduler' | 'FlowMatchEulerDiscreteScheduler' | 'Heun' | 'HeunDiscreteScheduler' | 'Heun Karras' | 'IPNDMScheduler' | 'IPNDM Uniform' | 'IPNDM Uniform Beta' | 'IPNDM Uniform Exponential' | 'IPNDM Uniform Karras' | 'KDPM2AncestralDiscreteScheduler' | 'KDPM2DiscreteScheduler' | 'LCM' | 'LCMScheduler' | 'LMS' | 'LMSDiscreteScheduler' | 'LMS Karras' | 'PNDMScheduler' | 'TCDScheduler' | 'UniPC' | 'UniPC 2M' | 'UniPC 2M Karras' | 'UniPC 2M Uniform' | 'UniPC 3M' | 'UniPC 3M Karras' | 'UniPC 3M Uniform' | 'UniPC Karras' | 'UniPC Uniform' | 'UniPC Uniform Beta' | 'UniPC Uniform Exponential' | 'UniPC Uniform Karras'
  /** Guidance scale representing how closely the output will resemble the prompt. Higher values produce results more aligned with the prompt. */
  CFGScale?: number
  /** Strength of the transformation. Lower values result in more influence from the original input. */
  strength?: number
  /** Extra context pixels around the masked region during inpainting. The model zooms into the masked area with these additional pixels for better integration. */
  maskMargin?: number
  /** Advanced caching mechanisms to speed up generation. */
  acceleratorOptions?: {
  /** Absolute step number to end caching. Must be greater than `cacheStartStep` and less than or equal to `steps`. */
  cacheEndStep?: number
  /** Percentage of steps to end caching. Alternative to `cacheEndStep`. Must be greater than `cacheStartStepPercentage`. */
  cacheEndStepPercentage?: number
  /** Limits the maximum number of consecutive steps that can use cached computations before forcing a fresh computation. */
  cacheMaxConsecutiveSteps?: number
  /** Absolute step number to start caching. Must be less than `cacheEndStep`. */
  cacheStartStep?: number
  /** Percentage of steps to start caching. Alternative to `cacheStartStep`. Must be less than `cacheEndStepPercentage`. */
  cacheStartStepPercentage?: number
  /** First Block Cache (FBCache) acceleration. Reuses feature block computations across steps. */
  fbCache?: boolean
  /** Controls the sensitivity threshold for determining when to reuse cached computations. Lower values reuse more aggressively. */
  fbCacheThreshold?: number
  /** TeaCache acceleration for transformer-based models. Estimates step differences to skip redundant computations. */
  teaCache?: boolean
  /** Controls the aggressiveness of the TeaCache feature. Lower values prioritize quality, higher values prioritize speed. */
  teaCacheDistance?: number
  /** DB Cache (CacheDiT) acceleration. Caches and reuses intermediate transformer block outputs to skip redundant computations. */
  dbCache?: boolean
  /** Controls the sensitivity threshold for DB Cache. Lower values reuse cached blocks more aggressively, higher values prioritize quality. */
  dbCacheThreshold?: number
  /** Controls how many steps to skip between cache refreshes. Higher values skip more steps for faster generation at the cost of quality. */
  dbCacheSkipInterval?: number
}
  /** Pixel extensions for each boundary direction of the source image. At least one direction is required. */
  outpaint?: unknown
  /** Configuration for Low-Rank Adaptation models. */
  lora?: ({
  /** LoRA model identifier. */
  model: string
  /** Strength of the LoRA influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the LoRA's style. */
  weight?: number
  /** Transformer stages to apply LoRA. Some video models use separate high-noise and low-noise processing stages, and LoRAs can be selectively applied to optimize their effectiveness. */
  transformer?: 'high' | 'low' | 'both'
})[]
  /** Configuration for identifying and applying ControlNet models. */
  controlNet?: ({
  /** ControlNet model identifier. */
  model: 'runware:z-image@turbo-controlnet'
  /** Strength of the ControlNet influence. A value of 0 means no influence. Higher values increase the influence, and negative values can be used to steer away from the guide image. */
  weight?: number
  /** Reference image for ControlNet guidance (UUID, URL, Data URI, or Base64). */
  guideImage: unknown
  /** ControlNet guidance mode. */
  controlMode?: 'balanced' | 'controlnet' | 'prompt'
  /** Absolute step number to end ControlNet influence. Must be greater than `startStep` and less than or equal to `steps`. */
  endStep?: number
  /** Percentage of steps to end ControlNet influence. Must be greater than `startStepPercentage`. */
  endStepPercentage?: number
  /** Absolute step number to start ControlNet influence. Must be less than `endStep`. */
  startStep?: number
  /** Percentage of steps to start ControlNet influence. Must be less than `endStepPercentage`. */
  startStepPercentage?: number
})[]
  /** Configuration for Ultralytics face enhancement. */
  ultralytics?: {
  /** Face refinement guidance scale. */
  CFGScale?: number
  /** Confidence threshold for detection. */
  confidence?: number
  /** Image size (in pixels) to use for each inpainting region. YOLO detects faces, crops the region, and scales it to this size before running diffusion. Set so most faces land in the 2–4× range of their original pixel size. Going beyond 8× may degrade identity resemblance. */
  inpaintSize?: number
  /** Mask feathering amount. Higher values create softer transitions between the enhanced face region and surrounding areas. */
  maskBlur?: number
  /** Padding around detected face in pixels. Expands the refinement area to include surrounding context like hair and neck. */
  maskPadding?: number
  /** Negative prompt for detection. */
  negativePrompt?: string
  /** Positive prompt for detection. */
  positivePrompt?: string
  /** Number of face refinement steps. */
  steps?: number
  /** Refinement strength. Lower values preserve more of the original, higher values allow more aggressive reconstruction. */
  strength?: number
}
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * ThreeD inference params.
 */
export type ThreeDInferenceParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** 3D output type. */
  outputType?: 'URL'
  /** File format for the generated 3D model. */
  outputFormat?: 'GLB'
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  [key: string]: unknown
}

/**
 * Audio inference params.
 */
export type AudioInferenceParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Audio output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated audio. */
  outputFormat?: 'MP3' | 'WAV' | 'FLAC' | 'OGG'
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Audio encoding settings. Only applicable for lossy formats (MP3, OGG). Available sample rates and valid bitrate ranges depend on the output format and number of channels. */
  audioSettings?: {
  /** Audio bitrate in kbps. */
  bitrate?: number
  /** Number of audio channels. 1 for mono, 2 for stereo. */
  channels?: 1 | 2
  /** Audio sample rate in Hz. */
  sampleRate?: number
}
  [key: string]: unknown
}

/**
 * Image inference params.
 */
export type ImageInferenceParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Content safety checking configuration for image generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
}
  [key: string]: unknown
}

/**
 * Text inference params.
 */
export type TextInferenceParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Array of chat messages forming the conversation context. */
  messages: ({
  /** The role of the message author. */
  role: 'user' | 'assistant'
  /** The text content of the message. */
  content: string
})[]
  /** Output format for the generated text. */
  outputFormat?: 'TEXT'
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async' | 'stream'
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** Global inference settings. */
  settings?: Record<string, unknown>
  /** Include token usage statistics in the response. */
  includeUsage?: boolean
  [key: string]: unknown
}

/**
 * Video inference params.
 */
export type VideoInferenceParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Number of results to generate. Each result uses a different seed, producing variations of the same parameters. */
  numberResults?: number
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Video output type. */
  outputType?: 'URL'
  /** File format for the generated video. */
  outputFormat?: 'MP4' | 'WEBM' | 'MOV'
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'async'
  /** Content safety checking configuration for video generation. */
  safety?: {
  /** Enable or disable content safety checking. */
  checkContent?: boolean
  /** Safety checking mode for video generation. */
  mode?: 'none' | 'fast' | 'full'
}
  [key: string]: unknown
}

/**
 * caption operation params.
 */
export type CaptionParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  [key: string]: unknown
}

/**
 * caption-image operation params.
 */
export type CaptionImageParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs: {
  /** Image input (UUID, URL, Data URI, or Base64). */
  image: unknown
}
  [key: string]: unknown
}

/**
 * caption-video operation params.
 */
export type CaptionVideoParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'async'
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs: {
  /** Video input (UUID or URL). */
  video: unknown
}
  [key: string]: unknown
}

/**
 * controlnet-preprocess operation params.
 */
export type ControlnetPreprocessParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs: {
  /** Image input (UUID, URL, Data URI, or Base64). */
  image: unknown
}
  [key: string]: unknown
}

/**
 * masking operation params.
 */
export type MaskingParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs: {
  /** Image input (UUID, URL, Data URI, or Base64). */
  image: unknown
}
  /** Global inference settings. */
  settings?: {
  /** Confidence threshold for detections. Only detections above this score are included. */
  confidence?: number
  /** Maximum number of detections. Prioritizes highest confidence scores if exceeded. */
  maxDetections?: number
  /** Pixel amount to extend (positive) or shrink (negative) the mask area. */
  maskPadding?: number
  /** Blur radius for mask edges, creating smooth transitions. */
  maskBlur?: number
}
  [key: string]: unknown
}

/**
 * prompt-enhance operation params.
 */
export type PromptEnhanceParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** The text prompt to enhance. */
  prompt: string
  /** Maximum length of the enhanced prompt. */
  promptMaxLength?: number
  /** Number of enhanced prompt variations to generate. */
  promptVersions?: number
  [key: string]: unknown
}

/**
 * remove-background operation params.
 */
export type RemoveBackgroundParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  [key: string]: unknown
}

/**
 * remove-background-image operation params.
 */
export type RemoveBackgroundImageParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs: {
  /** Image input (UUID, URL, Data URI, or Base64). */
  image: unknown
}
  [key: string]: unknown
}

/**
 * remove-background-video operation params.
 */
export type RemoveBackgroundVideoParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Video output type. */
  outputType?: 'URL'
  /** File format for the generated video. */
  outputFormat?: 'MP4' | 'WEBM' | 'MOV'
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'async'
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs: {
  /** Video input (UUID or URL). */
  video: unknown
}
  [key: string]: unknown
}

/**
 * training operation params.
 */
export type TrainingParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  [key: string]: unknown
}

/**
 * upscale operation params.
 */
export type UpscaleParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  [key: string]: unknown
}

/**
 * upscale-image operation params.
 */
export type UpscaleImageParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the generated image. */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP'
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs: {
  /** Image input (UUID, URL, Data URI, or Base64). */
  image: unknown
}
  [key: string]: unknown
}

/**
 * upscale-video operation params.
 */
export type UpscaleVideoParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Compression quality of the output. Higher values preserve quality but increase file size. */
  outputQuality?: number
  /** Video output type. */
  outputType?: 'URL'
  /** File format for the generated video. */
  outputFormat?: 'MP4' | 'WEBM' | 'MOV'
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'async'
  /** The unified payload wrapper for complex media assets dictating image, video or audio inference constraints. */
  inputs: {
  /** Video input (UUID or URL). */
  video: unknown
}
  [key: string]: unknown
}

/**
 * vectorize operation params.
 */
export type VectorizeParams = {
  /** Specifies a webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete. For batch requests with multiple results, each completed item triggers a separate webhook call as it becomes available. */
  webhookURL?: string
  /** Include task cost in the response. */
  includeCost?: boolean
  /** Identifier of the model to use for generation. */
  model: string
  /** URL to upload content via HTTP PUT. The request body will contain the raw binary data. */
  uploadEndpoint?: string
  /** Time-to-live (TTL) in seconds for generated content. Only applies when `outputType` is `URL`. */
  ttl?: number
  /** Image output type. */
  outputType?: 'URL' | 'base64Data' | 'dataURI'
  /** File format for the vectorized output. */
  outputFormat?: 'SVG'
  /** Determines how the API delivers task results. */
  deliveryMethod?: 'sync' | 'async'
  [key: string]: unknown
}

/**
 * Account Management
 */
export type AccountManagementParams = {
  /** The specific account management operation to perform. */
  operation: 'getDetails'
}

/**
 * Get Response
 */
export type GetResponseParams = {

}

/**
 * Get Task Details
 */
export type GetTaskDetailsParams = {

}

/**
 * Image Upload
 */
export type ImageUploadParams = {
  /** Image to upload (URL, Data URI, or Base64). */
  image: unknown
}

/**
 * Model Search
 */
export type ModelSearchParams = {
  /** Search query to find models by name, description or AIR ID. */
  search: string
  /** Filter models by specific tags. */
  tags?: string[]
  /** Filter models by category. */
  category?: 'checkpoint' | 'lora' | 'lycoris' | 'vae' | 'embeddings'
  /** Filter checkpoint models by type. Only applicable when category is `checkpoint`. */
  type?: 'base' | 'inpainting' | 'refiner'
  /** Filter by model architecture. */
  architecture?: string
  /** Filter ControlNet models by their conditioning type. */
  conditioning?: 'blur' | 'canny' | 'depth' | 'gray' | 'hed' | 'inpaint' | 'inpaintdepth' | 'lineart' | 'lowquality' | 'normal' | 'openmlsd' | 'openpose' | 'outfit' | 'pix2pix' | 'qrcode' | 'scribble' | 'seg' | 'shuffle' | 'sketch' | 'softedge' | 'tile'
  /** Filter by visibility status (e.g., public, private, all). */
  visibility?: 'public' | 'private' | 'all'
  /** Maximum number of results to return. */
  limit?: number
  /** Number of results to skip for pagination. */
  offset?: number
}

/**
 * Model Upload
 */
export type ModelUploadParams = {
  /** Category of the model. */
  category: 'checkpoint' | 'lora' | 'lycoris' | 'vae' | 'embeddings'
  /** Type of the model (specific to category). */
  type?: 'base' | 'inpainting' | 'positive' | 'negative'
  /** Architecture of the model. */
  architecture: string
  /** Format of the model file. */
  format: 'safetensors'
  /** Artificial Intelligence Resource identifier. Format: `provider:model@version`. */
  air?: string
  /** Unique identifier for the model. */
  uniqueIdentifier?: string
  /** Name of the model. */
  name: string
  /** Version of the model. */
  version: string
  /** URL where the model file is hosted. */
  downloadURL: string
  /** Default scheduler. */
  defaultScheduler?: string
  /** Default number of inference steps. */
  defaultSteps?: number
  /** Default classifier-free guidance scale. */
  defaultCFG?: number
  /** Default strength for img2img. */
  defaultStrength?: number
  /** Default weight for the model. */
  defaultWeight?: number
  /** Whether the model should be private. */
  private?: boolean
  /** URL of the hero image. */
  heroImageURL?: string
  /** Tags associated with the model. */
  tags?: string[]
  /** List of positive trigger words. */
  positiveTriggerWords?: string
  /** Short description of the model. */
  shortDescription?: string
  /** Additional comments or notes. */
  comment?: string
}

/**
 * Prompt Enhance Response
 */
export type PromptEnhanceResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'promptEnhance'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Task cost in USD. Present when `includeCost` is set to `true` in the request. */
  cost?: number
  /** Enhanced prompt text. */
  text: string
}

/**
 * Audio Response
 */
export type AudioInferenceResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'audioInference'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Task cost in USD. Present when `includeCost` is set to `true` in the request. */
  cost?: number
  /** UUID of the output audio. */
  audioUUID: string
  /** URL of the output audio. */
  audioURL?: string
  /** Base64-encoded audio data. */
  audioBase64Data?: string
  /** Data URI of the output audio. */
  audioDataURI?: string
  /** The seed used for generation. If none was provided, shows the randomly generated seed. */
  seed?: number
}

/**
 * Remove Background Image Response
 */
export type RemoveBackgroundResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'removeBackground'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Task cost in USD. Present when `includeCost` is set to `true` in the request. */
  cost?: number
  /** UUID of the output image. */
  imageUUID: string
  /** URL of the output image. */
  imageURL?: string
  /** Base64-encoded image data. */
  imageBase64Data?: string
  /** Data URI of the output image. */
  imageDataURI?: string
}

/**
 * ControlNet Preprocess Response
 */
export type ControlNetPreprocessResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'controlNetPreprocess'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Task cost in USD. Present when `includeCost` is set to `true` in the request. */
  cost?: number
  /** UUID of the output guide image. */
  guideImageUUID: string
  /** URL of the output guide image. */
  guideImageURL?: string
  /** Base64-encoded guide image data. */
  guideImageBase64Data?: string
  /** Data URI of the output guide image. */
  guideImageDataURI?: string
  /** UUID of the input image used for preprocessing. */
  inputImageUUID: string
}

/**
 * Video Response
 */
export type VideoInferenceResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'videoInference'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Task cost in USD. Present when `includeCost` is set to `true` in the request. */
  cost?: number
  /** UUID of the output video. */
  videoUUID: string
  /** URL of the output video. */
  videoURL?: string
  /** Base64-encoded video data. */
  videoBase64Data?: string
  /** Data URI of the output video. */
  videoDataURI?: string
  /** The seed used for generation. If none was provided, shows the randomly generated seed. */
  seed?: number
  /** Flag indicating if NSFW content was detected. */
  NSFWContent?: boolean
}

/**
 * Image Response
 */
export type ImageInferenceResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'imageInference'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Task cost in USD. Present when `includeCost` is set to `true` in the request. */
  cost?: number
  /** UUID of the output image. */
  imageUUID: string
  /** URL of the output image. */
  imageURL?: string
  /** Base64-encoded image data. */
  imageBase64Data?: string
  /** Data URI of the output image. */
  imageDataURI?: string
  /** The seed used for generation. If none was provided, shows the randomly generated seed. */
  seed?: number
  /** Flag indicating if NSFW content was detected. */
  NSFWContent?: boolean
}

/**
 * Image Masking Response
 */
export type ImageMaskingResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'imageMasking'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Task cost in USD. Present when `includeCost` is set to `true` in the request. */
  cost?: number
  /** UUID of the output mask image. */
  maskImageUUID: string
  /** URL of the output mask image. */
  maskImageURL?: string
  /** Base64-encoded mask image data. */
  maskImageBase64Data?: string
  /** Data URI of the output mask image. */
  maskImageDataURI?: string
  /** An array of objects containing the coordinates of each detected element in the image. Each object provides the bounding box coordinates of a detected face, hand, or person (depending on the model used). */
  detections: {
  /** Leftmost coordinate of the detected area. */
  x_min: number
  /** Topmost coordinate of the detected area. */
  y_min: number
  /** Rightmost coordinate of the detected area. */
  x_max: number
  /** Bottommost coordinate of the detected area. */
  y_max: number
}[]
  /** UUID of the input image used for masking. */
  inputImageUUID: string
}

/**
 * Age Classification Response
 */
export type CaptionResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'caption'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Task cost in USD. Present when `includeCost` is set to `true` in the request. */
  cost?: number
  /** Machine-readable age classification data. */
  structuredData: {
  /** Predicted age range of the subject (e.g. `13-20`). */
  ageGroup: string
  /** Confidence score as a percentage. */
  confidence: number
}
}

/**
 * Upscale Image Response
 */
export type UpscaleResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'upscale'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Task cost in USD. Present when `includeCost` is set to `true` in the request. */
  cost?: number
  /** UUID of the output image. */
  imageUUID: string
  /** URL of the output image. */
  imageURL?: string
  /** Base64-encoded image data. */
  imageBase64Data?: string
  /** Data URI of the output image. */
  imageDataURI?: string
}

/**
 * Text Inference Response
 */
export type TextInferenceResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'textInference'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Task cost in USD. Present when `includeCost` is set to `true` in the request. */
  cost?: number
  /** Generated text content. */
  text: string
  /** The reason why the model stopped generating tokens. */
  finishReason: 'stop' | 'length' | 'content_filter' | 'unknown'
  /** Token usage statistics for the request. */
  usage: {
  /** Number of tokens in the input prompt. */
  promptTokens: number
  /** Number of tokens generated in the response. */
  completionTokens: number
  /** Total number of tokens used (prompt + completion). */
  totalTokens: number
  /** Number of tokens used for internal reasoning. Billed separately. */
  thinkingTokens?: number
}
}

/**
 * Vectorize Response
 */
export type VectorizeResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'vectorize'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Task cost in USD. Present when `includeCost` is set to `true` in the request. */
  cost?: number
  /** UUID of the output image. */
  imageUUID: string
  /** URL of the output image. */
  imageURL?: string
  /** Base64-encoded image data. */
  imageBase64Data?: string
  /** Data URI of the output image. */
  imageDataURI?: string
}

/**
 * 3D Response
 */
export type ThreeDInferenceResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: '3dInference'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Task cost in USD. Present when `includeCost` is set to `true` in the request. */
  cost?: number
  /** Generated output artifacts. */
  outputs: {
  /** Generated output files. */
  files: {
  /** UUID of the output file. */
  uuid: string
  /** URL of the output file. */
  url: string
}[]
}
  /** The seed used for generation. If none was provided, shows the randomly generated seed. */
  seed?: number
}

/**
 * Training Response
 */
export type TrainingResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'training'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Task cost in USD. Present when `includeCost` is set to `true` in the request. */
  cost?: number
  /** Artificial Intelligence Resource identifier. Format: `provider:model@version`. */
  air: string
}

/**
 * Get Task Details Response
 */
export type GetTaskDetailsResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'getTaskDetails'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** The original request array sent for this task. The structure of each object depends on the task type. */
  request: Record<string, unknown>[]
  /** The original API response for this task. Contains a `data` array when the task completed successfully, or an `errors` array when the task failed. */
  response: Record<string, unknown>
}

/**
 * Model Upload Response
 */
export type ModelUploadResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType?: 'modelUpload'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Status of the upload operation phase. */
  status: 'validated' | 'downloaded' | 'optimized' | 'stored' | 'ready' | 'failed'
  /** Status message or error details. */
  message: string
  /** The AIR identifier of the uploaded model. */
  air?: string
}

/**
 * Task Response
 */
export type GetResponseResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'getResponse'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Current status of the task. */
  status: 'processing' | 'success' | 'error'
  /** Task progress as a percentage from 0 to 100. Returned while `status` is `processing`, and only for tasks that support progress reporting. */
  progress?: number
  /** Error details if the task failed. */
  error?: {
  /** Error code. */
  code?: string
  /** Error message description. */
  message?: string
}
}

/**
 * Image Upload Response
 */
export type ImageUploadResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'imageUpload'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** UUID of the output image. */
  imageUUID: string
}

/**
 * Account Management Response
 */
export type AccountManagementResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'accountManagement'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** The name of the organization. */
  organizationName: string
  /** Unique identifier for the organization. */
  organizationUUID: string
  /** Current account balance and currency. */
  balance: {
  /** Current balance amount. */
  amount: number
  /** Available free credit balance. */
  freeBalance?: number
  /** Currency code (e.g., USD). */
  currency: string
}
  /** List of team members. */
  team: ({
  /** Full name of the team member. */
  name: string
  /** Email address of the team member. */
  email: string
  /** Roles assigned to the team member. */
  roles: ('Owner' | 'Admin' | 'Developer')[]
  /** Date and time when the member joined. */
  joinedAt?: string
})[]
  /** List of API keys associated with the account. */
  apiKeys: {
  /** The API key string (partially masked). */
  apiKey: string
  /** Name or label for the API key. */
  name: string
  /** Description of the API key. */
  description?: string
  /** Whether the API key is active. */
  enabled: boolean
  /** Date and time when the key was created. */
  createdAt: string
  /** Date and time when the key was last used. */
  lastUsedAt?: string
  /** Total number of requests made with this key. */
  requests?: number
}[]
  /** Usage statistics for different time periods. */
  usage: {
  /** Usage stats for today. */
  today: {
  /** Total credits consumed. */
  credits: number
  /** Total API requests made. */
  requests: number
}
  /** Usage stats for the last 7 days. */
  last7Days: {
  /** Total credits consumed. */
  credits: number
  /** Total API requests made. */
  requests: number
}
  /** Usage stats for the last 30 days. */
  last30Days: {
  /** Total credits consumed. */
  credits: number
  /** Total API requests made. */
  requests: number
}
  /** Total lifetime usage stats. */
  total: {
  /** Total credits consumed. */
  credits: number
  /** Total API requests made. */
  requests: number
}
}
}

/**
 * Model Search Response
 */
export type ModelSearchResult = {
  /** Identifier for the type of task this response belongs to. */
  taskType: 'modelSearch'
  /** UUID v4 identifier echoed from the original request, used to match async responses to their tasks. */
  taskUUID: string
  /** Total number of models matching the search criteria. */
  totalResults: number
  /** List of models found. */
  results: {
  /** Artificial Intelligence Resource identifier. */
  air: string
  /** Name of the model. */
  name: string
  /** Version of the model. */
  version: string
  /** Category of the model (e.g., checkpoint, lora). */
  category: string
  /** Model architecture (e.g., sdxl, flux). */
  architecture?: string
  /** URL of the model's representative image. */
  imageURL: string
  /** URL of the model's thumbnail image. */
  thumbnailURL: string
  /** List of tags associated with the model. */
  tags?: string[]
  /** Whether the model is private. */
  private?: boolean
  /** Whether this is the primary version of the model. */
  primary?: boolean
  /** The base model this model is derived from. */
  baseModel?: string
}[]
}

/**
 * Error Response
 */
export type ApiError = {
  errors: {
  /** A short identifier for the error (e.g., invalidApiKey, timeoutProvider). */
  code: string
  /** A human-readable explanation of what went wrong. */
  message: string
  /** The request parameter related to the error, if applicable. */
  parameter?: string
  /** The task type of the request that failed. */
  taskType?: string
  /** The unique identifier of the failed request. */
  taskUUID?: string
  /** A link to relevant documentation. */
  documentation?: string
}[]
}


/**
 * Maps schema keys (architecture names, modalities, operations) to their
 * params and result types. Used by `.run<'sdxl'>()`, `.run<'image'>()`,
 * `.run<'upscale-image'>()`, etc.
 */
export type SchemaMap = {
  'exactly-illustrative': { params: ExactlyIllustrativeParams, result: ImageInferenceResult }
  'flux-1-dev': { params: Flux1DevParams, result: ImageInferenceResult }
  'flux-1-kontext-dev': { params: Flux1KontextDevParams, result: ImageInferenceResult }
  'flux-1-schnell': { params: Flux1SchnellParams, result: ImageInferenceResult }
  illustrious: { params: IllustriousParams, result: ImageInferenceResult }
  noobai: { params: NoobaiParams, result: ImageInferenceResult }
  pony: { params: PonyParams, result: ImageInferenceResult }
  'sd-1-5': { params: Sd15Params, result: ImageInferenceResult }
  'sd-1-5-distilled': { params: Sd15DistilledParams, result: ImageInferenceResult }
  'sd-1-5-hyper': { params: Sd15HyperParams, result: ImageInferenceResult }
  'sd-1-5-lcm': { params: Sd15LcmParams, result: ImageInferenceResult }
  'sd-2-1': { params: Sd21Params, result: ImageInferenceResult }
  sdxl: { params: SdxlParams, result: ImageInferenceResult }
  'sdxl-distilled': { params: SdxlDistilledParams, result: ImageInferenceResult }
  'sdxl-hyper': { params: SdxlHyperParams, result: ImageInferenceResult }
  'sdxl-lcm': { params: SdxlLcmParams, result: ImageInferenceResult }
  'sdxl-lightning': { params: SdxlLightningParams, result: ImageInferenceResult }
  'sdxl-turbo': { params: SdxlTurboParams, result: ImageInferenceResult }
  'z-image': { params: ZImageParams, result: ImageInferenceResult }
  'z-image-turbo': { params: ZImageTurboParams, result: ImageInferenceResult }
  '3d': { params: ThreeDInferenceParams, result: ThreeDInferenceResult }
  audio: { params: AudioInferenceParams, result: AudioInferenceResult }
  image: { params: ImageInferenceParams, result: ImageInferenceResult }
  text: { params: TextInferenceParams, result: TextInferenceResult }
  video: { params: VideoInferenceParams, result: VideoInferenceResult }
  caption: { params: CaptionParams, result: CaptionResult }
  'caption-image': { params: CaptionImageParams, result: CaptionResult }
  'caption-video': { params: CaptionVideoParams, result: CaptionResult }
  'controlnet-preprocess': { params: ControlnetPreprocessParams, result: ControlNetPreprocessResult }
  masking: { params: MaskingParams, result: ImageMaskingResult }
  'prompt-enhance': { params: PromptEnhanceParams, result: PromptEnhanceResult }
  'remove-background': { params: RemoveBackgroundParams, result: RemoveBackgroundResult }
  'remove-background-image': { params: RemoveBackgroundImageParams, result: RemoveBackgroundResult }
  'remove-background-video': { params: RemoveBackgroundVideoParams, result: RemoveBackgroundResult }
  training: { params: TrainingParams, result: TrainingResult }
  upscale: { params: UpscaleParams, result: UpscaleResult }
  'upscale-image': { params: UpscaleImageParams, result: UpscaleResult }
  'upscale-video': { params: UpscaleVideoParams, result: UpscaleResult }
  vectorize: { params: VectorizeParams, result: VectorizeResult }
}

export type SchemaKey = keyof SchemaMap

/** Utility taskTypes → their params and result types. */
export type UtilityMap = {
  accountManagement: { params: AccountManagementParams, result: AccountManagementResult }
  getResponse: { params: GetResponseParams, result: GetResponseResult }
  getTaskDetails: { params: GetTaskDetailsParams, result: GetTaskDetailsResult }
  imageUpload: { params: ImageUploadParams, result: ImageUploadResult }
  modelSearch: { params: ModelSearchParams, result: ModelSearchResult }
  modelUpload: { params: ModelUploadParams, result: ModelUploadResult }
}

export type UtilityKey = keyof UtilityMap

/**
 * Architecture-slug → API taskType. Used by `.run()` when the SDK can identify
 * a community fine-tune by its architecture but not by its model AIR.
 */
export const architectureTaskTypes: Record<string, string> = {
  'exactly-illustrative': 'imageInference',
  'flux-1-dev': 'imageInference',
  'flux-1-kontext-dev': 'imageInference',
  'flux-1-schnell': 'imageInference',
  illustrious: 'imageInference',
  noobai: 'imageInference',
  pony: 'imageInference',
  'sd-1-5': 'imageInference',
  'sd-1-5-distilled': 'imageInference',
  'sd-1-5-hyper': 'imageInference',
  'sd-1-5-lcm': 'imageInference',
  'sd-2-1': 'imageInference',
  sdxl: 'imageInference',
  'sdxl-distilled': 'imageInference',
  'sdxl-hyper': 'imageInference',
  'sdxl-lcm': 'imageInference',
  'sdxl-lightning': 'imageInference',
  'sdxl-turbo': 'imageInference',
  'z-image': 'imageInference',
  'z-image-turbo': 'imageInference'
}

/**
 * Top-level modalities (image, video, audio, text, 3d) → API taskType.
 * Loose convenience keys for inference across a modality without committing
 * to a specific architecture.
 */
export const modalityTaskTypes: Record<string, string> = {
  '3d': '3dInference',
  audio: 'audioInference',
  image: 'imageInference',
  text: 'textInference',
  video: 'videoInference'
}

/**
 * Operation slugs (caption-image, upscale-video, remove-background, etc.) →
 * API taskType. Operations are tasks performed on existing media.
 */
export const operationTaskTypes: Record<string, string> = {
  caption: 'caption',
  'caption-image': 'caption',
  'caption-video': 'caption',
  'controlnet-preprocess': 'controlNetPreprocess',
  masking: 'imageMasking',
  'prompt-enhance': 'promptEnhance',
  'remove-background': 'removeBackground',
  'remove-background-image': 'removeBackground',
  'remove-background-video': 'removeBackground',
  training: 'training',
  upscale: 'upscale',
  'upscale-image': 'upscale',
  'upscale-video': 'upscale',
  vectorize: 'vectorize'
}

/**
 * Curated model AIRs → taskType + canonical model ID. Used by `.run()` to
 * auto-resolve taskType from `params.model`, and by the error layer to build
 * documentation URLs.
 */
export const models: Record<string, { taskType: string, id: string }> = {
  'alibaba:happyhorse@1.0': { taskType: 'videoInference', id: 'alibaba-happyhorse-1-0' },
  'alibaba:qwen-image@2.0': { taskType: 'imageInference', id: 'alibaba-qwen-image-2-0' },
  'alibaba:qwen-image@2.0-pro': { taskType: 'imageInference', id: 'alibaba-qwen-image-2-0-pro' },
  'alibaba:qwen-image@2512': { taskType: 'imageInference', id: 'alibaba-qwen-image-2512' },
  'alibaba:qwen-image@layered': { taskType: 'imageInference', id: 'alibaba-qwen-image-layered' },
  'alibaba:qwen@3-tts-1.7b-base': { taskType: 'audioInference', id: 'alibaba-qwen3-tts-1-7b-base' },
  'alibaba:qwen@3-tts-1.7b-customvoice': { taskType: 'audioInference', id: 'alibaba-qwen3-tts-1-7b-customvoice' },
  'alibaba:qwen@3-tts-1.7b-voicedesign': { taskType: 'audioInference', id: 'alibaba-qwen3-tts-1-7b-voicedesign' },
  'alibaba:qwen@3.5-27b': { taskType: 'textInference', id: 'alibaba-qwen3-5-27b' },
  'alibaba:qwen@3.5-397b': { taskType: 'textInference', id: 'alibaba-qwen3-5-397b' },
  'alibaba:wan@2.6': { taskType: 'videoInference', id: 'alibaba-wan2-6' },
  'alibaba:wan@2.6-flash': { taskType: 'videoInference', id: 'alibaba-wan2-6-flash' },
  'alibaba:wan@2.6-image': { taskType: 'imageInference', id: 'alibaba-wan2-6-image' },
  'alibaba:wan@2.7': { taskType: 'videoInference', id: 'alibaba-wan2-7' },
  'alibaba:wan@2.7-image': { taskType: 'imageInference', id: 'alibaba-wan2-7-image' },
  'alibaba:wan@2.7-image-pro': { taskType: 'imageInference', id: 'alibaba-wan2-7-image-pro' },
  'anthropic:claude@fable-5': { taskType: 'textInference', id: 'anthropic-claude-fable-5' },
  'anthropic:claude@haiku-4.5': { taskType: 'textInference', id: 'anthropic-claude-haiku-4-5' },
  'anthropic:claude@opus-4.7': { taskType: 'textInference', id: 'anthropic-claude-opus-4-7' },
  'anthropic:claude@opus-4.8': { taskType: 'textInference', id: 'anthropic-claude-opus-4-8' },
  'anthropic:claude@sonnet-4.6': { taskType: 'textInference', id: 'anthropic-claude-sonnet-4-6' },
  'baidu:ernie-image@0': { taskType: 'imageInference', id: 'baidu-ernie-image' },
  'baidu:ernie-image@turbo': { taskType: 'imageInference', id: 'baidu-ernie-image-turbo' },
  'bfl:1@2': { taskType: 'imageInference', id: 'bfl-flux-1-fill-pro' },
  'bfl:1@3': { taskType: 'imageInference', id: 'bfl-flux-1-expand-pro' },
  'bfl:2@1': { taskType: 'imageInference', id: 'bfl-flux-1-1-pro' },
  'bfl:2@2': { taskType: 'imageInference', id: 'bfl-flux-1-1-pro-ultra' },
  'bfl:3@1': { taskType: 'imageInference', id: 'bfl-flux-1-kontext-pro' },
  'bfl:4@1': { taskType: 'imageInference', id: 'bfl-flux-1-kontext-max' },
  'bfl:5@1': { taskType: 'imageInference', id: 'bfl-flux-2-pro' },
  'bfl:6@1': { taskType: 'imageInference', id: 'bfl-flux-2-flex' },
  'bfl:7@1': { taskType: 'imageInference', id: 'bfl-flux-2-max' },
  'bfl:flux@erase': { taskType: 'imageInference', id: 'bfl-flux-erase' },
  'bfl:flux@outpainting': { taskType: 'imageInference', id: 'bfl-flux-outpainting' },
  'bfl:flux@vto': { taskType: 'imageInference', id: 'bfl-flux-virtual-try-on' },
  'bria:10@1': { taskType: 'imageInference', id: 'bria-3-2' },
  'bria:11@1': { taskType: 'imageInference', id: 'bria-image-replace-background' },
  'bria:2@1': { taskType: 'removeBackground', id: 'bria-rmbg-v2-0' },
  'bria:20@1': { taskType: 'imageInference', id: 'bria-fibo' },
  'bria:20@3': { taskType: 'imageInference', id: 'bria-fibo-lite' },
  'bria:21@1': { taskType: 'imageInference', id: 'bria-fibo-edit' },
  'bria:21@2': { taskType: 'imageInference', id: 'bria-fibo-edit-tools' },
  'bria:50@1': { taskType: 'upscale', id: 'bria-video-increase-resolution' },
  'bria:51@1': { taskType: 'removeBackground', id: 'bria-video-background-removal' },
  'bria:52@1': { taskType: 'upscale', id: 'bria-image-increase-resolution' },
  'bria:60@1': { taskType: 'videoInference', id: 'bria-video-eraser' },
  'bytedance:2@1': { taskType: 'videoInference', id: 'bytedance-seedance-1-0-pro' },
  'bytedance:2@2': { taskType: 'videoInference', id: 'bytedance-seedance-1-0-pro-fast' },
  'bytedance:5@0': { taskType: 'imageInference', id: 'bytedance-seedream-4-0' },
  'bytedance:5@1': { taskType: 'videoInference', id: 'bytedance-omnihuman-1' },
  'bytedance:5@2': { taskType: 'videoInference', id: 'bytedance-omnihuman-1-5' },
  'bytedance:50@1': { taskType: 'upscale', id: 'bytedance-video-upscaler' },
  'bytedance:seedance@1.5-pro': { taskType: 'videoInference', id: 'bytedance-seedance-1-5-pro' },
  'bytedance:seedance@2.0': { taskType: 'videoInference', id: 'bytedance-seedance-2-0' },
  'bytedance:seedance@2.0-fast': { taskType: 'videoInference', id: 'bytedance-seedance-2-0-fast' },
  'bytedance:seedream@4.5': { taskType: 'imageInference', id: 'bytedance-seedream-4-5' },
  'bytedance:seedream@5.0-lite': { taskType: 'imageInference', id: 'bytedance-seedream-5-0-lite' },
  'civitai:101055@128078': { taskType: 'imageInference', id: 'stabilityai-stable-diffusion-xl-v1-0-vae-fix' },
  'creatify:aurora@0': { taskType: 'videoInference', id: 'creatify-aurora-v1' },
  'creatify:aurora@fast': { taskType: 'videoInference', id: 'creatify-aurora-v1-fast' },
  'deepseek:v4@flash': { taskType: 'textInference', id: 'deepseek-v4-flash' },
  'deepseek:v4@pro': { taskType: 'textInference', id: 'deepseek-v4-pro' },
  'exactly:illustrative@training': { taskType: 'modelUpload', id: 'exactly-illustrative-training' },
  'exactly:photo@bright-pulse': { taskType: 'imageInference', id: 'exactly-photo-bright-pulse' },
  'exactly:photo@distant-reality': { taskType: 'imageInference', id: 'exactly-photo-distant-reality' },
  'exactly:photo@extreme-contrast': { taskType: 'imageInference', id: 'exactly-photo-extreme-contrast' },
  'exactly:photo@grain-film-look': { taskType: 'imageInference', id: 'exactly-photo-grain-film-look' },
  'exactly:photo@journey': { taskType: 'imageInference', id: 'exactly-photo-journey' },
  'exactly:photo@warm-light': { taskType: 'imageInference', id: 'exactly-photo-warm-light' },
  'fishaudio:s2.1@pro': { taskType: 'audioInference', id: 'fish-audio-s2-1-pro' },
  'google:1@1': { taskType: 'imageInference', id: 'google-imagen-3' },
  'google:1@2': { taskType: 'imageInference', id: 'google-imagen-3-fast' },
  'google:2@0': { taskType: 'videoInference', id: 'google-veo-2' },
  'google:2@1': { taskType: 'imageInference', id: 'google-imagen-4-preview' },
  'google:2@2': { taskType: 'imageInference', id: 'google-imagen-4-ultra' },
  'google:2@3': { taskType: 'imageInference', id: 'google-imagen-4-fast' },
  'google:3@0': { taskType: 'videoInference', id: 'google-veo-3' },
  'google:3@1': { taskType: 'videoInference', id: 'google-veo-3-fast' },
  'google:3@2': { taskType: 'videoInference', id: 'google-veo-3-1' },
  'google:3@3': { taskType: 'videoInference', id: 'google-veo-3-1-fast' },
  'google:4@1': { taskType: 'imageInference', id: 'google-nano-banana' },
  'google:4@2': { taskType: 'imageInference', id: 'google-nano-banana-pro' },
  'google:4@3': { taskType: 'imageInference', id: 'google-nano-banana-2' },
  'google:gemini@3-flash': { taskType: 'textInference', id: 'google-gemini-3-flash' },
  'google:gemini@3.1-flash-lite': { taskType: 'textInference', id: 'google-gemini-3-1-flash-lite' },
  'google:gemini@3.1-flash-tts': { taskType: 'audioInference', id: 'google-gemini-3-1-flash-tts' },
  'google:gemini@3.1-pro': { taskType: 'textInference', id: 'google-gemini-3-1-pro' },
  'google:gemini@3.5-flash': { taskType: 'textInference', id: 'google-gemini-3-5-flash' },
  'google:gemma@4-31b': { taskType: 'textInference', id: 'google-gemma-4-31b' },
  'google:veo@3.1-lite': { taskType: 'videoInference', id: 'google-veo-3-1-lite' },
  'heygen:avatar@4': { taskType: 'videoInference', id: 'heygen-avatar-iv' },
  'heygen:avatar@5': { taskType: 'videoInference', id: 'heygen-avatar-v' },
  'heygen:video-agent@0': { taskType: 'videoInference', id: 'heygen-video-agent' },
  'hyper3d:rodin@gen-2': { taskType: '3dInference', id: 'hyper3d-rodin-gen-2' },
  'ideogram:1@1': { taskType: 'imageInference', id: 'ideogram-1-0' },
  'ideogram:1@2': { taskType: 'imageInference', id: 'ideogram-1-0-remix' },
  'ideogram:2@1': { taskType: 'imageInference', id: 'ideogram-2a' },
  'ideogram:2@2': { taskType: 'imageInference', id: 'ideogram-2a-remix' },
  'ideogram:3@1': { taskType: 'imageInference', id: 'ideogram-2-0' },
  'ideogram:3@2': { taskType: 'imageInference', id: 'ideogram-2-0-remix' },
  'ideogram:3@3': { taskType: 'imageInference', id: 'ideogram-2-0-edit' },
  'ideogram:3@4': { taskType: 'imageInference', id: 'ideogram-2-0-reframe' },
  'ideogram:4@0': { taskType: 'imageInference', id: 'ideogram-4-0' },
  'ideogram:4@1': { taskType: 'imageInference', id: 'ideogram-3-0' },
  'ideogram:4@2': { taskType: 'imageInference', id: 'ideogram-3-0-remix' },
  'ideogram:4@3': { taskType: 'imageInference', id: 'ideogram-3-0-edit' },
  'ideogram:4@4': { taskType: 'imageInference', id: 'ideogram-3-0-reframe' },
  'ideogram:4@5': { taskType: 'imageInference', id: 'ideogram-3-0-replace-background' },
  'ideogram:layerize-text@0': { taskType: 'imageInference', id: 'ideogram-layerize-text' },
  'imagineart:1.5-pro@0': { taskType: 'imageInference', id: 'imagineart-1-5-pro' },
  'imagineart:1@5': { taskType: 'imageInference', id: 'imagineart-1-5' },
  'imagineart:2.0@0': { taskType: 'imageInference', id: 'imagineart-2-0' },
  'inworld:tts@1.5-max': { taskType: 'audioInference', id: 'inworld-tts-1-5-max' },
  'inworld:tts@1.5-mini': { taskType: 'audioInference', id: 'inworld-tts-1-5-mini' },
  'inworld:tts@2': { taskType: 'audioInference', id: 'inworld-tts-2' },
  'klingai:1@1': { taskType: 'videoInference', id: 'klingai-1-0-standard' },
  'klingai:1@2': { taskType: 'videoInference', id: 'klingai-1-0-pro' },
  'klingai:2@1': { taskType: 'videoInference', id: 'klingai-1-5-standard' },
  'klingai:2@2': { taskType: 'videoInference', id: 'klingai-1-5-pro' },
  'klingai:3@1': { taskType: 'videoInference', id: 'klingai-1-6-standard' },
  'klingai:3@2': { taskType: 'videoInference', id: 'klingai-1-6-pro' },
  'klingai:4@3': { taskType: 'videoInference', id: 'klingai-2-0-master' },
  'klingai:5@1': { taskType: 'videoInference', id: 'klingai-2-1-standard' },
  'klingai:5@2': { taskType: 'videoInference', id: 'klingai-2-1-pro' },
  'klingai:5@3': { taskType: 'videoInference', id: 'klingai-2-1-master' },
  'klingai:6@0': { taskType: 'videoInference', id: 'klingai-2-5-turbo-standard' },
  'klingai:6@1': { taskType: 'videoInference', id: 'klingai-2-5-turbo-pro' },
  'klingai:7@1': { taskType: 'videoInference', id: 'klingai-lip-sync' },
  'klingai:avatar@2.0-pro': { taskType: 'videoInference', id: 'klingai-avatar-2-0-pro' },
  'klingai:avatar@2.0-standard': { taskType: 'videoInference', id: 'klingai-avatar-2-0-standard' },
  'klingai:kling-image@3': { taskType: 'imageInference', id: 'klingai-image-3-0' },
  'klingai:kling-image@o1': { taskType: 'imageInference', id: 'klingai-image-o1' },
  'klingai:kling-image@o3': { taskType: 'imageInference', id: 'klingai-image-o3' },
  'klingai:kling-video@2.6-pro': { taskType: 'videoInference', id: 'klingai-video-2-6-pro' },
  'klingai:kling-video@2.6-standard': { taskType: 'videoInference', id: 'klingai-video-2-6-standard' },
  'klingai:kling-video@3-4k': { taskType: 'videoInference', id: 'klingai-video-3-0-4k' },
  'klingai:kling-video@3-pro': { taskType: 'videoInference', id: 'klingai-video-3-0-pro' },
  'klingai:kling-video@3-standard': { taskType: 'videoInference', id: 'klingai-video-3-0-standard' },
  'klingai:kling-video@3.0-turbo': { taskType: 'videoInference', id: 'klingai-video-3-0-turbo' },
  'klingai:kling-video@o3-4k': { taskType: 'videoInference', id: 'klingai-video-o3-4k' },
  'klingai:kling-video@o3-pro': { taskType: 'videoInference', id: 'klingai-video-o3-pro' },
  'klingai:kling-video@o3-standard': { taskType: 'videoInference', id: 'klingai-video-o3-standard' },
  'klingai:kling@o1': { taskType: 'videoInference', id: 'klingai-video-o1-pro' },
  'klingai:kling@o1-standard': { taskType: 'videoInference', id: 'klingai-video-o1-standard' },
  'krea:krea@2-large': { taskType: 'imageInference', id: 'krea-2-large' },
  'krea:krea@2-medium': { taskType: 'imageInference', id: 'krea-2-medium' },
  'krea:krea@2-turbo': { taskType: 'imageInference', id: 'krea-2-turbo' },
  'lightricks:2@0': { taskType: 'videoInference', id: 'lightricks-ltx-2-pro' },
  'lightricks:2@1': { taskType: 'videoInference', id: 'lightricks-ltx-2-fast' },
  'lightricks:3@1': { taskType: 'videoInference', id: 'lightricks-ltx-2-retake' },
  'lightricks:ltx@2': { taskType: 'videoInference', id: 'lightricks-ltx-2' },
  'lightricks:ltx@2.3': { taskType: 'videoInference', id: 'lightricks-ltx-2-3' },
  'lightricks:ltx@2.3-fast': { taskType: 'videoInference', id: 'lightricks-ltx-2-3-fast' },
  'luma:ray@3.2': { taskType: 'videoInference', id: 'luma-ray3-2' },
  'luma:uni@1': { taskType: 'imageInference', id: 'luma-uni-1' },
  'luma:uni@1-max': { taskType: 'imageInference', id: 'luma-uni-1-max' },
  'memories:1@1': { taskType: 'caption', id: 'memories-video-captioning' },
  'memories:2@1': { taskType: 'caption', id: 'memories-video-age-detection' },
  'meshy:meshy@6': { taskType: '3dInference', id: 'meshy-6' },
  'meta:sam@3d': { taskType: '3dInference', id: 'meta-sam-3d-objects' },
  'microsoft:trellis-2@4b': { taskType: '3dInference', id: 'microsoft-trellis-2' },
  'minimax:1@1': { taskType: 'videoInference', id: 'minimax-01' },
  'minimax:2@1': { taskType: 'videoInference', id: 'minimax-01-director' },
  'minimax:2@3': { taskType: 'videoInference', id: 'minimax-01-live' },
  'minimax:3@1': { taskType: 'videoInference', id: 'minimax-hailuo-02' },
  'minimax:4@1': { taskType: 'videoInference', id: 'minimax-hailuo-2-3' },
  'minimax:4@2': { taskType: 'videoInference', id: 'minimax-hailuo-2-3-fast' },
  'minimax:m2.5@0': { taskType: 'textInference', id: 'minimax-m2-5' },
  'minimax:m2.7@0': { taskType: 'textInference', id: 'minimax-m2-7' },
  'minimax:m2.7@highspeed': { taskType: 'textInference', id: 'minimax-m2-7-highspeed' },
  'minimax:m3@0': { taskType: 'textInference', id: 'minimax-m3' },
  'minimax:music@2.6': { taskType: 'audioInference', id: 'minimax-music-2-6' },
  'minimax:music@cover': { taskType: 'audioInference', id: 'minimax-music-cover' },
  'minimax:speech@2.8': { taskType: 'audioInference', id: 'minimax-speech-2-8' },
  'mirelo:1@1': { taskType: 'audioInference', id: 'mirelo-sfx-1-5' },
  'moonshotai:kimi@k2.6': { taskType: 'textInference', id: 'moonshotai-kimi-k2-6' },
  'openai:1@1': { taskType: 'imageInference', id: 'openai-gpt-image-1' },
  'openai:1@2': { taskType: 'imageInference', id: 'openai-gpt-image-1-mini' },
  'openai:3@1': { taskType: 'videoInference', id: 'openai-sora-2' },
  'openai:3@2': { taskType: 'videoInference', id: 'openai-sora-2-pro' },
  'openai:4@1': { taskType: 'imageInference', id: 'openai-gpt-image-1-5' },
  'openai:gpt-image@2': { taskType: 'imageInference', id: 'openai-gpt-image-2' },
  'openai:gpt@5.4': { taskType: 'textInference', id: 'openai-gpt-5-4' },
  'openai:gpt@5.4-mini': { taskType: 'textInference', id: 'openai-gpt-5-4-mini' },
  'openai:gpt@5.4-nano': { taskType: 'textInference', id: 'openai-gpt-5-4-nano' },
  'openai:gpt@5.4-pro': { taskType: 'textInference', id: 'openai-gpt-5-4-pro' },
  'openai:gpt@5.5': { taskType: 'textInference', id: 'openai-gpt-5-5' },
  'picsart:1@1': { taskType: 'vectorize', id: 'picsart-image-vectorizer' },
  'pixverse:1@1': { taskType: 'videoInference', id: 'pixverse-v3-5' },
  'pixverse:1@2': { taskType: 'videoInference', id: 'pixverse-v4' },
  'pixverse:1@3': { taskType: 'videoInference', id: 'pixverse-v4-5' },
  'pixverse:1@5': { taskType: 'videoInference', id: 'pixverse-v5' },
  'pixverse:1@5-fast': { taskType: 'videoInference', id: 'pixverse-v5-fast' },
  'pixverse:1@6': { taskType: 'videoInference', id: 'pixverse-v5-5' },
  'pixverse:1@7': { taskType: 'videoInference', id: 'pixverse-v5-6' },
  'pixverse:1@8': { taskType: 'videoInference', id: 'pixverse-v6' },
  'pixverse:lipsync@1': { taskType: 'videoInference', id: 'pixverse-lipsync' },
  'pixverse:modify@0': { taskType: 'videoInference', id: 'pixverse-modify' },
  'prunaai:1@1': { taskType: 'imageInference', id: 'prunaai-p-image' },
  'prunaai:2@1': { taskType: 'imageInference', id: 'prunaai-p-image-edit' },
  'prunaai:p-image@try-on': { taskType: 'imageInference', id: 'prunaai-p-image-try-on' },
  'prunaai:p-image@upscale': { taskType: 'upscale', id: 'prunaai-p-image-upscale' },
  'prunaai:p-video@0': { taskType: 'videoInference', id: 'prunaai-p-video' },
  'prunaai:p-video@animate': { taskType: 'videoInference', id: 'prunaai-p-video-animate' },
  'prunaai:p-video@avatar': { taskType: 'videoInference', id: 'prunaai-p-video-avatar' },
  'prunaai:p-video@replace': { taskType: 'videoInference', id: 'prunaai-p-video-replace' },
  'recraft:1@1': { taskType: 'vectorize', id: 'recraft-vectorize' },
  'recraft:v4-pro@0': { taskType: 'imageInference', id: 'recraft-v4-pro' },
  'recraft:v4-pro@vector': { taskType: 'vectorize', id: 'recraft-v4-pro-vector' },
  'recraft:v4.1-pro@0': { taskType: 'imageInference', id: 'recraft-v4-1-pro' },
  'recraft:v4.1-utility-pro@0': { taskType: 'imageInference', id: 'recraft-v4-1-utility-pro' },
  'recraft:v4.1-utility@0': { taskType: 'imageInference', id: 'recraft-v4-1-utility' },
  'recraft:v4.1@0': { taskType: 'imageInference', id: 'recraft-v4-1' },
  'recraft:v4@0': { taskType: 'imageInference', id: 'recraft-v4' },
  'recraft:v4@vector': { taskType: 'vectorize', id: 'recraft-v4-vector' },
  'rundiffusion:110@101': { taskType: 'imageInference', id: 'rundiffusion-juggernaut-lightning-flux' },
  'rundiffusion:120@100': { taskType: 'imageInference', id: 'rundiffusion-juggernaut-base-flux' },
  'rundiffusion:130@100': { taskType: 'imageInference', id: 'rundiffusion-juggernaut-pro-flux' },
  'rundiffusion:200@100': { taskType: 'imageInference', id: 'rundiffusion-juggernaut-z' },
  'runware:100@1': { taskType: 'imageInference', id: 'bfl-flux-1-schnell' },
  'runware:101@1': { taskType: 'imageInference', id: 'bfl-flux-1-dev' },
  'runware:102@1': { taskType: 'imageInference', id: 'bfl-flux-1-fill-dev' },
  'runware:106@1': { taskType: 'imageInference', id: 'bfl-flux-1-kontext-dev' },
  'runware:107@1': { taskType: 'imageInference', id: 'krea-flux-1-krea-dev' },
  'runware:108@1': { taskType: 'imageInference', id: 'alibaba-qwen-image' },
  'runware:108@20': { taskType: 'imageInference', id: 'alibaba-qwen-image-edit' },
  'runware:108@22': { taskType: 'imageInference', id: 'alibaba-qwen-image-edit-plus' },
  'runware:109@1': { taskType: 'removeBackground', id: 'rembg-v1-4' },
  'runware:110@1': { taskType: 'removeBackground', id: 'bria-rmbg-v2-0-open' },
  'runware:111@1': { taskType: 'imageInference', id: 'flux-1-dev-srpo' },
  'runware:112@1': { taskType: 'removeBackground', id: 'birefnet-v1-base' },
  'runware:112@10': { taskType: 'removeBackground', id: 'birefnet-portrait' },
  'runware:112@2': { taskType: 'removeBackground', id: 'birefnet-v1-base-cod' },
  'runware:112@3': { taskType: 'removeBackground', id: 'birefnet-dis' },
  'runware:112@5': { taskType: 'removeBackground', id: 'birefnet-general' },
  'runware:112@6': { taskType: 'removeBackground', id: 'birefnet-general-resolution-512x512-fp16' },
  'runware:112@7': { taskType: 'removeBackground', id: 'birefnet-hrsod-dhu' },
  'runware:112@8': { taskType: 'removeBackground', id: 'birefnet-massive-tr-dis5k-tr-tes' },
  'runware:112@9': { taskType: 'removeBackground', id: 'birefnet-matting' },
  'runware:150@2': { taskType: 'caption', id: 'meta-llava-1-6-mistral-7b' },
  'runware:151@1': { taskType: 'caption', id: 'openai-clip-vit-l-14' },
  'runware:152@1': { taskType: 'caption', id: 'alibaba-qwen2-5-vl-3b-instruct' },
  'runware:152@2': { taskType: 'caption', id: 'alibaba-qwen2-5-vl-7b-instruct' },
  'runware:152@50': { taskType: 'caption', id: 'qwen2-5-vl-7b-age-detector' },
  'runware:153@1': { taskType: 'caption', id: 'vit-age-classifier' },
  'runware:154@1': { taskType: 'caption', id: 'open-age-detection' },
  'runware:180@1': { taskType: 'imageInference', id: 'tencent-hunyuanimage-3-0' },
  'runware:190@1': { taskType: 'videoInference', id: 'ovi' },
  'runware:200@6': { taskType: 'videoInference', id: 'alibaba-wan2-2-a14b' },
  'runware:200@8': { taskType: 'videoInference', id: 'alibaba-wan2-2-animate' },
  'runware:201@1': { taskType: 'videoInference', id: 'alibaba-wan2-5-preview' },
  'runware:201@10': { taskType: 'imageInference', id: 'alibaba-wan2-5-preview-image' },
  'runware:210@1': { taskType: 'videoInference', id: 'kandinsky-5-0-lite' },
  'runware:300@1': { taskType: 'imageInference', id: 'object-eraser' },
  'runware:35@1': { taskType: 'imageMasking', id: 'yolov8n-face' },
  'runware:35@10': { taskType: 'imageMasking', id: 'mediapipe-eyes-lips-mesh' },
  'runware:35@11': { taskType: 'imageMasking', id: 'mediapipe-nose-eyes-mesh' },
  'runware:35@12': { taskType: 'imageMasking', id: 'mediapipe-nose-lips-mesh' },
  'runware:35@13': { taskType: 'imageMasking', id: 'mediapipe-nose-mesh' },
  'runware:35@14': { taskType: 'imageMasking', id: 'mediapipe-lips-mesh' },
  'runware:35@15': { taskType: 'imageMasking', id: 'mediapipe-eyes-mesh' },
  'runware:35@2': { taskType: 'imageMasking', id: 'yolov8s-face' },
  'runware:35@3': { taskType: 'imageMasking', id: 'yolov8n-hand' },
  'runware:35@4': { taskType: 'imageMasking', id: 'yolov8n-person-seg' },
  'runware:35@5': { taskType: 'imageMasking', id: 'yolov8s-person-seg' },
  'runware:35@6': { taskType: 'imageMasking', id: 'mediapipe-face-full' },
  'runware:35@7': { taskType: 'imageMasking', id: 'mediapipe-face-short' },
  'runware:35@8': { taskType: 'imageMasking', id: 'mediapipe-face-mesh' },
  'runware:35@9': { taskType: 'imageMasking', id: 'mediapipe-face-mesh-eyes-only' },
  'runware:400@1': { taskType: 'imageInference', id: 'bfl-flux-2-dev' },
  'runware:400@2': { taskType: 'imageInference', id: 'bfl-flux-2-klein-9b' },
  'runware:400@3': { taskType: 'imageInference', id: 'bfl-flux-2-klein-9b-base' },
  'runware:400@4': { taskType: 'imageInference', id: 'bfl-flux-2-klein-4b' },
  'runware:400@5': { taskType: 'imageInference', id: 'bfl-flux-2-klein-4b-base' },
  'runware:400@6': { taskType: 'imageInference', id: 'bfl-flux-2-klein-9b-kv' },
  'runware:5@1': { taskType: 'imageInference', id: 'stabilityai-stable-diffusion-3' },
  'runware:500@1': { taskType: 'upscale', id: 'clarity' },
  'runware:501@1': { taskType: 'upscale', id: 'ccsr' },
  'runware:502@1': { taskType: 'upscale', id: 'stable-diffusion-latent-upscaler' },
  'runware:503@1': { taskType: 'upscale', id: 'swinir' },
  'runware:504@1': { taskType: 'upscale', id: 'real-esrgan' },
  'runware:97@1': { taskType: 'imageInference', id: 'hidream-i1-full' },
  'runware:97@2': { taskType: 'imageInference', id: 'hidream-i1-dev' },
  'runware:97@3': { taskType: 'imageInference', id: 'hidream-i1-fast' },
  'runware:ace-step@v1.5-base': { taskType: 'audioInference', id: 'ace-step-v1-5-base' },
  'runware:ace-step@v1.5-turbo': { taskType: 'audioInference', id: 'ace-step-v1-5-turbo' },
  'runware:ace-step@v1.5-xl-base': { taskType: 'audioInference', id: 'ace-step-v1-5-xl-base' },
  'runware:ace-step@v1.5-xl-sft': { taskType: 'audioInference', id: 'ace-step-v1-5-xl-sft' },
  'runware:ace-step@v1.5-xl-turbo': { taskType: 'audioInference', id: 'ace-step-v1-5-xl-turbo' },
  'runware:controlnet-preprocess@canny': { taskType: 'controlNetPreprocess', id: 'controlnet-preprocess-canny' },
  'runware:controlnet-preprocess@depth': { taskType: 'controlNetPreprocess', id: 'controlnet-preprocess-depth' },
  'runware:controlnet-preprocess@lineart': { taskType: 'controlNetPreprocess', id: 'controlnet-preprocess-lineart' },
  'runware:controlnet-preprocess@lineart-anime': { taskType: 'controlNetPreprocess', id: 'controlnet-preprocess-lineart-anime' },
  'runware:controlnet-preprocess@mlsd': { taskType: 'controlNetPreprocess', id: 'controlnet-preprocess-mlsd' },
  'runware:controlnet-preprocess@normalbae': { taskType: 'controlNetPreprocess', id: 'controlnet-preprocess-normalbae' },
  'runware:controlnet-preprocess@openpose': { taskType: 'controlNetPreprocess', id: 'controlnet-preprocess-openpose' },
  'runware:controlnet-preprocess@scribble': { taskType: 'controlNetPreprocess', id: 'controlnet-preprocess-scribble' },
  'runware:controlnet-preprocess@seg': { taskType: 'controlNetPreprocess', id: 'controlnet-preprocess-seg' },
  'runware:controlnet-preprocess@shuffle': { taskType: 'controlNetPreprocess', id: 'controlnet-preprocess-shuffle' },
  'runware:controlnet-preprocess@softedge': { taskType: 'controlNetPreprocess', id: 'controlnet-preprocess-softedge' },
  'runware:controlnet-preprocess@tile': { taskType: 'controlNetPreprocess', id: 'controlnet-preprocess-tile' },
  'runware:dia@1.6b': { taskType: 'audioInference', id: 'dia-1-6b' },
  'runware:dia2@2b': { taskType: 'audioInference', id: 'dia2-2b' },
  'runware:glm-image@0': { taskType: 'imageInference', id: 'zai-glm-image' },
  'runware:kandinsky-5.0-image-lite@1': { taskType: 'imageInference', id: 'kandinsky-5-0-image-lite' },
  'runware:llama-3-1-8b@prompt-enhancer': { taskType: 'promptEnhance', id: 'llama-3-1-8b-prompt-enhancer' },
  'runware:twinflow-z-image-turbo@0': { taskType: 'imageInference', id: 'twinflow-z-image-turbo' },
  'runware:z-image@0': { taskType: 'imageInference', id: 'alibaba-z-image' },
  'runware:z-image@turbo': { taskType: 'imageInference', id: 'alibaba-z-image-turbo' },
  'runway:1@1': { taskType: 'videoInference', id: 'runway-gen-4-turbo' },
  'runway:1@2': { taskType: 'videoInference', id: 'runway-gen-4-5' },
  'runway:2@1': { taskType: 'videoInference', id: 'runway-aleph' },
  'runway:4@1': { taskType: 'imageInference', id: 'runway-gen-4-image' },
  'runway:4@2': { taskType: 'imageInference', id: 'runway-gen-4-image-turbo' },
  'runway:aleph@2.0': { taskType: 'videoInference', id: 'runway-aleph-2-0' },
  'skywork:skyreels@v4': { taskType: 'videoInference', id: 'skywork-skyreels-v4' },
  'sourceful:1@0': { taskType: 'imageInference', id: 'sourceful-riverflow-1-1-mini' },
  'sourceful:1@1': { taskType: 'imageInference', id: 'sourceful-riverflow-1-1' },
  'sourceful:1@2': { taskType: 'imageInference', id: 'sourceful-riverflow-1-1-pro' },
  'sourceful:2@1': { taskType: 'imageInference', id: 'sourceful-riverflow-2-preview-standard' },
  'sourceful:2@2': { taskType: 'imageInference', id: 'sourceful-riverflow-2-preview-fast' },
  'sourceful:2@3': { taskType: 'imageInference', id: 'sourceful-riverflow-2-preview-max' },
  'sourceful:riverflow-2.0@fast': { taskType: 'imageInference', id: 'sourceful-riverflow-2-0-fast' },
  'sourceful:riverflow-2.0@pro': { taskType: 'imageInference', id: 'sourceful-riverflow-2-0-pro' },
  'sourceful:riverflow-2.5@fast': { taskType: 'imageInference', id: 'sourceful-riverflow-2-5-fast' },
  'sourceful:riverflow-2.5@pro': { taskType: 'imageInference', id: 'sourceful-riverflow-2-5-pro' },
  'sync:lipsync-2-pro@1': { taskType: 'videoInference', id: 'sync-lipsync-2-pro' },
  'sync:lipsync-2@1': { taskType: 'videoInference', id: 'sync-lipsync-2' },
  'sync:lipsync@3': { taskType: 'videoInference', id: 'sync-3' },
  'sync:react-1@1': { taskType: 'videoInference', id: 'sync-react-1' },
  'tencent:hunyuan-3d@3.1-pro': { taskType: '3dInference', id: 'tencent-hunyuan-3d-3-1-pro' },
  'tencent:hunyuan-3d@3.1-rapid': { taskType: '3dInference', id: 'tencent-hunyuan-3d-3-1-rapid' },
  'topazlabs:starlight-precise@2.5': { taskType: 'upscale', id: 'topazlabs-starlight-precise-2-5' },
  'tripo:v3.1@0': { taskType: '3dInference', id: 'tripo-v3-1' },
  'veed:fabric@1.0': { taskType: 'videoInference', id: 'veed-fabric-1-0' },
  'vidu:1@0': { taskType: 'videoInference', id: 'vidu-q1-classic' },
  'vidu:1@1': { taskType: 'videoInference', id: 'vidu-q1' },
  'vidu:1@5': { taskType: 'videoInference', id: 'vidu-1-5' },
  'vidu:2@0': { taskType: 'videoInference', id: 'vidu-2-0' },
  'vidu:3@1': { taskType: 'videoInference', id: 'vidu-q2-pro' },
  'vidu:3@2': { taskType: 'videoInference', id: 'vidu-q2-turbo' },
  'vidu:4@1': { taskType: 'videoInference', id: 'vidu-q3' },
  'vidu:4@2': { taskType: 'videoInference', id: 'vidu-q3-turbo' },
  'vidu:q1@image': { taskType: 'imageInference', id: 'vidu-q1-image' },
  'xai:grok-imagine@image': { taskType: 'imageInference', id: 'xai-grok-imagine-image' },
  'xai:grok-imagine@image-quality': { taskType: 'imageInference', id: 'xai-grok-imagine-image-quality' },
  'xai:grok-imagine@video': { taskType: 'videoInference', id: 'xai-grok-imagine-video' },
  'xai:grok-imagine@video-1.5-preview': { taskType: 'videoInference', id: 'xai-grok-imagine-video-1-5-preview' },
  'xai:grok@4.3': { taskType: 'textInference', id: 'xai-grok-4-3' },
  'xai:tts@0': { taskType: 'audioInference', id: 'xai-tts' },
  'zai:glm@4.7': { taskType: 'textInference', id: 'zai-glm-4-7' },
  'zai:glm@5.1': { taskType: 'textInference', id: 'zai-glm-5-1' }
}

/**
 * Curated model AIRs → result type. Enables automatic return-type narrowing:
 * `client.run({ model: 'inworld:tts@2' })` returns `AudioInferenceResult[]`
 * without an explicit generic.
 */
export type ModelResultMap = {
  'alibaba:happyhorse@1.0': VideoInferenceResult
  'alibaba:qwen-image@2.0': ImageInferenceResult
  'alibaba:qwen-image@2.0-pro': ImageInferenceResult
  'alibaba:qwen-image@2512': ImageInferenceResult
  'alibaba:qwen-image@layered': ImageInferenceResult
  'alibaba:qwen@3-tts-1.7b-base': AudioInferenceResult
  'alibaba:qwen@3-tts-1.7b-customvoice': AudioInferenceResult
  'alibaba:qwen@3-tts-1.7b-voicedesign': AudioInferenceResult
  'alibaba:qwen@3.5-27b': TextInferenceResult
  'alibaba:qwen@3.5-397b': TextInferenceResult
  'alibaba:wan@2.6': VideoInferenceResult
  'alibaba:wan@2.6-flash': VideoInferenceResult
  'alibaba:wan@2.6-image': ImageInferenceResult
  'alibaba:wan@2.7': VideoInferenceResult
  'alibaba:wan@2.7-image': ImageInferenceResult
  'alibaba:wan@2.7-image-pro': ImageInferenceResult
  'anthropic:claude@fable-5': TextInferenceResult
  'anthropic:claude@haiku-4.5': TextInferenceResult
  'anthropic:claude@opus-4.7': TextInferenceResult
  'anthropic:claude@opus-4.8': TextInferenceResult
  'anthropic:claude@sonnet-4.6': TextInferenceResult
  'baidu:ernie-image@0': ImageInferenceResult
  'baidu:ernie-image@turbo': ImageInferenceResult
  'bfl:1@2': ImageInferenceResult
  'bfl:1@3': ImageInferenceResult
  'bfl:2@1': ImageInferenceResult
  'bfl:2@2': ImageInferenceResult
  'bfl:3@1': ImageInferenceResult
  'bfl:4@1': ImageInferenceResult
  'bfl:5@1': ImageInferenceResult
  'bfl:6@1': ImageInferenceResult
  'bfl:7@1': ImageInferenceResult
  'bfl:flux@erase': ImageInferenceResult
  'bfl:flux@outpainting': ImageInferenceResult
  'bfl:flux@vto': ImageInferenceResult
  'bria:10@1': ImageInferenceResult
  'bria:11@1': ImageInferenceResult
  'bria:2@1': RemoveBackgroundResult
  'bria:20@1': ImageInferenceResult
  'bria:20@3': ImageInferenceResult
  'bria:21@1': ImageInferenceResult
  'bria:21@2': ImageInferenceResult
  'bria:50@1': UpscaleResult
  'bria:51@1': RemoveBackgroundResult
  'bria:52@1': UpscaleResult
  'bria:60@1': VideoInferenceResult
  'bytedance:2@1': VideoInferenceResult
  'bytedance:2@2': VideoInferenceResult
  'bytedance:5@0': ImageInferenceResult
  'bytedance:5@1': VideoInferenceResult
  'bytedance:5@2': VideoInferenceResult
  'bytedance:50@1': UpscaleResult
  'bytedance:seedance@1.5-pro': VideoInferenceResult
  'bytedance:seedance@2.0': VideoInferenceResult
  'bytedance:seedance@2.0-fast': VideoInferenceResult
  'bytedance:seedream@4.5': ImageInferenceResult
  'bytedance:seedream@5.0-lite': ImageInferenceResult
  'civitai:101055@128078': ImageInferenceResult
  'creatify:aurora@0': VideoInferenceResult
  'creatify:aurora@fast': VideoInferenceResult
  'deepseek:v4@flash': TextInferenceResult
  'deepseek:v4@pro': TextInferenceResult
  'exactly:illustrative@training': ModelUploadResult
  'exactly:photo@bright-pulse': ImageInferenceResult
  'exactly:photo@distant-reality': ImageInferenceResult
  'exactly:photo@extreme-contrast': ImageInferenceResult
  'exactly:photo@grain-film-look': ImageInferenceResult
  'exactly:photo@journey': ImageInferenceResult
  'exactly:photo@warm-light': ImageInferenceResult
  'fishaudio:s2.1@pro': AudioInferenceResult
  'google:1@1': ImageInferenceResult
  'google:1@2': ImageInferenceResult
  'google:2@0': VideoInferenceResult
  'google:2@1': ImageInferenceResult
  'google:2@2': ImageInferenceResult
  'google:2@3': ImageInferenceResult
  'google:3@0': VideoInferenceResult
  'google:3@1': VideoInferenceResult
  'google:3@2': VideoInferenceResult
  'google:3@3': VideoInferenceResult
  'google:4@1': ImageInferenceResult
  'google:4@2': ImageInferenceResult
  'google:4@3': ImageInferenceResult
  'google:gemini@3-flash': TextInferenceResult
  'google:gemini@3.1-flash-lite': TextInferenceResult
  'google:gemini@3.1-flash-tts': AudioInferenceResult
  'google:gemini@3.1-pro': TextInferenceResult
  'google:gemini@3.5-flash': TextInferenceResult
  'google:gemma@4-31b': TextInferenceResult
  'google:veo@3.1-lite': VideoInferenceResult
  'heygen:avatar@4': VideoInferenceResult
  'heygen:avatar@5': VideoInferenceResult
  'heygen:video-agent@0': VideoInferenceResult
  'hyper3d:rodin@gen-2': ThreeDInferenceResult
  'ideogram:1@1': ImageInferenceResult
  'ideogram:1@2': ImageInferenceResult
  'ideogram:2@1': ImageInferenceResult
  'ideogram:2@2': ImageInferenceResult
  'ideogram:3@1': ImageInferenceResult
  'ideogram:3@2': ImageInferenceResult
  'ideogram:3@3': ImageInferenceResult
  'ideogram:3@4': ImageInferenceResult
  'ideogram:4@0': ImageInferenceResult
  'ideogram:4@1': ImageInferenceResult
  'ideogram:4@2': ImageInferenceResult
  'ideogram:4@3': ImageInferenceResult
  'ideogram:4@4': ImageInferenceResult
  'ideogram:4@5': ImageInferenceResult
  'ideogram:layerize-text@0': ImageInferenceResult
  'imagineart:1.5-pro@0': ImageInferenceResult
  'imagineart:1@5': ImageInferenceResult
  'imagineart:2.0@0': ImageInferenceResult
  'inworld:tts@1.5-max': AudioInferenceResult
  'inworld:tts@1.5-mini': AudioInferenceResult
  'inworld:tts@2': AudioInferenceResult
  'klingai:1@1': VideoInferenceResult
  'klingai:1@2': VideoInferenceResult
  'klingai:2@1': VideoInferenceResult
  'klingai:2@2': VideoInferenceResult
  'klingai:3@1': VideoInferenceResult
  'klingai:3@2': VideoInferenceResult
  'klingai:4@3': VideoInferenceResult
  'klingai:5@1': VideoInferenceResult
  'klingai:5@2': VideoInferenceResult
  'klingai:5@3': VideoInferenceResult
  'klingai:6@0': VideoInferenceResult
  'klingai:6@1': VideoInferenceResult
  'klingai:7@1': VideoInferenceResult
  'klingai:avatar@2.0-pro': VideoInferenceResult
  'klingai:avatar@2.0-standard': VideoInferenceResult
  'klingai:kling-image@3': ImageInferenceResult
  'klingai:kling-image@o1': ImageInferenceResult
  'klingai:kling-image@o3': ImageInferenceResult
  'klingai:kling-video@2.6-pro': VideoInferenceResult
  'klingai:kling-video@2.6-standard': VideoInferenceResult
  'klingai:kling-video@3-4k': VideoInferenceResult
  'klingai:kling-video@3-pro': VideoInferenceResult
  'klingai:kling-video@3-standard': VideoInferenceResult
  'klingai:kling-video@3.0-turbo': VideoInferenceResult
  'klingai:kling-video@o3-4k': VideoInferenceResult
  'klingai:kling-video@o3-pro': VideoInferenceResult
  'klingai:kling-video@o3-standard': VideoInferenceResult
  'klingai:kling@o1': VideoInferenceResult
  'klingai:kling@o1-standard': VideoInferenceResult
  'krea:krea@2-large': ImageInferenceResult
  'krea:krea@2-medium': ImageInferenceResult
  'krea:krea@2-turbo': ImageInferenceResult
  'lightricks:2@0': VideoInferenceResult
  'lightricks:2@1': VideoInferenceResult
  'lightricks:3@1': VideoInferenceResult
  'lightricks:ltx@2': VideoInferenceResult
  'lightricks:ltx@2.3': VideoInferenceResult
  'lightricks:ltx@2.3-fast': VideoInferenceResult
  'luma:ray@3.2': VideoInferenceResult
  'luma:uni@1': ImageInferenceResult
  'luma:uni@1-max': ImageInferenceResult
  'memories:1@1': CaptionResult
  'memories:2@1': CaptionResult
  'meshy:meshy@6': ThreeDInferenceResult
  'meta:sam@3d': ThreeDInferenceResult
  'microsoft:trellis-2@4b': ThreeDInferenceResult
  'minimax:1@1': VideoInferenceResult
  'minimax:2@1': VideoInferenceResult
  'minimax:2@3': VideoInferenceResult
  'minimax:3@1': VideoInferenceResult
  'minimax:4@1': VideoInferenceResult
  'minimax:4@2': VideoInferenceResult
  'minimax:m2.5@0': TextInferenceResult
  'minimax:m2.7@0': TextInferenceResult
  'minimax:m2.7@highspeed': TextInferenceResult
  'minimax:m3@0': TextInferenceResult
  'minimax:music@2.6': AudioInferenceResult
  'minimax:music@cover': AudioInferenceResult
  'minimax:speech@2.8': AudioInferenceResult
  'mirelo:1@1': AudioInferenceResult
  'moonshotai:kimi@k2.6': TextInferenceResult
  'openai:1@1': ImageInferenceResult
  'openai:1@2': ImageInferenceResult
  'openai:3@1': VideoInferenceResult
  'openai:3@2': VideoInferenceResult
  'openai:4@1': ImageInferenceResult
  'openai:gpt-image@2': ImageInferenceResult
  'openai:gpt@5.4': TextInferenceResult
  'openai:gpt@5.4-mini': TextInferenceResult
  'openai:gpt@5.4-nano': TextInferenceResult
  'openai:gpt@5.4-pro': TextInferenceResult
  'openai:gpt@5.5': TextInferenceResult
  'picsart:1@1': VectorizeResult
  'pixverse:1@1': VideoInferenceResult
  'pixverse:1@2': VideoInferenceResult
  'pixverse:1@3': VideoInferenceResult
  'pixverse:1@5': VideoInferenceResult
  'pixverse:1@5-fast': VideoInferenceResult
  'pixverse:1@6': VideoInferenceResult
  'pixverse:1@7': VideoInferenceResult
  'pixverse:1@8': VideoInferenceResult
  'pixverse:lipsync@1': VideoInferenceResult
  'pixverse:modify@0': VideoInferenceResult
  'prunaai:1@1': ImageInferenceResult
  'prunaai:2@1': ImageInferenceResult
  'prunaai:p-image@try-on': ImageInferenceResult
  'prunaai:p-image@upscale': UpscaleResult
  'prunaai:p-video@0': VideoInferenceResult
  'prunaai:p-video@animate': VideoInferenceResult
  'prunaai:p-video@avatar': VideoInferenceResult
  'prunaai:p-video@replace': VideoInferenceResult
  'recraft:1@1': VectorizeResult
  'recraft:v4-pro@0': ImageInferenceResult
  'recraft:v4-pro@vector': VectorizeResult
  'recraft:v4.1-pro@0': ImageInferenceResult
  'recraft:v4.1-utility-pro@0': ImageInferenceResult
  'recraft:v4.1-utility@0': ImageInferenceResult
  'recraft:v4.1@0': ImageInferenceResult
  'recraft:v4@0': ImageInferenceResult
  'recraft:v4@vector': VectorizeResult
  'rundiffusion:110@101': ImageInferenceResult
  'rundiffusion:120@100': ImageInferenceResult
  'rundiffusion:130@100': ImageInferenceResult
  'rundiffusion:200@100': ImageInferenceResult
  'runware:100@1': ImageInferenceResult
  'runware:101@1': ImageInferenceResult
  'runware:102@1': ImageInferenceResult
  'runware:106@1': ImageInferenceResult
  'runware:107@1': ImageInferenceResult
  'runware:108@1': ImageInferenceResult
  'runware:108@20': ImageInferenceResult
  'runware:108@22': ImageInferenceResult
  'runware:109@1': RemoveBackgroundResult
  'runware:110@1': RemoveBackgroundResult
  'runware:111@1': ImageInferenceResult
  'runware:112@1': RemoveBackgroundResult
  'runware:112@10': RemoveBackgroundResult
  'runware:112@2': RemoveBackgroundResult
  'runware:112@3': RemoveBackgroundResult
  'runware:112@5': RemoveBackgroundResult
  'runware:112@6': RemoveBackgroundResult
  'runware:112@7': RemoveBackgroundResult
  'runware:112@8': RemoveBackgroundResult
  'runware:112@9': RemoveBackgroundResult
  'runware:150@2': CaptionResult
  'runware:151@1': CaptionResult
  'runware:152@1': CaptionResult
  'runware:152@2': CaptionResult
  'runware:152@50': CaptionResult
  'runware:153@1': CaptionResult
  'runware:154@1': CaptionResult
  'runware:180@1': ImageInferenceResult
  'runware:190@1': VideoInferenceResult
  'runware:200@6': VideoInferenceResult
  'runware:200@8': VideoInferenceResult
  'runware:201@1': VideoInferenceResult
  'runware:201@10': ImageInferenceResult
  'runware:210@1': VideoInferenceResult
  'runware:300@1': ImageInferenceResult
  'runware:35@1': ImageMaskingResult
  'runware:35@10': ImageMaskingResult
  'runware:35@11': ImageMaskingResult
  'runware:35@12': ImageMaskingResult
  'runware:35@13': ImageMaskingResult
  'runware:35@14': ImageMaskingResult
  'runware:35@15': ImageMaskingResult
  'runware:35@2': ImageMaskingResult
  'runware:35@3': ImageMaskingResult
  'runware:35@4': ImageMaskingResult
  'runware:35@5': ImageMaskingResult
  'runware:35@6': ImageMaskingResult
  'runware:35@7': ImageMaskingResult
  'runware:35@8': ImageMaskingResult
  'runware:35@9': ImageMaskingResult
  'runware:400@1': ImageInferenceResult
  'runware:400@2': ImageInferenceResult
  'runware:400@3': ImageInferenceResult
  'runware:400@4': ImageInferenceResult
  'runware:400@5': ImageInferenceResult
  'runware:400@6': ImageInferenceResult
  'runware:5@1': ImageInferenceResult
  'runware:500@1': UpscaleResult
  'runware:501@1': UpscaleResult
  'runware:502@1': UpscaleResult
  'runware:503@1': UpscaleResult
  'runware:504@1': UpscaleResult
  'runware:97@1': ImageInferenceResult
  'runware:97@2': ImageInferenceResult
  'runware:97@3': ImageInferenceResult
  'runware:ace-step@v1.5-base': AudioInferenceResult
  'runware:ace-step@v1.5-turbo': AudioInferenceResult
  'runware:ace-step@v1.5-xl-base': AudioInferenceResult
  'runware:ace-step@v1.5-xl-sft': AudioInferenceResult
  'runware:ace-step@v1.5-xl-turbo': AudioInferenceResult
  'runware:controlnet-preprocess@canny': ControlNetPreprocessResult
  'runware:controlnet-preprocess@depth': ControlNetPreprocessResult
  'runware:controlnet-preprocess@lineart': ControlNetPreprocessResult
  'runware:controlnet-preprocess@lineart-anime': ControlNetPreprocessResult
  'runware:controlnet-preprocess@mlsd': ControlNetPreprocessResult
  'runware:controlnet-preprocess@normalbae': ControlNetPreprocessResult
  'runware:controlnet-preprocess@openpose': ControlNetPreprocessResult
  'runware:controlnet-preprocess@scribble': ControlNetPreprocessResult
  'runware:controlnet-preprocess@seg': ControlNetPreprocessResult
  'runware:controlnet-preprocess@shuffle': ControlNetPreprocessResult
  'runware:controlnet-preprocess@softedge': ControlNetPreprocessResult
  'runware:controlnet-preprocess@tile': ControlNetPreprocessResult
  'runware:dia@1.6b': AudioInferenceResult
  'runware:dia2@2b': AudioInferenceResult
  'runware:glm-image@0': ImageInferenceResult
  'runware:kandinsky-5.0-image-lite@1': ImageInferenceResult
  'runware:llama-3-1-8b@prompt-enhancer': PromptEnhanceResult
  'runware:twinflow-z-image-turbo@0': ImageInferenceResult
  'runware:z-image@0': ImageInferenceResult
  'runware:z-image@turbo': ImageInferenceResult
  'runway:1@1': VideoInferenceResult
  'runway:1@2': VideoInferenceResult
  'runway:2@1': VideoInferenceResult
  'runway:4@1': ImageInferenceResult
  'runway:4@2': ImageInferenceResult
  'runway:aleph@2.0': VideoInferenceResult
  'skywork:skyreels@v4': VideoInferenceResult
  'sourceful:1@0': ImageInferenceResult
  'sourceful:1@1': ImageInferenceResult
  'sourceful:1@2': ImageInferenceResult
  'sourceful:2@1': ImageInferenceResult
  'sourceful:2@2': ImageInferenceResult
  'sourceful:2@3': ImageInferenceResult
  'sourceful:riverflow-2.0@fast': ImageInferenceResult
  'sourceful:riverflow-2.0@pro': ImageInferenceResult
  'sourceful:riverflow-2.5@fast': ImageInferenceResult
  'sourceful:riverflow-2.5@pro': ImageInferenceResult
  'sync:lipsync-2-pro@1': VideoInferenceResult
  'sync:lipsync-2@1': VideoInferenceResult
  'sync:lipsync@3': VideoInferenceResult
  'sync:react-1@1': VideoInferenceResult
  'tencent:hunyuan-3d@3.1-pro': ThreeDInferenceResult
  'tencent:hunyuan-3d@3.1-rapid': ThreeDInferenceResult
  'topazlabs:starlight-precise@2.5': UpscaleResult
  'tripo:v3.1@0': ThreeDInferenceResult
  'veed:fabric@1.0': VideoInferenceResult
  'vidu:1@0': VideoInferenceResult
  'vidu:1@1': VideoInferenceResult
  'vidu:1@5': VideoInferenceResult
  'vidu:2@0': VideoInferenceResult
  'vidu:3@1': VideoInferenceResult
  'vidu:3@2': VideoInferenceResult
  'vidu:4@1': VideoInferenceResult
  'vidu:4@2': VideoInferenceResult
  'vidu:q1@image': ImageInferenceResult
  'xai:grok-imagine@image': ImageInferenceResult
  'xai:grok-imagine@image-quality': ImageInferenceResult
  'xai:grok-imagine@video': VideoInferenceResult
  'xai:grok-imagine@video-1.5-preview': VideoInferenceResult
  'xai:grok@4.3': TextInferenceResult
  'xai:tts@0': AudioInferenceResult
  'zai:glm@4.7': TextInferenceResult
  'zai:glm@5.1': TextInferenceResult
}

export type ModelAIR = keyof ModelResultMap

/** Loose params for untyped `.run()` calls — model + anything. */
export type RunParams = {
  model: string
  [key: string]: unknown
}
