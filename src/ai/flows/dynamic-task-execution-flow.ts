
'use server';
/**
 * @fileOverview This file defines a Genkit flow for interpreting user commands
 * and generating executable steps based on screen context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { openRouterFallback } from '@/ai/openrouter-fallback';

const DynamicTaskExecutionInputSchema = z.object({
  userCommand: z.string(),
  currentScreenImage: z.string(),
  uiContext: z.string().optional(),
});
export type DynamicTaskExecutionInput = z.infer<typeof DynamicTaskExecutionInputSchema>;

const DynamicTaskExecutionOutputSchema = z.object({
  overallPlan: z.string(),
  steps: z.array(
    z.object({
      description: z.string().describe('Detailed description of the action. Mention the application name (e.g., "Notepad") if relevant.'),
      actionType: z.enum(['click', 'type', 'drag', 'scroll', 'navigate', 'hotkey', 'verify']),
      targetElement: z.string().optional().describe('The UI element name, e.g., "Notepad Window" or "Start Button".'),
      value: z.string().optional().describe('The content to type or the hotkey to press.'),
      coordinates: z.object({
        x: z.number(),
        y: z.number(),
      }),
    })
  ),
  status: z.enum(['planning', 'executing', 'awaiting_verification', 'completed', 'error']),
  nextActionInstruction: z.string(),
});
export type DynamicTaskExecutionOutput = z.infer<typeof DynamicTaskExecutionOutputSchema>;

export async function dynamicTaskExecution(
  input: DynamicTaskExecutionInput
): Promise<DynamicTaskExecutionOutput> {
  try {
    return await dynamicTaskExecutionFlow(input);
  } catch (error: any) {
    console.warn("Primary AI Core exhausted. Attempting OpenRouter Fallback.");

    const promptString = `Analyze the screen context and generate a detailed automation plan.
    User Command: ${input.userCommand}
    UI Context: ${input.uiContext}
    
    IMPORTANT REQUIREMENTS:
    1. If the user wants to write or create something (like a poem or note), you MUST generate that text and include a step with actionType: 'type' and put the full generated content in the 'value' field. 
    2. In the 'description' or 'targetElement' for relevant steps, ALWAYS explicitly mention the application name (e.g., "Notepad", "Blender", "Browser") so the system can switch the view.
    3. Provide coordinates as percentages (0-100).
    
    Current Screen Context: ${input.uiContext}`;

    const fallbackResult = await openRouterFallback<DynamicTaskExecutionOutput>(
      promptString,
      DynamicTaskExecutionOutputSchema
    );

    if (fallbackResult) return fallbackResult;

    // Last resort local fallback
    return {
      overallPlan: "Neural Core Offline. Using heuristic survival mode.",
      status: "executing",
      nextActionInstruction: "Opening Notepad for document creation...",
      steps: [
        {
          description: "Clicking Taskbar Search to find Notepad",
          actionType: "click",
          targetElement: "Notepad Search",
          coordinates: { x: 50, y: 95 }
        },
        {
          description: "Typing generated content into Notepad",
          actionType: "type",
          targetElement: "Notepad Editor",
          value: "Heuristic simulation active. The primary AI core is cooling down, but I am still processing your request locally in this virtual environment.",
          coordinates: { x: 45, y: 45 }
        }
      ]
    };
  }
}

const dynamicTaskExecutionPrompt = ai.definePrompt({
  name: 'dynamicTaskExecutionPrompt',
  input: { schema: DynamicTaskExecutionInputSchema },
  output: { schema: DynamicTaskExecutionOutputSchema },
  prompt: `You are Everything, an AI desktop operating layer. Generate a detailed automation plan.
IMPORTANT: Provide 'coordinates' as percentages (0-100). If typing is required (like writing a poem), put the full generated text in 'value'.
CRITICAL: Explicitly mention the application name (e.g. "Notepad", "Browser") in the 'description' or 'targetElement' of steps so the environment can switch views.

User Command: {{{userCommand}}}
UI Context: {{{uiContext}}}
Current Screen Image: {{media url=currentScreenImage}}`,
});

const dynamicTaskExecutionFlow = ai.defineFlow(
  {
    name: 'dynamicTaskExecutionFlow',
    inputSchema: DynamicTaskExecutionInputSchema,
    outputSchema: DynamicTaskExecutionOutputSchema,
  },
  async (input) => {
    const { output } = await dynamicTaskExecutionPrompt(input);
    return output!;
  }
);
