import { Request, Response, NextFunction } from "express";

interface Bucket {
  hits: number;
  resetAt: number;
}

// ====================================================================================================== //
//        Rate limit in memoria: il server gira su una sola istanza, quindi basta e non serve Redis.
//        Serve a evitare che qualcuno riempia la classifica con uno script.
// ====================================================================================================== //
export const rateLimit = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  const buckets = new Map<string, Bucket>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = `${req.ip ?? "unknown"}:${req.baseUrl}${req.path}`;

    // PULIZIA PERIODICA DELLE CHIAVI SCADUTE
    if (buckets.size > 5000) {
      for (const [bucketKey, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(bucketKey);
      }
    }

    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { hits: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    if (bucket.hits >= options.max) {
      res.status(429).json({
        error:
          options.message || "Troppe richieste, riprova tra qualche minuto",
      });
      return;
    }

    bucket.hits += 1;
    next();
  };
};
