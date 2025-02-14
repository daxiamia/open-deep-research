import { createOpenAI } from '@ai-sdk/openai';
import { getEncoding } from 'js-tiktoken';

import { RecursiveCharacterTextSplitter } from './text-splitter';

// Model Display Information
export const AI_MODEL_DISPLAY = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    logo: '/providers/openai.webp',
    vision: true,
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    logo: '/providers/openai.webp',
    vision: true,
  },
  'o3-mini': {
    id: 'o3-mini',
    name: 'o3 mini',
    logo: '/providers/openai.webp',
    vision: false,
  },
} as const;

export type AIModel = keyof typeof AI_MODEL_DISPLAY;
export type AIModelDisplayInfo = (typeof AI_MODEL_DISPLAY)[AIModel];
export const availableModels = Object.values(AI_MODEL_DISPLAY);

// OpenAI Client
const openai = createOpenAI({
  apiKey: process.env.OPENAI_KEY!,
  baseURL: process.env.OPENAI_ENDPOINT,
});

console.log('openai:', openai);
// Create model instances with configurations
export function createModel(modelId: AIModel, apiKey?: string) {
  const client = createOpenAI({
    apiKey: apiKey || process.env.OPENAI_KEY!,
    baseURL: process.env.OPENAI_ENDPOINT,
  });

  return client(modelId, {
    structuredOutputs: true,
    ...(modelId === 'o3-mini' ? { reasoningEffort: 'medium' } : {}),
  });
}

// Token handling
const MinChunkSize = 140;
const encoder = getEncoding('o200k_base');

// trim prompt to maximum context size
export function trimPrompt(prompt: string, contextSize = 120_000) {
  if (!prompt) {
    console.log('No prompt provided, returning empty string');
    return '';
  }

  const length = encoder.encode(prompt).length;
  if (length <= contextSize) {
    console.log('Prompt original:' + prompt);
    return prompt;
  }

  const overflowTokens = length - contextSize;
  const chunkSize = prompt.length - overflowTokens * 3;
  if (chunkSize < MinChunkSize) {
    console.log('returning MinChunkSize:' + prompt.slice(0, MinChunkSize));
    return prompt.slice(0, MinChunkSize);
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: 0,
  });
  const trimmedPrompt = splitter.splitText(prompt)[0] ?? '';

  if (trimmedPrompt.length === prompt.length) {
    console.log('trimmedPrompt cut:' + trimPrompt(prompt.slice(0, chunkSize), contextSize));
    return trimPrompt(prompt.slice(0, chunkSize), contextSize);
  }

  console.log('trimmedPrompt:' + trimPrompt(trimmedPrompt, contextSize));
  return trimPrompt(trimmedPrompt, contextSize);
}
