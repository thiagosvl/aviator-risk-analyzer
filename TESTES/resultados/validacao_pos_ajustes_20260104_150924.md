
node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [TransformError]: Transform failed with 1 error:
/home/ubuntu/aviator-analyzer/TESTES/generate_test_scenarios.ts:117:44: ERROR: Expected ";" but found "streak"
    at failureErrorWithLog (/home/ubuntu/aviator-analyzer/node_modules/.pnpm/esbuild@0.25.9/node_modules/esbuild/lib/main.js:1467:15)
    at /home/ubuntu/aviator-analyzer/node_modules/.pnpm/esbuild@0.25.9/node_modules/esbuild/lib/main.js:736:50
    at responseCallbacks.<computed> (/home/ubuntu/aviator-analyzer/node_modules/.pnpm/esbuild@0.25.9/node_modules/esbuild/lib/main.js:603:9)
    at handleIncomingPacket (/home/ubuntu/aviator-analyzer/node_modules/.pnpm/esbuild@0.25.9/node_modules/esbuild/lib/main.js:658:12)
    at Socket.readFromStdout (/home/ubuntu/aviator-analyzer/node_modules/.pnpm/esbuild@0.25.9/node_modules/esbuild/lib/main.js:581:7)
    at Socket.emit (node:events:524:28)
    at addChunk (node:internal/streams/readable:561:12)
    at readableAddChunkPushByteMode (node:internal/streams/readable:512:3)
    at Readable.push (node:internal/streams/readable:392:5)
    at Pipe.onStreamRead (node:internal/stream_base_commons:189:23)

Node.js v22.13.0
