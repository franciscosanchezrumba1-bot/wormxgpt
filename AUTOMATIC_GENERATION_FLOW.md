# Automatic Media Generation Flow

## Overview
This document describes how the automatic media generation feature works in WormXGPT's Pollinations integration.

## Flow Diagram

```
User Input (Prompt)
        |
        v
+---------------------------------------+
| Check: Manual Command?                |
| - /image [prompt]                     |
| - /video [prompt]                     |
| - /audio [prompt]                     |
+---------------------------------------+
        |
   YES  |  NO
        v
+---------------------------------------+
| Execute Manual Command                |
| (takes precedence)                    |
+---------------------------------------+
        |
        v
    [DONE]


        |
   NO   |
        v
+---------------------------------------+
| Check Model Capabilities              |
| (from MODEL_OPTIONS)                  |
+---------------------------------------+
        |
        v
+---------------------------------------+
| Has imageGen flag?                    |
+---------------------------------------+
   YES  |  NO
        v
+---------------------------------------+
| Generate Image Automatically          |
| - Use prompt as-is                    |
| - Route to generateImage()            |
+---------------------------------------+
        |
        v
    [DONE]


        |
   NO   |
        v
+---------------------------------------+
| Has videoGen flag?                    |
+---------------------------------------+
   YES  |  NO
        v
+---------------------------------------+
| Generate Video Automatically          |
| - Use prompt as-is                    |
| - Route to generateVideo()            |
+---------------------------------------+
        |
        v
    [DONE]


        |
   NO   |
        v
+---------------------------------------+
| Has audioGen flag?                    |
+---------------------------------------+
   YES  |  NO
        v
+---------------------------------------+
| Generate Audio Automatically          |
| - Use prompt as-is                    |
| - Route to generateAudio()            |
+---------------------------------------+
        |
        v
    [DONE]


        |
   NO   |
        v
+---------------------------------------+
| Default: Text Generation              |
| - Route to generateText()             |
+---------------------------------------+
        |
        v
    [DONE]
```

## Priority Order

1. **Manual Commands** (Highest Priority)
   - `/image [prompt]` → Always generates image
   - `/video [prompt]` → Always generates video
   - `/audio [prompt]` → Always generates audio
   - These work with ANY model

2. **Model Capability Detection**
   - Checks `MODEL_OPTIONS` for capability flags
   - `imageGen: true` → Automatic image generation
   - `videoGen: true` → Automatic video generation
   - `audioGen: true` → Automatic audio generation

3. **Default Behavior** (Lowest Priority)
   - Falls back to text generation
   - Used for standard chat models

## Example Scenarios

### Scenario 1: Image Model with Direct Prompt
```
Selected Model: "flux" (imageGen: true)
User Input: "A cyberpunk hacker terminal"
Result: → Automatically generates image
```

### Scenario 2: Text Model with Manual Command
```
Selected Model: "openai" (no special flags)
User Input: "/image A cyberpunk hacker terminal"
Result: → Generates image via manual command
```

### Scenario 3: Video Model with Manual Image Command
```
Selected Model: "veo" (videoGen: true)
User Input: "/image A cyberpunk hacker terminal"
Result: → Generates image (manual command takes precedence)
```

### Scenario 4: Text Model with Regular Prompt
```
Selected Model: "openai" (no special flags)
User Input: "Explain quantum computing"
Result: → Generates text response
```

## Implementation Details

### Code Location
- **Primary integration area**: `/home/runner/work/wormxgpt/wormxgpt/services/pollinations.ts`
- **Current entry points**: `generateChat()` and `streamChat()`
- **Related logic**: manual command handling, model capability checks, and text fallback routing

### Key Decision Points
1. **Manual command handling**: Check `/image`, `/video`, and `/audio` first
2. **Model capability checks**: Route by `imageGen`, `videoGen`, and `audioGen`
3. **Text fallback**: Default to text generation when no media path applies

### Model Metadata
- **File**: `/home/runner/work/wormxgpt/wormxgpt/constants.ts`
- **Array**: `MODEL_OPTIONS`
- **Flags**: `imageGen`, `videoGen`, `audioGen`

## Benefits

✅ **User Experience**
- No commands needed for media models
- More intuitive workflow
- Faster media generation

✅ **Flexibility**
- Manual commands still available
- Works across all model types
- Backward compatible

✅ **Maintainability**
- Single source of truth (MODEL_OPTIONS)
- Clear priority order
- Easy to extend with new media types
