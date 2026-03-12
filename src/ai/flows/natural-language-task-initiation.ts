
'use server';
/**
 * @fileOverview This file implements the Natural Language Task Initiation flow.
 * It interprets a user's natural language command and translates it into a structured
 * representation of the intended task, including a high-level action plan.
 *
 * - naturalLanguageTaskInitiation - The main function to call the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { openRouterFallback } from '@/ai/openrouter-fallback';

const NaturalLanguageTaskInitiationInputSchema = z.object({
  command: z.string().describe('The natural language command from the user.'),
});
export type NaturalLanguageTaskInitiationInput = z.infer<typeof NaturalLanguageTaskInitiationInputSchema>;

const NaturalLanguageTaskInitiationOutputSchema = z.object({
  taskName: z.string().describe('A concise name for the identified task.'),
  taskType: z.string().describe('A categorization of the task.'),
  parameters: z.record(z.any()).optional(),
  actionPlanSummary: z.string().describe('A high-level, step-by-step summary of the plan.'),
});
export type NaturalLanguageTaskInitiationOutput = z.infer<typeof NaturalLanguageTaskInitiationOutputSchema>;

export async function naturalLanguageTaskInitiation(input: NaturalLanguageTaskInitiationInput): Promise<NaturalLanguageTaskInitiationOutput> {
  try {
    const result = await naturalLanguageTaskInitiationFlow(input);
    return result;
  } catch (error: any) {
    console.warn("Primary AI Core (Gemini) exhausted or failed. Attempting OpenRouter Fallback.");
    
    const promptString = `Interpret the following user command and translate it into a structured task definition for desktop automation.
    User command: ${input.command}`;

    const fallbackResult = await openRouterFallback<NaturalLanguageTaskInitiationOutput>(
      promptString, 
      NaturalLanguageTaskInitiationOutputSchema
    );

    if (fallbackResult) {
      return {
        ...fallbackResult,
        actionPlanSummary: `${fallbackResult.actionPlanSummary} (via Fallback Core)`
      };
    }

    // Heuristic Fallback if both AI providers fail
    const cmd = input.command.toLowerCase();
    let taskName = "General Automation";
    let taskType = "simulation";
    let summary = "Local heuristic planning active.";

    if (cmd.includes('notepad') || cmd.includes('write')) {
      taskName = "Write in Notepad";
      taskType = "document_creation";
      summary = "Opening Notepad and preparing text buffer.";
    }

    return {
      taskName,
      taskType,
      actionPlanSummary: `${summary} (Neural Fallback Mode)`,
      parameters: { fallback: true }
    };
  }
}

const naturalLanguagePrompt = ai.definePrompt({
  name: 'naturalLanguageTaskInitiationPrompt',
  input: { schema: NaturalLanguageTaskInitiationInputSchema },
  output: { schema: NaturalLanguageTaskInitiationOutputSchema },
  prompt: `You are 'Everything', an advanced AI desktop operating layer. Your role is to interpret user commands in natural language and translate them into a structured task definition for automation.

User command: {{{command}}}`,
});

const naturalLanguageTaskInitiationFlow = ai.defineFlow(
  {
    name: 'naturalLanguageTaskInitiationFlow',
    inputSchema: NaturalLanguageTaskInitiationInputSchema,
    outputSchema: NaturalLanguageTaskInitiationOutputSchema,
  },
  async (input) => {
    const { output } = await naturalLanguagePrompt(input);
    return output!;
  }
);
