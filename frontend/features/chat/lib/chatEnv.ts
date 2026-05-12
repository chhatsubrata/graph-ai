export function getChatEnv() {
  return {
    baseUrl: process.env.NEXT_PUBLIC_CHAT_API_URL ?? "http://localhost:5000",
    apiKey: process.env.NEXT_PUBLIC_CHAT_API_KEY ?? "",
    model: process.env.NEXT_PUBLIC_CHAT_MODEL ?? "llama3.2",
  }
}
