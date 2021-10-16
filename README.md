# File Crunch
Simple CLI utility to test file system speed on existing files. Good for benchmarking file system implementation, file system fragmentation and burning read cache heat map.

## Install
`npm install -g https://github.com/Cerlancism/file-crunch`

## Usage
`file-crunch --help`

```
Usage: File Crunch [options] [command]

File speed benchmarking tool on existing files.

Options:
  -v, --version              output the version number
  -h, --help                 display help for command

Commands:
  read [options] <PathLike>
  help [command]             display help for command          display help for command
```

`file-crunch read --help`
```
Usage: File Crunch read [options] <PathLike>

Options:
  -r, --recursive
  -h, --help       display help for command     display help for command
```

## Examples
`file-crunch read --recursive test/`
```
Completed 0.000       0.145 MB/s C:\Users\CHE\Documents\Github\file-crunch\test\test.js
Completed 0.193    5317.939 MB/s C:\Users\CHE\Documents\Github\file-crunch\test\rand-file\random-1G-1.bin
Completed 0.193    5316.970 MB/s C:\Users\CHE\Documents\Github\file-crunch\test\rand-file\random-1G-2.bin
Completed 0.191    5372.091 MB/s C:\Users\CHE\Documents\Github\file-crunch\test\rand-file\random-1G-3.bin
Completed 0.189    5418.118 MB/s C:\Users\CHE\Documents\Github\file-crunch\test\rand-file\random-1G-4.bin
```

## TODO
- [ ] Allow buffer size to be specified https://github.com/Cerlancism/file-crunch/issues/1
- [ ] Silent mode
- [ ] Concurrent mode
- [ ] Generate Random files like https://github.com/Cerlancism/random-file-generator
- [ ] Tests
- [ ] Sorting
