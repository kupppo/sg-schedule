export const shouldMock = () =>
  process.env.USE_MOCKS === "1" || process.env.NEXT_PUBLIC_USE_MOCKS === "1"
export default shouldMock