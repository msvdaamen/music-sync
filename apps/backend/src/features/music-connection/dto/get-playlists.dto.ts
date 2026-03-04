import { type } from "arktype";

export const getPlaylistsDto = type({
  limit: type("string.numeric.parse").pipe(type("number<=50")),
  offset: type("string.numeric.parse").pipe(type("number>=0")),
});

export type GetPlaylistsInput = typeof getPlaylistsDto.infer;
