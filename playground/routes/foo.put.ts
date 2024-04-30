// TODO: for testing; uninstall zod before merging
import { z } from 'zod';

// TODO: for testing; delete before merging
export default eventHandler({
  bodyValidator: z.object({
    newNum: z.number()
  }).parse,
  handler: async (event) => {
    const { newNum: num } = await readBody(event);
    const str = num.toString();

    return {
      num,
      str
    };
  }
});
