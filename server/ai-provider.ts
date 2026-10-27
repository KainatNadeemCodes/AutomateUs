export interface LLMProvider {
  generate(prompt: string): Promise<string>;
  generateJSON<T>(prompt: string): Promise<T>;
}

export interface TTSProvider {
  synthesize(text: string): Promise<Buffer>;
}

export interface ImageGenerationProvider {
  generateImage(prompt: string): Promise<Buffer>;
}

export interface VideoRenderProvider {
  renderVideo(spec: unknown): Promise<Buffer>;
}

class MockLLMProvider implements LLMProvider {
  async generate(prompt: string): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return `Mocked LLM response for prompt: ${prompt.substring(0, 30)}...`;
  }

  async generateJSON<T>(prompt: string): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return a dummy object assuming it matches T's expected shape loosely.
    // In a real implementation, you'd use a parser and structured output.
    return {
      title: "Mocked Generated Title",
      description: "Mocked Generated Description based on: " + prompt.substring(0, 30),
      tags: ["mock", "test", "automation"]
    } as unknown as T;
  }
}

class MockTTSProvider implements TTSProvider {
  async synthesize(text: string): Promise<Buffer> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return a dummy small buffer representing audio
    return Buffer.from(`mock_audio_data_for: ${text.substring(0, 30)}`);
  }
}

class MockImageProvider implements ImageGenerationProvider {
  async generateImage(prompt: string): Promise<Buffer> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Buffer.from(`mock_image_data_for: ${prompt.substring(0, 30)}`);
  }
}

class MockVideoProvider implements VideoRenderProvider {
  async renderVideo(spec: unknown): Promise<Buffer> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Buffer.from(`mock_video_data`);
  }
}

// Export singletons for use across the application
export const llmProvider: LLMProvider = new MockLLMProvider();
export const ttsProvider: TTSProvider = new MockTTSProvider();
export const imageProvider: ImageGenerationProvider = new MockImageProvider();
export const videoProvider: VideoRenderProvider = new MockVideoProvider();
