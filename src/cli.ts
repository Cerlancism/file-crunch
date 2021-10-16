#! /usr/bin/env node
import path from 'path'
import fs from 'fs'

import { Argument, Option, Command } from "commander";

import { benchmarkFiles } from './benchmark.js';

const program = new Command("File Crunch")

program.version("0.0.1", '-v, --version')
program.description("File speed benchmarking tool on existing files.")

const argsHello = new Argument("extras")
argsHello.required = false
argsHello.variadic = true

const argFileRequired = new Argument("PathLike").argRequired()


const benchMarkCmd = program.command("read")
    .addArgument(argFileRequired)
    .addOption(new Option('-r, --recursive'))
    .action(target =>
    {
        if (fs.lstatSync(target).isDirectory())
        {
            const recursive = benchMarkCmd.opts().recursive as boolean
            function traverse(dir: string)
            {
                const full = path.resolve(dir)
                const items = fs.readdirSync(full, { withFileTypes: true })
                benchmarkFiles(items.filter(x => x.isFile()).map(x => path.join(full, x.name)))

                if (recursive)
                {
                    const recurses = items.filter(x => x.isDirectory())
                    for (const dir of recurses)
                    {
                        traverse(path.join(full, dir.name))
                    }
                }
            }
            traverse(target)
        }
        else
        {
            benchmarkFiles([target])
        }
    })

program.parse()
