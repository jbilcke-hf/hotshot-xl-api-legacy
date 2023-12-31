import express, { Request, Response, NextFunction } from "express"

import { inference } from "./inference.mts"
import { initFolders } from "./initFolders.mts"
import { ImageInferenceSize } from "./types.mts"

declare module 'express-serve-static-core' {
  interface Request {
    files: any;
  }
}

initFolders()

const app = express()
const port = 7860

// note that use a small limit here
app.use(express.json({limit: '1mb'}))
app.use(express.urlencoded({limit: '1mb', extended: true}))

app.post("/", async (req: Request, res: Response, _next: NextFunction) => {

  const request = req.body as {
    prompt: string
    lora: string
    size: ImageInferenceSize
  }

  if (!request.prompt) {
    console.log("Invalid prompt")
    res.status(400)
    res.write(JSON.stringify({ result: "", error: "invalid prompt" }))
    res.end()
    return
  }

  if (!request.lora) {
    console.log("Invalid LoRA")
    res.status(400)
    res.write(JSON.stringify({ result: "", error: "invalid LoRA" }))
    res.end()
    return
  }

  const { prompt, lora, size } = request

  try {
    const assetUrl = await inference({ prompt, lora, size })
    res.status(200)
    res.write(assetUrl)
    res.end()
  } catch (error) {
    res.status(500)
    res.write(`Couldn't generate gif. Error: ${error}`)
    res.end()
  }
});

app.get("/", async (req: Request, res: Response) => {
  res.send("Hotshot-XL API is a micro-service used to generate gif using a custom LoRA.");
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
