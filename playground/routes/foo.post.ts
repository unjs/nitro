// TODO: for testing; uninstall zod before merging
import { z } from 'zod';

// TODO: for testing; delete before merging
export default eventHandler({
  bodyValidator: z.object({
    num: z.number()
  }).parse,
  handler: async (event) => {
    const { num } = await readBody(event);
    const str = num.toString();

    return {
      num,
      str
    };
  }
});
