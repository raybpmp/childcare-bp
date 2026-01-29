import { z } from "zod";

export const homeDaycareSchema = z.object({
    titleText: z.string(),
    smallEnrollment: z.number(),
    largeEnrollment: z.number(),
    ctaText: z.string(),
});
