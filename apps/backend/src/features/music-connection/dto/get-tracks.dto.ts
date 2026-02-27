import { type } from "arktype";

export const getTracksDto = type({
  limit: type('string.numeric.parse').pipe(type('number>=50')),
  offset: type('string.numeric.parse').pipe(type('number>=0'))
})

export type GetTracksInput = typeof getTracksDto.infer;
