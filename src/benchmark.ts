import EventEmitter from 'events'
import fs from 'fs'
import readline from 'readline'

import { performance } from 'perf_hooks'

const DefaultProgressFrequency = 1000
const DefaultBufferSize = Math.pow(2, 20)

export declare interface FileReadBenchmark
{
    on(event: 'open', listener: (file: fs.PathLike, size: number) => void): this;

    on(event: "progress", listener: (
        file: fs.PathLike,
        /** Progress between 0~1 */
        progress: number,
        size: number,
        totalTime: number,
        totalRead: number,
        currentTime: number,
        currentRead: number) => void): this;

    on(event: "completed", listener: (file: fs.PathLike, totalTime: number, totalRead: number) => void): this
}

export class FileReadBenchmark extends EventEmitter
{
    buffer: Buffer
    reportingFrequency: number

    constructor(buffer = Buffer.alloc(DefaultBufferSize), progressFrequency = DefaultProgressFrequency)
    {
        super()

        this.reportingFrequency = progressFrequency
        this.buffer = buffer
    }

    invoke(file: fs.PathLike)
    {
        let fd;
        try
        {
            fd = fs.openSync(file, "r")

            const stats = fs.statSync(file)
            const size = stats.size

            this.emit("open", file, size)

            let previousTime = performance.now()
            let totalTime = 0
            let progressTime = 0
            let progressRead = 0
            let totalRead = 0
            let currentRead = 0
            while ((currentRead = fs.readSync(fd, this.buffer, 0, this.buffer.length, totalRead)) > 0)
            {
                totalRead += currentRead
                progressRead += currentRead

                const currentTime = performance.now()
                const deltaTime = currentTime - previousTime
                previousTime = currentTime
                totalTime += deltaTime
                progressTime += deltaTime

                if (progressTime > DefaultProgressFrequency)
                {
                    this.emit("progress", file, totalRead / size, size, totalTime, totalRead, progressTime, progressRead)
                    progressTime -= DefaultProgressFrequency
                    progressRead = 0
                }
            }

            fs.closeSync(fd)

            if (totalRead != size)
            {
                throw `Total read not equal to file size. Read: ${totalRead}, expected: ${size}`
            }

            this.emit("completed", file, totalTime, totalRead)
        } catch (error)
        {
            if (fd)
            {
                fs.close(fd)
            }
            throw error
        }
    }
}

export function benchmarkFiles(files: fs.PathLike[], ignoreErrors = true)
{
    const tester = new FileReadBenchmark(Buffer.alloc(2 ** 20))

    tester.on("progress", (file, progress, size, totalTime, totalRead, progressTime, progressRead) =>
    {
        const displaySpeed = (progressRead / progressTime * 1000) / 1048576

        readline.clearLine(process.stderr, 0)
        readline.cursorTo(process.stderr, 0)
        process.stderr.write([
            `${(totalTime / 1000).toFixed(1)}`.padEnd(5),
            displaySpeed.toFixed(3).padStart(10), "MB/s",
            progress.toLocaleString("en", { style: "percent", minimumFractionDigits: 2 }).padStart(6, "0"),
            "of",
            size.toLocaleString("en"),
            file,
        ].join(" "))
    })

    tester.on("completed", (file, totalTime, totalRead) =>
    {
        readline.clearLine(process.stderr, 0)
        readline.cursorTo(process.stderr, 0)
        console.log(
            "Completed",
            `${(totalTime / 1000).toFixed(3)}`.padEnd(8),
            ((totalRead / totalTime * 1000) / 1048576).toFixed(3).padStart(8),
            "MB/s",
            file
        )
    })
    for (const file of files)
    {
        try
        {
            tester.invoke(file)
        } catch (error)
        {
            console.error(error)
            if (ignoreErrors)
            {
                continue
            }
            process.exit(1)
        }
    }
}
