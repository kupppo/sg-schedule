export default function now() {
  const mock = process.env.NEXT_PUBLIC_MOCK_NOW
  if (mock) {
    return new Date(mock)
  }
  return new Date()
}
