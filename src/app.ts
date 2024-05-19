import express, { Application, Request, Response } from 'express'
import cors from 'cors'
const app: Application = express()

//

app.use(express.json())

app.use(cors())

app.get('/', (req: Request, res: Response) => {
  res.send('This server is running smoothly')
})

export default app