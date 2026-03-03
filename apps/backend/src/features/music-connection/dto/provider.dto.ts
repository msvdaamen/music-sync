import { type } from "arktype";

export const providerDto = type({
  provider: "'spotify'|'apple_music'",
});

export type ProviderDto = typeof providerDto.infer;
