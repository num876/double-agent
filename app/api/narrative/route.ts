import { GoogleGenAI, Type, Schema } from '@google/genai';
import { SYSTEM_PROMPT, buildUserMessage } from '@/lib/claude'
import { GameState } from '@/types/game'

// Make sure to set GEMINI_API_KEY in .env.local
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "the scene, 150–300 words, written as prose",
    },
    speakerLines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          character: { type: Type.STRING },
          line: { type: Type.STRING },
        },
      },
    },
    updatedState: {
      type: Type.OBJECT,
      description: "Full updated GameState. Must include all fields from the input state, updated appropriately.",
      properties: {
        missionId: { type: Type.STRING },
        turn: { type: Type.INTEGER },
        playerCodename: { type: Type.STRING },
        location: { type: Type.STRING },
        threatLevel: { type: Type.STRING },
        cover: { type: Type.INTEGER },
        agencyTrust: { type: Type.INTEGER },
        missionObjective: { type: Type.STRING },
        currentSceneTitle: { type: Type.STRING },
        gameOver: { type: Type.BOOLEAN },
        outcome: { type: Type.STRING },
        assets: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              codename: { type: Type.STRING },
              role: { type: Type.STRING },
              location: { type: Type.STRING },
              trustLevel: { type: Type.INTEGER },
              status: { type: Type.STRING },
              lastContact: { type: Type.STRING },
              notes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
        intel: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              classification: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              verified: { type: Type.BOOLEAN },
              acquiredOnTurn: { type: Type.INTEGER },
            },
          },
        },
      },
    },
    choices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          risk: { type: Type.STRING },
        },
      },
    },
    sceneTitle: {
      type: Type.STRING,
      description: "3–5 word title for this moment",
    },
  },
  required: ["narrative", "updatedState", "choices", "sceneTitle"],
};

export async function POST(req: Request) {
  try {
    const { state, playerChoice, messageHistory } = await req.json() as {
      state: GameState
      playerChoice: string
      messageHistory: { role: 'user' | 'assistant'; content: string }[]
    }

    const userMessage = buildUserMessage(state, playerChoice)

    const contents = messageHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    })

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of responseStream) {
              if (chunk.text) {
                controller.enqueue(new TextEncoder().encode(chunk.text))
              }
            }
          } catch (e) {
            console.error('Stream error:', e)
            controller.error(e)
          } finally {
            controller.close()
          }
        }
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked'
        }
      }
    )
  } catch (error: unknown) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 })
  }
}
