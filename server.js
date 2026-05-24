import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Path to the C++ executable
const cppExecutable = path.resolve(__dirname, '../NumericalMomen_api');

app.get('/api/calculate', (req, res) => {
  const { method, func, a, b, x0, x1 } = req.query;

  let args = [method, `"${func}"`].join(' ');
  
  if (method === 'bisection') {
    args += ` ${a} ${b}`;
  } else if (method === 'secant') {
    args += ` ${x0} ${x1}`;
  } else if (method === 'newton') {
    args += ` ${x0}`;
  }

  const command = `${cppExecutable} ${args}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing C++: ${error}`);
      return res.status(500).json({ error: 'Internal Server Error', details: stderr });
    }
    try {
      const result = JSON.parse(stdout);
      res.json(result);
    } catch (parseError) {
      console.error(`Error parsing C++ output: ${parseError}`);
      res.status(500).json({ error: 'Error parsing calculation result', raw: stdout });
    }
  });
});

app.listen(port, () => {
  console.log(`C++ Backend listening at http://localhost:${port}`);
});
