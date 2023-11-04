import { FastifyInstance } from "fastify";
import { fastifyMultipart } from '@fastify/multipart';
import { prisma } from "../lib/prisma";
import fs from "node:fs"
import { pipeline } from "node:stream"
import path from "node:path";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";

const pump = promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance) {
    app.register(fastifyMultipart, {
        limits: {
            fileSize: 1_048_576 * 25 // 25MB
        }
    })
    app.post('/videos', async (req, reply) => {

        const data = await req.file()
        if(!data) {
            return reply.status(400).send({error: 'missing file'})
        }

        const extension = path.extname(data.filename)
        if(extension!== '.mp3') {
            return reply.status(400).send({error: 'invalid file extension'})
        }
        const fileBaseName = path.basename(data.filename, extension)
        const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`

        const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

        await pump(data.file, fs.createWriteStream(uploadDestination))

        const video = await prisma.video.create({
            data: {
                name: data.filename,
                path: uploadDestination
            }
        })

        return {
            video
        }

    })
}