import { FastifyInstance } from "fastify";
import { z } from 'zod'
import { prisma } from "../lib/prisma";


export async function createTranscriptionRoute(app: FastifyInstance) {
    app.post('/videos/:videoId/transcription', async (req, reply) => {
        const paramsSchema = z.object({
            videoId: z.string().uuid()
        })
        
        const bodySchema = z.object({
            prompt: z.string()
        })


        const { videoId } = paramsSchema.parse(req.params)
        const { prompt } = bodySchema.parse(req.body)

        return {
            videoId,
            prompt
        }
        
    })
}