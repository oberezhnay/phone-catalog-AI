import { config } from './config/env.js';
import { createApp } from './app.js';

const app = createApp();

const port = config.PORT;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
